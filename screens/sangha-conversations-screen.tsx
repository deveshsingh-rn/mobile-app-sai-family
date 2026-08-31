import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { fetchSanghaConversationsRequest } from "@/store/sangha/actions";
import {
  selectSanghaConversations,
  selectSanghaConversationsLoading,
  selectSanghaError,
} from "@/store/sangha/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SanghaConversation } from "@/store/sangha/types";

function avatarForConversation(conversation: SanghaConversation) {
  const participant =
    conversation.participant || conversation.participants?.[0];
  const name = participant?.name || "Sai Family";

  return (
    participant?.profileImageUrl ||
    participant?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=FFF7ED&color=F97316`
  );
}

function nameForConversation(conversation: SanghaConversation) {
  return (
    conversation.participant?.name ||
    conversation.participants?.[0]?.name ||
    "Sai Family Devotee"
  );
}

function timeLabel(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SanghaConversationsScreen() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectSanghaConversations);
  const loading = useAppSelector(selectSanghaConversationsLoading);
  const error = useAppSelector(selectSanghaError);

  useEffect(() => {
    dispatch(fetchSanghaConversationsRequest({ limit: 20, offset: 0 }));
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchSanghaConversationsRequest({ limit: 20, offset: 0 }));
  };

  const openConversation = (conversation: SanghaConversation) => {
    router.push({
      pathname: "/sangha-chat",
      params: {
        conversationId: conversation.id,
        memberName: nameForConversation(conversation),
      },
    } as any);
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#F8F6F2", flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: 14,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderColor: "#EEE7DD",
            borderRadius: 22,
            borderWidth: 1,
            height: 44,
            justifyContent: "center",
            width: 44,
          }}
        >
          <Ionicons name="arrow-back" size={21} color="#2B1308" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{
              color: "#111827",
              fontSize: 26,
              fontWeight: "900",
              letterSpacing: -0.2,
            }}
          >
            Sangha Chats
          </Text>
          <Text
            style={{
              color: "#78716C",
              fontSize: 13,
              fontWeight: "700",
              marginTop: 3,
            }}
          >
            Connected devotees and group conversations
          </Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 32,
        }}
        data={conversations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#F97316"
          />
        }
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderColor: "#EEE7DD",
              borderRadius: 24,
              borderWidth: 1,
              marginTop: 36,
              padding: 24,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#F97316" />
            ) : (
              <>
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: "#FFF7ED",
                    borderRadius: 26,
                    height: 52,
                    justifyContent: "center",
                    width: 52,
                  }}
                >
                  <Ionicons
                    color="#F97316"
                    name="chatbubble-ellipses-outline"
                    size={25}
                  />
                </View>
                <Text
                  style={{
                    color: "#111827",
                    fontSize: 18,
                    fontWeight: "900",
                    marginTop: 15,
                  }}
                >
                  No chats yet
                </Text>
                <Text
                  style={{
                    color: "#78716C",
                    fontSize: 14,
                    fontWeight: "700",
                    lineHeight: 22,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Connect with a devotee first. Once they accept, your chat will appear here.
                </Text>
                {error ? (
                  <Text
                    style={{
                      color: "#B91C1C",
                      fontSize: 13,
                      fontWeight: "800",
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const unreadCount = item.unreadCount || 0;
          const participantName = nameForConversation(item);
          const lastMessage = item.lastMessage?.content || "Say Om Sai Ram";

          return (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => openConversation(item)}
              style={{
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderColor: unreadCount > 0 ? "#FED7AA" : "#EEE7DD",
                borderRadius: 24,
                borderWidth: 1,
                flexDirection: "row",
                marginBottom: 12,
                padding: 14,
              }}
            >
              <Image
                source={{ uri: avatarForConversation(item) }}
                style={{
                  borderRadius: 28,
                  height: 56,
                  width: 56,
                }}
              />
              <View style={{ flex: 1, marginLeft: 13 }}>
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "#111827",
                      flex: 1,
                      fontSize: 16,
                      fontWeight: "900",
                    }}
                  >
                    {participantName}
                  </Text>
                  <Text
                    style={{
                      color: "#A8A29E",
                      fontSize: 11,
                      fontWeight: "800",
                      marginLeft: 8,
                    }}
                  >
                    {timeLabel(item.lastMessageAt)}
                  </Text>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    marginTop: 6,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      color: unreadCount > 0 ? "#44403C" : "#78716C",
                      flex: 1,
                      fontSize: 14,
                      fontWeight: unreadCount > 0 ? "900" : "700",
                    }}
                  >
                    {lastMessage}
                  </Text>
                  {unreadCount > 0 ? (
                    <View
                      style={{
                        alignItems: "center",
                        backgroundColor: "#F97316",
                        borderRadius: 999,
                        height: 22,
                        justifyContent: "center",
                        marginLeft: 8,
                        minWidth: 22,
                        paddingHorizontal: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 11,
                          fontWeight: "900",
                        }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
