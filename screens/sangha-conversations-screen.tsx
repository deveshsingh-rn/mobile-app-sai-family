import React, { useEffect } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { fetchSanghaConversationsRequest } from "@/store/sangha/actions";
import {
  selectSanghaConversations,
  selectSanghaConversationsLoading,
  selectSanghaError,
} from "@/store/sangha/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SanghaConversation } from "@/store/sangha/types";
import { SanghaScreenHeader } from "@/components/sangha/SanghaScreenHeader";
import { SanghaStateView } from "@/components/sangha/SanghaStateView";
import { SanghaColors, SanghaRadius, SanghaShadow } from "@/constants/sangha-theme";

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
    <SafeAreaView style={{ backgroundColor: SanghaColors.background, flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={SanghaColors.background} />
      <SanghaScreenHeader
        onBack={() => router.back()}
        subtitle="Private conversations with connected devotees"
        title="Sangha Chats"
      />

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
          <SanghaStateView
            actionLabel={error ? "Try again" : undefined}
            body={error || "Connect with a devotee first. Once they accept, your chat will appear here."}
            icon="chatbubble-ellipses-outline"
            loading={loading}
            onAction={error ? refresh : undefined}
            title={loading ? "Loading conversations" : "No chats yet"}
          />
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
                backgroundColor: SanghaColors.surface,
                borderColor: unreadCount > 0 ? SanghaColors.saffronBorder : SanghaColors.border,
                borderRadius: SanghaRadius.card,
                borderWidth: 1,
                flexDirection: "row",
                marginBottom: 12,
                padding: 14,
                ...SanghaShadow,
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
                      color: SanghaColors.ink,
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
                      color: unreadCount > 0 ? SanghaColors.ink : SanghaColors.inkSecondary,
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
                        backgroundColor: SanghaColors.saffron,
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
