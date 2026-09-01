import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import {
  fetchSanghaConversationMessagesRequest,
  markSanghaConversationReadRequest,
  queueSanghaConversationMessage,
  receiveSanghaConversationMessage,
  reportSanghaMessageRequest,
  sendSanghaConversationMessageRequest,
  startSanghaConversationRequest,
  updateSanghaConversationMessageStatus,
} from "@/store/sangha/actions";
import {
  selectIsSanghaActionPending,
  selectSanghaActiveConversation,
  selectSanghaConversationMessages,
  selectSanghaConversationMessageCursor,
  selectSanghaConversationMessagesLoading,
  selectSanghaError,
} from "@/store/sangha/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SanghaConversationMessage } from "@/store/sangha/types";
import { apiCreateSanghaChatSession } from "@/services/sangha";
import {
  SanghaColors,
  SanghaRadius,
  SanghaShadow,
  SanghaType,
} from "@/constants/sangha-theme";

function avatarForName(name?: string | null) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Sai Family"
  )}&background=FFF7ED&color=F97316`;
}

export default function SanghaChatScreen() {
  const { conversationId: routeConversationId, groupId, memberId, memberName } =
    useLocalSearchParams<{
    conversationId?: string;
    groupId?: string;
    memberId?: string;
    memberName?: string;
  }>();
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(selectSanghaActiveConversation);
  const conversationId =
    routeConversationId ||
    (memberId && conversation?.participantUserId !== memberId
      ? undefined
      : conversation?.id);
  const messages = useAppSelector((state) =>
    selectSanghaConversationMessages(state, conversationId)
  );
  const messagesLoading = useAppSelector((state) =>
    selectSanghaConversationMessagesLoading(state, conversationId)
  );
  const nextCursor = useAppSelector((state) =>
    selectSanghaConversationMessageCursor(state, conversationId)
  );
  const starting = useAppSelector((state) =>
    selectIsSanghaActionPending(state, memberId)
  );
  const error = useAppSelector(selectSanghaError);
  const [draft, setDraft] = useState("");
  const [socketStatus, setSocketStatus] = useState<
    "connecting" | "connected" | "offline"
  >("offline");
  const [remoteTyping, setRemoteTyping] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const displayName =
    memberName ||
    conversation?.participant?.name ||
    "Sai Family";

  useEffect(() => {
    if (!memberId || routeConversationId) {
      return;
    }

    dispatch(
      startSanghaConversationRequest({
        groupId,
        memberName: displayName,
        participantUserId: memberId,
      })
    );
  }, [dispatch, displayName, groupId, memberId, routeConversationId]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    dispatch(
      fetchSanghaConversationMessagesRequest({
        conversationId,
        limit: 30,
      })
    );
    dispatch(markSanghaConversationReadRequest(conversationId));
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    let cancelled = false;
    let intentionallyClosed = false;

    const clearHeartbeat = () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };

    const clearReconnectTimeout = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const closeSocket = () => {
      intentionallyClosed = true;
      clearHeartbeat();
      clearReconnectTimeout();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
      setRemoteTyping(false);
    };

    const scheduleReconnect = (connect: () => Promise<void>) => {
      if (cancelled || intentionallyClosed || reconnectTimeoutRef.current) {
        return;
      }

      const delay = Math.min(
        1000 * 2 ** reconnectAttemptRef.current,
        15000
      );
      reconnectAttemptRef.current += 1;
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        void connect();
      }, delay);
    };

    const connectSocket = async () => {
      if (
        cancelled ||
        intentionallyClosed ||
        socketRef.current?.readyState === WebSocket.OPEN ||
        socketRef.current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      setSocketStatus("connecting");

      try {
        const session = await apiCreateSanghaChatSession({
          conversationId,
        });

        if (cancelled || !session?.webSocketUrl) {
          return;
        }

        const socket = new WebSocket(session.webSocketUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          clearHeartbeat();
          heartbeatRef.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  id: `${Date.now()}`,
                  type: "ping",
                })
              );
            }
          }, session.heartbeatIntervalMs || 25000);
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(String(event.data));

            if (payload.type === "connected") {
              reconnectAttemptRef.current = 0;
              setSocketStatus("connected");

              if (Array.isArray(payload.messages)) {
                payload.messages.forEach((message: SanghaConversationMessage) => {
                  dispatch(
                    receiveSanghaConversationMessage({
                      conversationId,
                      message,
                    })
                  );
                });
              }

              socket.send(JSON.stringify({ type: "read" }));
              return;
            }

            if (
              payload.type === "message_created" &&
              payload.message
            ) {
              dispatch(
                receiveSanghaConversationMessage({
                  clientMessageId: payload.clientMessageId,
                  conversationId:
                    payload.conversationId || conversationId,
                  message: {
                    ...payload.message,
                    authorAvatarUrl:
                      payload.message.authorAvatarUrl ||
                      payload.message.sender?.profileImageUrl ||
                      payload.message.sender?.avatarUrl,
                    authorName:
                      payload.message.authorName ||
                      payload.message.sender?.name,
                    authorUserId:
                      payload.message.authorUserId ||
                      payload.message.sender?.id ||
                      payload.message.sender?.userId,
                    createdAt:
                      payload.message.createdAt ||
                      payload.message.sentAt,
                  },
                })
              );
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "read" }));
              }
              return;
            }

            if (payload.type === "message_status") {
              dispatch(
                updateSanghaConversationMessageStatus({
                  conversationId:
                    payload.conversationId || conversationId,
                  deliveredAt: payload.deliveredAt,
                  messageIds: payload.messageIds || [],
                  readAt: payload.readAt,
                  status: payload.status,
                })
              );
              return;
            }

            if (payload.type === "typing") {
              setRemoteTyping(Boolean(payload.isTyping));

              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              typingTimeoutRef.current = setTimeout(() => {
                setRemoteTyping(false);
              }, 5000);
              return;
            }

            if (payload.type === "error") {
              console.warn("[SanghaChat] Server event error", {
                code: payload.code,
                message: payload.message,
              });
            }
          } catch (parseError) {
            console.warn("[SanghaChat] Invalid socket event", parseError);
          }
        };

        socket.onerror = (socketError) => {
          console.warn("[SanghaChat] Socket error", socketError);
        };

        socket.onclose = () => {
          if (socketRef.current === socket) {
            socketRef.current = null;
          }
          clearHeartbeat();
          if (cancelled || intentionallyClosed) {
            return;
          }
          setSocketStatus("offline");
          scheduleReconnect(connectSocket);
        };
      } catch (sessionError) {
        console.warn("[SanghaChat] WebSocket unavailable", sessionError);
        setSocketStatus("offline");
        scheduleReconnect(connectSocket);
      }
    };

    void connectSocket();

    return () => {
      cancelled = true;
      closeSocket();
    };
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (!conversationId || socketStatus !== "offline") {
      return undefined;
    }

    const interval = setInterval(() => {
      dispatch(
        fetchSanghaConversationMessagesRequest({
          conversationId,
          limit: 30,
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId, dispatch, socketStatus]);

  const sendMessage = () => {
    const trimmed = draft.trim();

    if (!trimmed || !conversationId) {
      return;
    }

    const clientMessageId =
      `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      dispatch(
        queueSanghaConversationMessage({
          clientMessageId,
          content: trimmed,
          conversationId,
        })
      );
      socketRef.current.send(
        JSON.stringify({
          clientMessageId,
          content: trimmed,
          conversationId,
          type: "message_send",
        })
      );
    } else {
      dispatch(
        sendSanghaConversationMessageRequest({
          content: trimmed,
          conversationId,
        })
      );
    }

    setDraft("");
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);

    if (socketRef.current?.readyState === WebSocket.OPEN && conversationId) {
      socketRef.current.send(
        JSON.stringify({
          conversationId,
          isTyping: Boolean(value.trim()),
          type: "typing",
        })
      );
    }
  };

  const loadOlderMessages = useCallback(() => {
    if (!conversationId || !nextCursor || messagesLoading) {
      return;
    }

    dispatch(
      fetchSanghaConversationMessagesRequest({
        before: nextCursor,
        conversationId,
        limit: 30,
      })
    );
  }, [conversationId, dispatch, messagesLoading, nextCursor]);

  const reportMessage = useCallback(
    (message: SanghaConversationMessage) => {
      if (message.isMine) {
        return;
      }

      const submitReport = (
        reason: "abuse" | "other" | "privacy" | "spam"
      ) => {
        dispatch(
          reportSanghaMessageRequest({
            messageId: message.id,
            note: "Reported from Sangha direct chat",
            reason,
          })
        );
      };

      Alert.alert(
        "Report this message?",
        "Choose the reason. The other devotee will not be notified.",
        [
          { text: "Spam", onPress: () => submitReport("spam") },
          { text: "Abusive content", onPress: () => submitReport("abuse") },
          { text: "Privacy concern", onPress: () => submitReport("privacy") },
          { style: "cancel", text: "Cancel" },
        ]
      );
    },
    [dispatch]
  );

  const retryMessage = useCallback(
    (message: SanghaConversationMessage) => {
      if (
        !conversationId ||
        !message.isMine ||
        message.status !== "failed" ||
        !message.content.trim()
      ) {
        return;
      }

      dispatch(
        sendSanghaConversationMessageRequest({
          content: message.content.trim(),
          conversationId,
        })
      );
    },
    [conversationId, dispatch]
  );

  return (
    <SafeAreaView style={{ backgroundColor: SanghaColors.background, flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={SanghaColors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: SanghaColors.surface,
            borderBottomColor: SanghaColors.border,
            borderBottomWidth: 1,
            flexDirection: "row",
            paddingHorizontal: 18,
            paddingVertical: 14,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.back()}
            style={{
              alignItems: "center",
              backgroundColor: SanghaColors.surfaceMuted,
              borderColor: SanghaColors.border,
              borderRadius: SanghaRadius.control,
              borderWidth: 1,
              height: 42,
              justifyContent: "center",
              width: 42,
            }}
          >
            <Ionicons name="arrow-back" size={21} color={SanghaColors.ink} />
          </TouchableOpacity>

          <Image
            source={{ uri: avatarForName(displayName) }}
            style={{
              borderRadius: 22,
              height: 44,
              marginLeft: 12,
              width: 44,
            }}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              numberOfLines={1}
              style={{ color: SanghaColors.ink, ...SanghaType.cardTitle }}
            >
              {displayName}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: remoteTyping ? SanghaColors.success : SanghaColors.inkSecondary,
                fontSize: 12,
                fontWeight: "700",
                marginTop: 2,
              }}
            >
              {remoteTyping
                ? "typing..."
                : socketStatus === "connected"
                  ? "Live chat"
                  : socketStatus === "connecting"
                    ? "Connecting..."
                    : groupId
                      ? "Sangha member chat"
                      : "Community chat"}
            </Text>
          </View>
          <View style={{ alignItems: "center", backgroundColor: socketStatus === "connected" ? SanghaColors.successSoft : SanghaColors.surfaceMuted, borderRadius: SanghaRadius.round, flexDirection: "row", paddingHorizontal: 9, paddingVertical: 6 }}>
            <View style={{ backgroundColor: socketStatus === "connected" ? SanghaColors.success : SanghaColors.inkTertiary, borderRadius: 4, height: 7, marginRight: 5, width: 7 }} />
            <Text style={{ color: socketStatus === "connected" ? SanghaColors.success : SanghaColors.inkSecondary, fontSize: 11, fontWeight: "800" }}>
              {socketStatus === "connected" ? "Live" : "Offline"}
            </Text>
          </View>
        </View>

        <FlatList
          contentContainerStyle={{ flexGrow: 1, padding: 18 }}
          data={messages}
          inverted
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          keyExtractor={(message) => message.id}
          ListEmptyComponent={
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: SanghaColors.surface,
                borderColor: SanghaColors.border,
                borderRadius: SanghaRadius.card,
                borderWidth: 1,
                maxWidth: "82%",
                paddingHorizontal: 15,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color: SanghaColors.inkSecondary,
                  fontSize: 14,
                  fontWeight: "700",
                  lineHeight: 21,
                }}
              >
                {starting
                  ? "Opening conversation..."
                  : error && !conversationId
                    ? error
                    : "Namaste. Start a respectful conversation with this devotee."}
              </Text>
            </View>
          }
          ListFooterComponent={
            messagesLoading ? (
              <ActivityIndicator color={SanghaColors.saffron} style={{ marginVertical: 16 }} />
            ) : nextCursor ? (
              <Text
                style={{
                  color: "#78716C",
                  fontSize: 12,
                  fontWeight: "700",
                  marginVertical: 12,
                  textAlign: "center",
                }}
              >
                Scroll up to load older messages
              </Text>
            ) : null
          }
          onEndReached={loadOlderMessages}
          onEndReachedThreshold={0.25}
          renderItem={({ item: message }) => (
            <TouchableOpacity
              activeOpacity={message.isMine ? 1 : 0.82}
              delayLongPress={450}
              onPress={() => retryMessage(message)}
              onLongPress={() => reportMessage(message)}
              style={{
                alignSelf: message.isMine ? "flex-end" : "flex-start",
                backgroundColor: message.isMine ? SanghaColors.saffron : SanghaColors.surface,
                borderColor: SanghaColors.border,
                borderRadius: SanghaRadius.card,
                borderWidth: message.isMine ? 0 : 1,
                marginBottom: 10,
                maxWidth: "82%",
                paddingHorizontal: 15,
                paddingVertical: 11,
                ...(message.isMine ? {} : SanghaShadow),
              }}
            >
              <Text
                style={{
                  color: message.isMine ? SanghaColors.surface : SanghaColors.ink,
                  fontSize: 15,
                  fontWeight: "600",
                  lineHeight: 22,
                }}
              >
                {message.content}
              </Text>
              {message.createdAt ? (
                <Text
                  style={{
                    color: message.isMine ? "#FFEDD5" : SanghaColors.inkTertiary,
                    fontSize: 10,
                    fontWeight: "700",
                    marginTop: 5,
                    textAlign: "right",
                  }}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {message.isMine && message.status ? `  ${message.status}` : ""}
                </Text>
              ) : null}
              {message.isMine && message.status === "failed" ? (
                <Text
                  style={{
                    color: "#FEE2E2",
                    fontSize: 11,
                    fontWeight: "800",
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  Tap to retry
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />

        <View
          style={{
            alignItems: "center",
            backgroundColor: SanghaColors.surface,
            borderTopColor: SanghaColors.border,
            borderTopWidth: 1,
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <TextInput
            maxLength={1000}
            multiline
            onChangeText={handleDraftChange}
            onSubmitEditing={sendMessage}
            placeholder="Write a message"
            placeholderTextColor={SanghaColors.inkTertiary}
            style={{
              backgroundColor: SanghaColors.surfaceMuted,
              borderColor: SanghaColors.border,
              borderRadius: SanghaRadius.control,
              borderWidth: 1,
              color: SanghaColors.ink,
              flex: 1,
              fontSize: 15,
              fontWeight: "700",
              height: 44,
              paddingHorizontal: 16,
            }}
            value={draft}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!conversationId || !draft.trim()}
            onPress={sendMessage}
            style={{
              alignItems: "center",
              backgroundColor: conversationId && draft.trim() ? SanghaColors.saffron : SanghaColors.border,
              borderRadius: SanghaRadius.control,
              height: 44,
              justifyContent: "center",
              marginLeft: 10,
              width: 44,
            }}
          >
            <Feather name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
