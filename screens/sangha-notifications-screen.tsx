import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  fetchSanghaNotificationsRequest,
  markSanghaNotificationsReadRequest,
} from "@/store/sangha/actions";
import {
  selectSanghaError,
  selectSanghaNotifications,
  selectSanghaNotificationsLoading,
  selectSanghaNotificationsPagination,
} from "@/store/sangha/selectors";
import { SanghaNotification } from "@/store/sangha/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

function NotificationCard({
  item,
}: {
  item: SanghaNotification;
}) {
  const dispatch = useAppDispatch();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        if (!item.isRead) {
          dispatch(
            markSanghaNotificationsReadRequest({
              notificationIds: [item.id],
            })
          );
        }
      }}
      style={{
        backgroundColor: item.isRead ? "#FFFFFF" : "#FFF7ED",
        borderColor: item.isRead ? "#F1F1F1" : "#FDBA74",
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 14,
        padding: 16,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: item.isRead ? "#F3F4F6" : "#F97316",
            borderRadius: 20,
            height: 40,
            justifyContent: "center",
            width: 40,
          }}
        >
          <Ionicons
            name={item.isRead ? "notifications-outline" : "notifications"}
            size={18}
            color={item.isRead ? "#6B7280" : "#FFFFFF"}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              color: "#1F2937",
              fontSize: 16,
              fontWeight: "900",
            }}
          >
            {item.title || "Sangha update"}
          </Text>
          <Text
            style={{
              color: "#6B7280",
              fontSize: 14,
              fontWeight: "600",
              lineHeight: 21,
              marginTop: 4,
            }}
          >
            {item.body || "You have a new Sangha notification."}
          </Text>
          <Text
            style={{
              color: "#F97316",
              fontSize: 12,
              fontWeight: "800",
              marginTop: 8,
            }}
          >
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SanghaNotificationsScreen() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectSanghaNotifications);
  const loading = useAppSelector(selectSanghaNotificationsLoading);
  const pagination = useAppSelector(selectSanghaNotificationsPagination);
  const error = useAppSelector(selectSanghaError);

  useEffect(() => {
    dispatch(
      fetchSanghaNotificationsRequest({
        limit: 20,
        offset: 0,
        unreadOnly: false,
      })
    );
  }, [dispatch]);

  const markAllRead = () => {
    const notificationIds = notifications
      .filter((item) => !item.isRead)
      .map((item) => item.id);

    if (notificationIds.length) {
      dispatch(markSanghaNotificationsReadRequest({ notificationIds }));
    }
  };

  const loadMore = () => {
    if (loading || !pagination?.hasMore) return;

    dispatch(
      fetchSanghaNotificationsRequest({
        limit: pagination.limit,
        offset:
          pagination.nextOffset ??
          pagination.offset + pagination.limit,
        unreadOnly: false,
      })
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#FAFAF9", flex: 1 }}>
      <StatusBar backgroundColor="#FAFAF9" barStyle="dark-content" />
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingTop: 18,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            height: 44,
            justifyContent: "center",
            width: 44,
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{
              color: "#1F2937",
              fontFamily: "serif",
              fontSize: 25,
              fontWeight: "900",
            }}
          >
            Notifications
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 13, fontWeight: "700" }}>
            Sangha invites, posts, events, and live updates
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} onPress={markAllRead}>
          <Text style={{ color: "#F97316", fontSize: 13, fontWeight: "900" }}>
            Mark read
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 34,
        }}
      >
        {loading && notifications.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <ActivityIndicator color="#F97316" />
            <Text style={{ color: "#6B7280", fontSize: 14, fontWeight: "800", marginTop: 10 }}>
              Loading notifications
            </Text>
          </View>
        ) : null}

        {!loading && error ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              dispatch(
                fetchSanghaNotificationsRequest({
                  limit: 20,
                  offset: 0,
                  unreadOnly: false,
                })
              )
            }
            style={{
              backgroundColor: "#FFF7ED",
              borderColor: "#FDE7CF",
              borderRadius: 22,
              borderWidth: 1,
              marginBottom: 14,
              padding: 16,
            }}
          >
            <Text style={{ color: "#9A3412", fontSize: 14, fontWeight: "900" }}>
              {error}
            </Text>
          </TouchableOpacity>
        ) : null}

        {!loading && notifications.length === 0 && !error ? (
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20 }}>
            <Text style={{ color: "#1F2937", fontSize: 17, fontWeight: "900" }}>
              No notifications yet
            </Text>
            <Text style={{ color: "#6B7280", fontSize: 14, fontWeight: "600", lineHeight: 22, marginTop: 8 }}>
              New Sangha activity will appear here.
            </Text>
          </View>
        ) : null}

        {notifications.map((item) => (
          <NotificationCard key={item.id} item={item} />
        ))}

        {pagination?.hasMore ? (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={loading}
            onPress={loadMore}
            style={{
              alignItems: "center",
              backgroundColor: "#1F2937",
              borderRadius: 18,
              height: 48,
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "900" }}>
                Load more
              </Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
