import React, { useState } from "react";
import {
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

function avatarForName(name?: string | null) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Sai Family"
  )}&background=FFF7ED&color=F97316`;
}

export default function SanghaChatScreen() {
  const { groupId, memberName } = useLocalSearchParams<{
    groupId?: string;
    memberId?: string;
    memberName?: string;
  }>();
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<string[]>([]);
  const displayName = memberName || "Sai Family";

  const sendMessage = () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    setLocalMessages((current) => [...current, trimmed]);
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
              Namaste. Start a respectful conversation with this devotee.
            </Text>
          </View>

          {localMessages.map((message, index) => (
            <View
              key={`${message}-${index}`}
              style={{
                alignSelf: "flex-end",
                backgroundColor: "#F97316",
                borderRadius: 20,
                marginTop: 12,
                maxWidth: "82%",
                paddingHorizontal: 15,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "700",
                  lineHeight: 21,
                }}
              >
                {message}
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
            onPress={sendMessage}
            style={{
              alignItems: "center",
              backgroundColor: draft.trim() ? "#F97316" : "#D1D5DB",
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
