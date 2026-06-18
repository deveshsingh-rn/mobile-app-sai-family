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

import {router} from "expo-router";
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  MapPin,
  Search,
  Trash2,
  Users,
} from "lucide-react-native";

import {
  fetchEventBookmarksRequest,
  unbookmarkEventRequest,
} from "@/store/events/actions";
import {
  selectEventBookmarks,
  selectEventBookmarksLoading,
  selectEventBookmarksPagination,
  selectEventsError,
  selectIsEventBookmarkPending,
} from "@/store/events/selectors";
import {
  SaiEvent,
} from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

const formatDate = (value?: string) => {
  if (!value) {
    return "Date pending";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date pending";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) {
    return "Time pending";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time pending";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getLocation = (event: SaiEvent) =>
  event.venueName ||
  event.city ||
  event.address ||
  "Location pending";

const isUpcoming = (event: SaiEvent) =>
  new Date(event.endAt || event.startAt).getTime() >= Date.now();

export default function EventBookmarksRoute() {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector(selectEventBookmarks);
  const loading = useAppSelector(selectEventBookmarksLoading);
  const pagination = useAppSelector(selectEventBookmarksPagination);
  const error = useAppSelector(selectEventsError);
  const [refreshing, setRefreshing] = useState(false);

  const upcomingCount = useMemo(
    () => bookmarks.filter(isUpcoming).length,
    [bookmarks]
  );
  const totalRsvps = useMemo(
    () =>
      bookmarks.reduce(
        (total, event) => total + (event.rsvps || 0),
        0
      ),
    [bookmarks]
  );

  const fetchBookmarks = useCallback(
    (params: {
      limit?: number;
      offset?: number;
    } = {}) => {
      dispatch(
        fetchEventBookmarksRequest({
          limit: params.limit || 20,
          offset: params.offset || 0,
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    if (!loading && refreshing) {
      setRefreshing(false);
    }
  }, [loading, refreshing]);

  const handleLoadMore = useCallback(() => {
    if (
      !pagination?.hasMore ||
      pagination.nextOffset == null ||
      loading
    ) {
      return;
    }

    fetchBookmarks({
      limit: pagination.limit || 20,
      offset: pagination.nextOffset,
    });
  }, [
    fetchBookmarks,
    loading,
    pagination?.hasMore,
    pagination?.limit,
    pagination?.nextOffset,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerIcon}
        >
          <ArrowLeft color="#1F2937" size={21} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Saved Events</Text>
          <Text style={styles.headerSubtitle}>
            Your bookmarked spiritual gatherings
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/events" as any)}
          style={styles.headerIcon}
        >
          <Search color="#1F2937" size={20} />
        </Pressable>
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
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Bookmark color="#FFFFFF" fill="#FFFFFF" size={24} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              {bookmarks.length} saved event{bookmarks.length === 1 ? "" : "s"}
            </Text>
            <Text style={styles.heroText}>
              {upcomingCount} upcoming · {totalRsvps} devotees attending
            </Text>
          </View>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {loading && !refreshing && !bookmarks.length ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#F97316" />
          </View>
        ) : null}

        <View style={styles.cardsSection}>
          {bookmarks.map((event) => (
            <SavedEventCard key={event.id} event={event} />
          ))}

          {!loading && !bookmarks.length ? (
            <View style={styles.emptyCard}>
              <Bookmark color="#F97316" size={26} />
              <Text style={styles.emptyTitle}>No saved events yet</Text>
              <Text style={styles.emptyText}>
                Bookmark events from the Events hub or detail page and they will appear here.
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/events" as any)}
                style={styles.discoverButton}
              >
                <Search color="#1F2937" size={15} />
                <Text style={styles.discoverText}>Discover Events</Text>
              </Pressable>
            </View>
          ) : null}

          {pagination?.hasMore && pagination.nextOffset != null ? (
            <Pressable
              disabled={loading}
              onPress={handleLoadMore}
              style={[styles.loadMoreButton, loading && styles.disabled]}
            >
              {loading ? (
                <ActivityIndicator color="#1F2937" size="small" />
              ) : null}
              <Text style={styles.loadMoreText}>Load more saved events</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function SavedEventCard({
  event,
}: {
  event: SaiEvent;
}) {
  const dispatch = useAppDispatch();
  const pending = useAppSelector((state) =>
    selectIsEventBookmarkPending(state, event.id)
  );

  const handleRemove = useCallback(() => {
    if (!event.id || pending) {
      return;
    }

    dispatch(unbookmarkEventRequest(event.id));
  }, [dispatch, event.id, pending]);

  return (
    <Pressable
      onPress={() => router.push(`/events/${event.id}` as any)}
      style={styles.eventCard}
    >
      <View style={styles.cardImage}>
        <Text style={styles.cardImageText}>{event.type || "Event"}</Text>
        <View style={styles.savedBadge}>
          <Bookmark color="#FFFFFF" fill="#FFFFFF" size={12} />
          <Text style={styles.savedBadgeText}>Saved</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardCopy}>
            <Text numberOfLines={2} style={styles.cardTitle}>
              {event.title}
            </Text>
            <Text numberOfLines={2} style={styles.cardDescription}>
              {event.description}
            </Text>
          </View>
          <Pressable
            disabled={pending}
            onPress={handleRemove}
            style={[styles.removeButton, pending && styles.disabled]}
          >
            {pending ? (
              <ActivityIndicator color="#6B7280" size="small" />
            ) : (
              <Trash2 color="#6B7280" size={16} />
            )}
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <CalendarDays color="#6B7280" size={14} />
          <Text numberOfLines={1} style={styles.metaText}>
            {formatDate(event.startAt)} · {formatTime(event.startAt)}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <MapPin color="#6B7280" size={14} />
          <Text numberOfLines={1} style={styles.metaText}>
            {getLocation(event)}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.statPill}>
            <Users color="#1F2937" size={13} />
            <Text style={styles.statPillText}>
              {event.rsvps || 0} going
            </Text>
          </View>
          <Text style={styles.openText}>View details</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderColor: "#F6EFD9",
    borderTopWidth: 0,
    borderWidth: 1,
    padding: 14,
  },
  cardCopy: {
    flex: 1,
  },
  cardDescription: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 5,
  },
  cardImage: {
    backgroundColor: "#2B1308",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    height: 132,
    justifyContent: "flex-end",
    overflow: "hidden",
    padding: 14,
  },
  cardImageText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    opacity: 0.92,
    textTransform: "capitalize",
  },
  cardsSection: {
    gap: 16,
    paddingHorizontal: 16,
  },
  cardTitle: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
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
  discoverButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 46,
    paddingHorizontal: 18,
  },
  discoverText: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "900",
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
  eventCard: {
    borderRadius: 22,
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
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
  heroCard: {
    alignItems: "center",
    backgroundColor: "#2B1308",
    borderRadius: 24,
    flexDirection: "row",
    gap: 14,
    margin: 16,
    padding: 18,
  },
  heroCopy: {
    flex: 1,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  heroText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
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
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  metaText: {
    color: "#4B5563",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  openText: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "900",
  },
  removeButton: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  savedBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F97316",
    borderRadius: 14,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: "absolute",
    right: 12,
    top: 12,
  },
  savedBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  statPill: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#F6EFD9",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statPillText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
  },
});
