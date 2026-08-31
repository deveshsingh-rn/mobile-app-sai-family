import React, { useCallback, useEffect, useState } from "react";
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
  reportSanghaMessageRequest,
  sendSanghaConversationMessageRequest,
  startSanghaConversationRequest,
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

function avatarForName(name?: string | null) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Sai Family"
  )}&background=FFF7ED&color=F97316`;
}

export default function SanghaChatScreen() {
  const { groupId, memberId, memberName } = useLocalSearchParams<{
    groupId?: string;
    memberId?: string;
    memberName?: string;
  }>();
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(selectSanghaActiveConversation);
  const conversationId = conversation?.id;
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
  const displayName = memberName || "Sai Family";

  useEffect(() => {
    if (!memberId) {
      return;
    }

    dispatch(
      startSanghaConversationRequest({
        groupId,
        memberName: displayName,
        participantUserId: memberId,
      })
    );
  }, [dispatch, displayName, groupId, memberId]);

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

  const sendMessage = () => {
    const trimmed = draft.trim();

    if (!trimmed || !conversationId) {
      return;
    }

    dispatch(
      sendSanghaConversationMessageRequest({
        content: trimmed,
        conversationId,
      })
    );
    setDraft("");
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

  return (
    <SafeAreaView style={{ backgroundColor: "#F8F6F2", flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderBottomColor: "#EEE7DD",
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
              backgroundColor: "#F3F4F6",
              borderRadius: 21,
              height: 42,
              justifyContent: "center",
              width: 42,
            }}
          >
            <Ionicons name="arrow-back" size={21} color="#2B1308" />
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
              style={{ color: "#111827", fontSize: 17, fontWeight: "900" }}
            >
              {displayName}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: "#6B7280",
                fontSize: 12,
                fontWeight: "700",
                marginTop: 2,
              }}
            >
              {groupId ? "Sangha member chat" : "Community chat"}
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
                backgroundColor: "#FFFFFF",
                borderColor: "#EEE7DD",
                borderRadius: 20,
                borderWidth: 1,
                maxWidth: "82%",
                paddingHorizontal: 15,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color: "#374151",
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
              <ActivityIndicator color="#F97316" style={{ marginVertical: 16 }} />
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
              onLongPress={() => reportMessage(message)}
              style={{
                alignSelf: message.isMine ? "flex-end" : "flex-start",
                backgroundColor: message.isMine ? "#F97316" : "#FFFFFF",
                borderColor: "#EEE7DD",
                borderRadius: 20,
                borderWidth: message.isMine ? 0 : 1,
                marginBottom: 10,
                maxWidth: "82%",
                paddingHorizontal: 15,
                paddingVertical: 11,
              }}
            >
              <Text
                style={{
                  color: message.isMine ? "#FFFFFF" : "#374151",
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
                    color: message.isMine ? "#FFEDD5" : "#A8A29E",
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
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />

        <View
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderTopColor: "#EEE7DD",
            borderTopWidth: 1,
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <TextInput
            maxLength={1000}
            multiline
            onChangeText={setDraft}
            onSubmitEditing={sendMessage}
            placeholder="Write a message"
            placeholderTextColor="#9CA3AF"
            style={{
              backgroundColor: "#F8F6F2",
              borderRadius: 22,
              color: "#111827",
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
              backgroundColor: conversationId && draft.trim() ? "#F97316" : "#D1D5DB",
              borderRadius: 22,
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
