import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react-native";

import {
  checkInEventAttendeeRequest,
  fetchEventAttendeesRequest,
  fetchEventDetailRequest,
} from "@/store/events/actions";
import {
  selectEventAttendees,
  selectEventAttendeesLoading,
  selectEventCheckInPendingIds,
  selectEventDetail,
  selectEventsError,
} from "@/store/events/selectors";
import {EventAttendee} from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

export default function EventAttendeesRoute() {
  const {id} = useLocalSearchParams<{id?: string}>();
  const eventId = Array.isArray(id) ? id[0] : id;
  const dispatch = useAppDispatch();
  const detail = useAppSelector(selectEventDetail);
  const attendeesResult = useAppSelector((state) =>
    selectEventAttendees(state, eventId)
  );
  const attendeesLoading = useAppSelector((state) =>
    selectEventAttendeesLoading(state, eventId)
  );
  const checkInPendingIds = useAppSelector(selectEventCheckInPendingIds);
  const error = useAppSelector(selectEventsError);
  const [refreshing, setRefreshing] = useState(false);

  const attendees = useMemo(
    () => attendeesResult?.attendees || [],
    [attendeesResult?.attendees]
  );
  const pagination = attendeesResult?.pagination;
  const summary = attendeesResult?.summary;

  const eventTitle =
    detail?.id === eventId
      ? detail?.title
      : "Event attendees";

  const fetchAttendees = useCallback(
    (offset = 0) => {
      if (!eventId) {
        return;
      }

      dispatch(fetchEventAttendeesRequest(eventId, {
        limit: 30,
        offset,
      }));
    },
    [dispatch, eventId]
  );

  useEffect(() => {
    if (!eventId) {
      return;
    }

    dispatch(fetchEventDetailRequest(eventId));
    fetchAttendees();
  }, [dispatch, eventId, fetchAttendees]);

  const stats = useMemo(() => {
    const checkedIn =
      summary?.checkedIn ??
      attendees.filter((item) => item.checkedInAt).length;
    const total =
      summary?.total ??
      summary?.going ??
      attendees.length;

    return {
      checkedIn,
      pending: Math.max(total - checkedIn, 0),
      total,
    };
  }, [attendees, summary]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendees();
  }, [fetchAttendees]);

  useEffect(() => {
    if (!attendeesLoading && refreshing) {
      setRefreshing(false);
    }
  }, [attendeesLoading, refreshing]);

  const handleLoadMore = useCallback(() => {
    if (
      !pagination?.hasMore ||
      pagination.nextOffset == null ||
      attendeesLoading
    ) {
      return;
    }

    fetchAttendees(pagination.nextOffset);
  }, [
    attendeesLoading,
    fetchAttendees,
    pagination?.hasMore,
    pagination?.nextOffset,
  ]);

  const handleCheckIn = useCallback(
    (userId?: string) => {
      if (!eventId || !userId) {
        return;
      }

      dispatch(checkInEventAttendeeRequest(eventId, userId));
    },
    [dispatch, eventId]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <ArrowLeft color="#1F2937" size={21} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Attendee Management</Text>
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            {eventTitle}
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Users color="#1F2937" size={20} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#F97316"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <SummaryStat label="Total RSVPs" value={String(stats.total)} />
          <SummaryStat label="Checked in" value={String(stats.checkedIn)} />
          <SummaryStat label="Pending" value={String(stats.pending)} />
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {attendeesLoading && !refreshing && !attendees.length ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#F97316" />
          </View>
        ) : null}

        <View style={styles.list}>
          {attendees.map((attendee) => (
            <AttendeeRow
              attendee={attendee}
              eventId={eventId}
              key={attendee.id || attendee.userId || attendee.user?.id}
              onCheckIn={handleCheckIn}
              pendingIds={checkInPendingIds}
            />
          ))}

          {!attendeesLoading && !attendees.length ? (
            <View style={styles.emptyCard}>
              <Users color="#F97316" size={26} />
              <Text style={styles.emptyTitle}>No attendees yet</Text>
              <Text style={styles.emptyText}>
                RSVP devotees will appear here when they join this event.
              </Text>
            </View>
          ) : null}

          {pagination?.hasMore && pagination.nextOffset != null ? (
            <Pressable
              disabled={attendeesLoading}
              onPress={handleLoadMore}
              style={[styles.loadMoreButton, attendeesLoading && styles.disabled]}
            >
              {attendeesLoading ? (
                <ActivityIndicator color="#1F2937" size="small" />
              ) : null}
              <Text style={styles.loadMoreText}>Load more attendees</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function AttendeeRow({
  attendee,
  eventId,
  onCheckIn,
  pendingIds,
}: {
  attendee: EventAttendee;
  eventId?: string;
  onCheckIn: (userId?: string) => void;
  pendingIds: Record<string, boolean>;
}) {
  const userId = attendee.userId || attendee.user?.id;
  const pending = Boolean(eventId && userId && pendingIds[`${eventId}:${userId}`]);
  const checkedIn = Boolean(attendee.checkedInAt);

  return (
    <View style={styles.attendeeCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(attendee.user?.name || "Devotee").slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.attendeeBody}>
        <Text numberOfLines={1} style={styles.attendeeName}>
          {attendee.user?.name || "Devotee"}
        </Text>
        <View style={styles.attendeeMetaRow}>
          {checkedIn ? (
            <CheckCircle2 color="#16A34A" size={13} />
          ) : (
            <Clock3 color="#6B7280" size={13} />
          )}
          <Text style={styles.attendeeMeta}>
            {checkedIn ? "Checked in" : attendee.status || "Going"}
            {attendee.guestCount ? ` · ${attendee.guestCount} guests` : ""}
          </Text>
        </View>
      </View>
      <Pressable
        disabled={pending || checkedIn || !userId}
        onPress={() => onCheckIn(userId)}
        style={[
          styles.checkInButton,
          checkedIn && styles.checkInButtonDone,
          (pending || !userId) && styles.disabled,
        ]}
      >
        {pending ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <CheckCircle2
            color={checkedIn ? "#1F2937" : "#FFFFFF"}
            size={15}
          />
        )}
        <Text
          style={[
            styles.checkInText,
            checkedIn && styles.checkInTextDone,
          ]}
        >
          {checkedIn ? "Done" : "Check in"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  attendeeBody: {
    flex: 1,
    minWidth: 0,
  },
  attendeeCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 13,
  },
  attendeeMeta: {
    color: "#6B7280",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  attendeeMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 5,
  },
  attendeeName: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "900",
  },
  checkInButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 10,
  },
  checkInButtonDone: {
    backgroundColor: "#F6EFD9",
  },
  checkInText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  checkInTextDone: {
    color: "#1F2937",
  },
  container: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },
  content: {
    paddingBottom: 34,
  },
  disabled: {
    opacity: 0.55,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 6,
    textAlign: "center",
  },
  emptyTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 10,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  header: {
    alignItems: "center",
    backgroundColor: "rgba(250,250,249,0.98)",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingBottom: 13,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerCopy: {
    flex: 1,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  headerTitle: {
    color: "#1F2937",
    fontSize: 19,
    fontWeight: "900",
  },
  list: {
    gap: 12,
    paddingHorizontal: 16,
  },
  loadMoreButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
  },
  loadMoreText: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "900",
  },
  loadingBox: {
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  summaryCard: {
    backgroundColor: "#2B1308",
    borderRadius: 24,
    flexDirection: "row",
    gap: 10,
    margin: 16,
    padding: 16,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center",
  },
  summaryStat: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    flex: 1,
    paddingVertical: 13,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
});
