import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  sendSanghaConversationMessageRequest,
  startSanghaConversationRequest,
} from "@/store/sangha/actions";
import {
  selectIsSanghaActionPending,
  selectSanghaActiveConversation,
  selectSanghaConversationMessages,
  selectSanghaConversationMessagesLoading,
  selectSanghaError,
} from "@/store/sangha/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

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

        <View style={{ flex: 1, justifyContent: "flex-end", padding: 18 }}>
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

          {messagesLoading ? (
            <ActivityIndicator
              color="#F97316"
              style={{ marginTop: 16 }}
            />
          ) : null}

          {messages.map((message, index) => (
            <View
              key={message.id || `${message.content}-${index}`}
              style={{
                alignSelf: message.isMine ? "flex-end" : "flex-start",
                backgroundColor: message.isMine ? "#F97316" : "#FFFFFF",
                borderColor: "#EEE7DD",
                borderWidth: message.isMine ? 0 : 1,
                borderRadius: 20,
                marginTop: 12,
                maxWidth: "82%",
                paddingHorizontal: 15,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color: message.isMine ? "#FFFFFF" : "#374151",
                  fontSize: 14,
                  fontWeight: "700",
                  lineHeight: 21,
                }}
              >
                {message.content}
              </Text>
            </View>
          ))}
        </View>

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
