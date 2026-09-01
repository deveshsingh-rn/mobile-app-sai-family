import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  acceptSanghaConnectionRequest,
  acceptSanghaInvitationRequest,
  declineSanghaConnectionRequest,
  declineSanghaInvitationRequest,
  disconnectSanghaDevoteeRequest,
  fetchSanghaConnectionsRequest,
  fetchSanghaInvitationsRequest,
} from "@/store/sangha/actions";
import {
  selectIsSanghaActionPending,
  selectSanghaError,
  selectSanghaReceivedConnections,
  selectSanghaReceivedConnectionsLoading,
  selectSanghaReceivedConnectionsPagination,
  selectSanghaSentConnections,
  selectSanghaSentConnectionsLoading,
  selectSanghaSentConnectionsPagination,
  selectSanghaUserInvitations,
  selectSanghaUserInvitationsLoading,
  selectSanghaUserInvitationsPagination,
} from "@/store/sangha/selectors";
import type {
  SanghaConnectionRequestItem,
  SanghaInvitation,
} from "@/store/sangha/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type RequestTab = "received" | "sent" | "invitations";
type RequestListItem =
  | { kind: "connection"; value: SanghaConnectionRequestItem }
  | { kind: "invitation"; value: SanghaInvitation };

const tabs: { icon: keyof typeof Ionicons.glyphMap; label: string; value: RequestTab }[] = [
  { icon: "person-add-outline", label: "Received", value: "received" },
  { icon: "paper-plane-outline", label: "Sent", value: "sent" },
  { icon: "people-outline", label: "Group Invites", value: "invitations" },
];

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value?: string) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

function avatarUri(item: SanghaConnectionRequestItem) {
  const devotee = item.devotee;
  return (
    devotee.avatarUrl ||
    devotee.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      devotee.name || "Sai Devotee"
    )}&background=FFF4E8&color=9A3412`
  );
}

function inviteAvatarUri(item: SanghaInvitation) {
  const devotee = item.invitedBy;
  return (
    devotee?.avatarUrl ||
    devotee?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      devotee?.name || "Sai Family"
    )}&background=FFF4E8&color=9A3412`
  );
}

function ConnectionCard({
  focused,
  item,
}: {
  focused: boolean;
  item: SanghaConnectionRequestItem;
}) {
  const dispatch = useAppDispatch();
  const devoteeId = item.devotee.userId || item.devotee.id || "";
  const pending = useAppSelector((state) =>
    selectIsSanghaActionPending(state, devoteeId)
  );
  const received = item.direction === "received";

  const openProfile = () => {
    if (!devoteeId) return;
    router.push({
      pathname: "/sangha-profile",
      params: { connectionId: item.connectionId, id: devoteeId },
    });
  };

  const decline = () => {
    if (!devoteeId || pending) return;
    Alert.alert(
      received ? "Decline connection request?" : "Cancel sent request?",
      received
        ? "The devotee can send another request later."
        : "You can send a new connection request later.",
      [
        { style: "cancel", text: "Keep request" },
        {
          onPress: () =>
            received
              ? dispatch(
                  declineSanghaConnectionRequest({
                    connectionId: item.connectionId,
                    devoteeId,
                  })
                )
              : dispatch(disconnectSanghaDevoteeRequest(devoteeId)),
          style: "destructive",
          text: received ? "Decline" : "Cancel request",
        },
      ]
    );
  };

  return (
    <View style={[styles.card, focused && styles.focusedCard]}>
      {focused ? <Text style={styles.focusLabel}>Opened from notification</Text> : null}
      <Pressable accessibilityRole="button" onPress={openProfile} style={styles.identityRow}>
        <Image source={{ uri: avatarUri(item) }} style={styles.avatar} />
        <View style={styles.identityCopy}>
          <Text numberOfLines={1} style={styles.name}>{item.devotee.name}</Text>
          <Text numberOfLines={2} style={styles.meta}>
            {item.devotee.approximateLocationLabel ||
              item.devotee.tradition ||
              "Sai Family devotee"}
          </Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <Ionicons color="#78716C" name="chevron-forward" size={22} />
      </Pressable>

      <View style={styles.actionRow}>
        {received ? (
          <Pressable
            accessibilityRole="button"
            disabled={pending || !item.canAccept}
            onPress={() =>
              dispatch(
                acceptSanghaConnectionRequest({
                  connectionId: item.connectionId,
                  devoteeId,
                })
              )
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              (pending || !item.canAccept) && styles.disabled,
            ]}
          >
            {pending ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons color="#FFFFFF" name="checkmark" size={20} />}
            <Text style={styles.primaryButtonText}>Accept</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={decline}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
            pending && styles.disabled,
          ]}
        >
          <Ionicons color="#57534E" name={received ? "close" : "trash-outline"} size={19} />
          <Text style={styles.secondaryButtonText}>{received ? "Decline" : "Cancel"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function InvitationCard({ focused, item }: { focused: boolean; item: SanghaInvitation }) {
  const dispatch = useAppDispatch();
  const pending = useAppSelector((state) => selectIsSanghaActionPending(state, item.id));

  return (
    <View style={[styles.card, focused && styles.focusedCard]}>
      {focused ? <Text style={styles.focusLabel}>Opened from notification</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          const groupId = item.group?.id || item.groupId;
          if (groupId) router.push({ pathname: "/group-details", params: { id: groupId } });
        }}
        style={styles.identityRow}
      >
        <Image source={{ uri: inviteAvatarUri(item) }} style={styles.avatar} />
        <View style={styles.identityCopy}>
          <Text numberOfLines={1} style={styles.name}>{item.group?.name || "Sangha Group"}</Text>
          <Text numberOfLines={2} style={styles.meta}>
            Invited by {item.invitedBy?.name || "Sai Family"}
          </Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <Ionicons color="#78716C" name="chevron-forward" size={22} />
      </Pressable>
      {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={() => dispatch(acceptSanghaInvitationRequest(item.id))}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, pending && styles.disabled]}
        >
          {pending ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons color="#FFFFFF" name="checkmark" size={20} />}
          <Text style={styles.primaryButtonText}>Join group</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={() =>
            Alert.alert("Decline group invitation?", "You can be invited again later.", [
              { style: "cancel", text: "Keep invitation" },
              {
                onPress: () => dispatch(declineSanghaInvitationRequest(item.id)),
                style: "destructive",
                text: "Decline",
              },
            ])
          }
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, pending && styles.disabled]}
        >
          <Ionicons color="#57534E" name="close" size={19} />
          <Text style={styles.secondaryButtonText}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SanghaRequestsScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    connectionId?: string | string[];
    invitationId?: string | string[];
    tab?: string | string[];
  }>();
  const requestedTab = firstParam(params.tab);
  const [activeTab, setActiveTab] = useState<RequestTab>(
    requestedTab === "sent" || requestedTab === "invitations" ? requestedTab : "received"
  );
  const focusedConnectionId = firstParam(params.connectionId);
  const focusedInvitationId = firstParam(params.invitationId);
  const received = useAppSelector(selectSanghaReceivedConnections);
  const sent = useAppSelector(selectSanghaSentConnections);
  const invitations = useAppSelector(selectSanghaUserInvitations);
  const receivedLoading = useAppSelector(selectSanghaReceivedConnectionsLoading);
  const sentLoading = useAppSelector(selectSanghaSentConnectionsLoading);
  const invitationsLoading = useAppSelector(selectSanghaUserInvitationsLoading);
  const receivedPagination = useAppSelector(selectSanghaReceivedConnectionsPagination);
  const sentPagination = useAppSelector(selectSanghaSentConnectionsPagination);
  const invitationsPagination = useAppSelector(selectSanghaUserInvitationsPagination);
  const error = useAppSelector(selectSanghaError);

  const refresh = useCallback(() => {
    if (activeTab === "invitations") {
      dispatch(fetchSanghaInvitationsRequest({ limit: 20, offset: 0, status: "pending" }));
      return;
    }
    dispatch(fetchSanghaConnectionsRequest({ direction: activeTab, limit: 20, offset: 0, status: "pending" }));
  }, [activeTab, dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const items = useMemo<RequestListItem[]>(() => {
    if (activeTab === "invitations") {
      return [...invitations]
        .sort((a, b) => (a.id === focusedInvitationId ? -1 : b.id === focusedInvitationId ? 1 : 0))
        .map((value) => ({ kind: "invitation", value }));
    }
    const source = activeTab === "received" ? received : sent;
    return [...source]
      .sort((a, b) => (a.connectionId === focusedConnectionId ? -1 : b.connectionId === focusedConnectionId ? 1 : 0))
      .map((value) => ({ kind: "connection", value }));
  }, [activeTab, focusedConnectionId, focusedInvitationId, invitations, received, sent]);

  const loading = activeTab === "received" ? receivedLoading : activeTab === "sent" ? sentLoading : invitationsLoading;
  const pagination = activeTab === "received" ? receivedPagination : activeTab === "sent" ? sentPagination : invitationsPagination;

  const loadMore = () => {
    if (loading || !pagination?.hasMore) return;
    const offset = pagination.nextOffset ?? pagination.offset + pagination.limit;
    if (activeTab === "invitations") {
      dispatch(fetchSanghaInvitationsRequest({ limit: pagination.limit, offset, status: "pending" }));
      return;
    }
    dispatch(fetchSanghaConnectionsRequest({ direction: activeTab, limit: pagination.limit, offset, status: "pending" }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color="#292524" name="arrow-back" size={23} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Sangha Requests</Text>
          <Text style={styles.subtitle}>Manage connections and group invitations</Text>
        </View>
        <Pressable accessibilityLabel="Open notifications" accessibilityRole="button" onPress={() => router.push("/sangha-notifications")} style={styles.iconButton}>
          <Ionicons color="#292524" name="notifications-outline" size={22} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const selected = tab.value === activeTab;
          const count = tab.value === "received" ? received.length : tab.value === "sent" ? sent.length : invitations.length;
          return (
            <Pressable key={tab.value} onPress={() => setActiveTab(tab.value)} style={[styles.tab, selected && styles.selectedTab]}>
              <Ionicons color={selected ? "#9A3412" : "#78716C"} name={tab.icon} size={19} />
              <Text numberOfLines={2} style={[styles.tabText, selected && styles.selectedTabText]}>{tab.label}</Text>
              {count > 0 ? <Text style={[styles.count, selected && styles.selectedCount]}>{count > 99 ? "99+" : count}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <FlatList
        contentContainerStyle={[styles.listContent, items.length === 0 && styles.emptyListContent]}
        data={items}
        keyExtractor={(item) => item.kind === "connection" ? item.value.connectionId : item.value.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        refreshControl={<RefreshControl refreshing={loading && items.length > 0} onRefresh={refresh} tintColor="#D96A3D" />}
        renderItem={({ item }) =>
          item.kind === "connection" ? (
            <ConnectionCard focused={item.value.connectionId === focusedConnectionId} item={item.value} />
          ) : (
            <InvitationCard focused={item.value.id === focusedInvitationId} item={item.value} />
          )
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#D96A3D" size="large" />
              <Text style={styles.stateTitle}>Loading requests</Text>
            </View>
          ) : (
            <View style={styles.centerState}>
              <View style={styles.emptyIcon}><Ionicons color="#D96A3D" name="checkmark-circle-outline" size={34} /></View>
              <Text style={styles.stateTitle}>You are all caught up</Text>
              <Text style={styles.stateBody}>
                {activeTab === "received" ? "New connection requests will appear here." : activeTab === "sent" ? "Requests you send will appear here." : "New group invitations will appear here."}
              </Text>
              {error ? <Pressable onPress={refresh} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></Pressable> : null}
            </View>
          )
        }
        ListFooterComponent={loading && items.length > 0 ? <ActivityIndicator color="#D96A3D" style={styles.footerLoader} /> : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  avatar: { backgroundColor: "#F5F5F4", borderRadius: 31, height: 62, width: 62 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#EEE9E2", borderRadius: 22, borderWidth: 1, marginBottom: 14, padding: 16 },
  centerState: { alignItems: "center", maxWidth: 310, paddingHorizontal: 24 },
  count: { backgroundColor: "#E7E5E4", borderRadius: 10, color: "#57534E", fontSize: 11, fontWeight: "900", minWidth: 20, overflow: "hidden", paddingHorizontal: 5, paddingVertical: 2, textAlign: "center" },
  date: { color: "#A8A29E", fontSize: 12, fontWeight: "700", marginTop: 7 },
  disabled: { opacity: 0.5 },
  emptyIcon: { alignItems: "center", backgroundColor: "#FFF4E8", borderRadius: 30, height: 60, justifyContent: "center", marginBottom: 16, width: 60 },
  emptyListContent: { flexGrow: 1, justifyContent: "center" },
  focusLabel: { alignSelf: "flex-start", backgroundColor: "#FFF4E8", borderRadius: 9, color: "#9A3412", fontSize: 12, fontWeight: "900", marginBottom: 13, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5 },
  focusedCard: { borderColor: "#F97316", borderWidth: 2 },
  footerLoader: { marginVertical: 18 },
  header: { alignItems: "center", flexDirection: "row", paddingBottom: 14, paddingHorizontal: 18, paddingTop: 10 },
  headerCopy: { flex: 1, marginHorizontal: 12 },
  iconButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#EEE9E2", borderRadius: 22, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  identityCopy: { flex: 1, marginHorizontal: 13 },
  identityRow: { alignItems: "center", flexDirection: "row" },
  listContent: { paddingBottom: 36, paddingHorizontal: 16, paddingTop: 14 },
  message: { backgroundColor: "#FAFAF9", borderRadius: 14, color: "#57534E", fontSize: 14, fontWeight: "600", lineHeight: 21, marginTop: 14, padding: 12 },
  meta: { color: "#78716C", fontSize: 14, fontWeight: "600", lineHeight: 20, marginTop: 4 },
  name: { color: "#292524", fontSize: 18, fontWeight: "900" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  primaryButton: { alignItems: "center", backgroundColor: "#D96A3D", borderRadius: 15, flex: 1, flexDirection: "row", gap: 7, height: 50, justifyContent: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  retryButton: { backgroundColor: "#292524", borderRadius: 14, marginTop: 18, paddingHorizontal: 22, paddingVertical: 12 },
  retryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  safeArea: { backgroundColor: "#FAFAF9", flex: 1 },
  secondaryButton: { alignItems: "center", backgroundColor: "#F5F5F4", borderColor: "#E7E5E4", borderRadius: 15, borderWidth: 1, flex: 1, flexDirection: "row", gap: 7, height: 50, justifyContent: "center" },
  secondaryButtonText: { color: "#57534E", fontSize: 15, fontWeight: "900" },
  selectedCount: { backgroundColor: "#FED7AA", color: "#9A3412" },
  selectedTab: { backgroundColor: "#FFF4E8", borderColor: "#FED7AA" },
  selectedTabText: { color: "#9A3412" },
  stateBody: { color: "#78716C", fontSize: 15, fontWeight: "600", lineHeight: 23, marginTop: 8, textAlign: "center" },
  stateTitle: { color: "#292524", fontSize: 19, fontWeight: "900", marginTop: 12, textAlign: "center" },
  subtitle: { color: "#78716C", fontSize: 12, fontWeight: "700", marginTop: 3 },
  tab: { alignItems: "center", borderColor: "transparent", borderRadius: 15, borderWidth: 1, flex: 1, flexDirection: "row", gap: 5, justifyContent: "center", minHeight: 52, paddingHorizontal: 6 },
  tabs: { backgroundColor: "#FFFFFF", borderColor: "#EEE9E2", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 4, marginHorizontal: 16, padding: 4 },
  tabText: { color: "#78716C", flexShrink: 1, fontSize: 12, fontWeight: "800", textAlign: "center" },
  title: { color: "#292524", fontSize: 23, fontWeight: "900" },
});
