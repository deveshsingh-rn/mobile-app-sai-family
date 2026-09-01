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
import { getSanghaNotificationDestination } from "@/utils/sangha-notification-routing";
import { SanghaScreenHeader } from "@/components/sangha/SanghaScreenHeader";
import { SanghaStateView } from "@/components/sangha/SanghaStateView";
import { SanghaColors, SanghaRadius, SanghaShadow, SanghaType } from "@/constants/sangha-theme";

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
  const destination = getSanghaNotificationDestination(
    item as unknown as Record<string, unknown>
  );

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

        if (destination) {
          router.push(destination as never);
        }
      }}
      style={{
        backgroundColor: item.isRead ? SanghaColors.surface : SanghaColors.saffronSoft,
        borderColor: item.isRead ? SanghaColors.border : SanghaColors.saffronBorder,
        borderRadius: SanghaRadius.card,
        borderWidth: 1,
        marginBottom: 12,
        padding: 16,
        ...SanghaShadow,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: item.isRead ? SanghaColors.surfaceMuted : SanghaColors.saffron,
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
              color: SanghaColors.ink,
              ...SanghaType.cardTitle,
            }}
          >
            {item.title || "Sangha update"}
          </Text>
          <Text
            style={{
              color: SanghaColors.inkSecondary,
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
              color: SanghaColors.saffron,
              fontSize: 12,
              fontWeight: "800",
              marginTop: 8,
            }}
          >
            {formatDate(item.createdAt)}
          </Text>
          {destination ? (
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: SanghaColors.saffronPressed,
                  fontSize: 13,
                  fontWeight: "900",
                }}
              >
                Open and respond
              </Text>
              <Ionicons
                color={SanghaColors.saffronPressed}
                name="chevron-forward"
                size={15}
                style={{ marginLeft: 3 }}
              />
            </View>
          ) : null}
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
    <SafeAreaView style={{ backgroundColor: SanghaColors.background, flex: 1 }}>
      <StatusBar backgroundColor={SanghaColors.background} barStyle="dark-content" />
      <SanghaScreenHeader
        onBack={() => router.back()}
        right={
          <TouchableOpacity activeOpacity={0.75} onPress={markAllRead} style={{ minHeight: 44, justifyContent: "center" }}>
            <Text style={{ color: SanghaColors.saffron, fontSize: 13, fontWeight: "800" }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        }
        subtitle="Invites, events and community updates"
        title="Notifications"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 34,
        }}
      >
        {loading && notifications.length === 0 ? (
          <SanghaStateView loading title="Loading notifications" />
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
          <SanghaStateView
            body="New Sangha activity will appear here."
            icon="notifications-outline"
            title="No notifications yet"
          />
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
