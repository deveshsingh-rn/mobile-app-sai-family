import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Linking,
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
  Bell,
  Bookmark,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  Clock3,
  Edit3,
  Filter,
  History,
  MapPin,
  Navigation,
  Plus,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react-native";

import {
  fetchMyEventsRequest,
  fetchMyRsvpsRequest,
} from "@/store/events/actions";
import {
  selectEventsError,
  selectEventsLoading,
  selectMyEventRsvps,
  selectMyEventRsvpsPagination,
  selectMyEvents,
  selectMyEventsPagination,
} from "@/store/events/selectors";
import {
  EventPagination,
  SaiEvent,
} from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

type MyEventsTab = "attending" | "posted";
type EventFilter = "all" | "upcoming" | "past" | "nearby";

type DisplayEvent = {
  attendees: string;
  badge: string;
  bookmarked?: boolean;
  date: string;
  host?: string;
  id?: string;
  imageLabel: string;
  location: string;
  muted?: boolean;
  official?: boolean;
  primaryAction: string;
  source: SaiEvent;
  title: string;
};

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

const isPastEvent = (event: SaiEvent) =>
  new Date(event.endAt || event.startAt).getTime() < Date.now();

const getEventBadge = (
  event: SaiEvent,
  mode: MyEventsTab
) => {
  if (event.status === "live") {
    return "LIVE NOW";
  }

  if (isPastEvent(event)) {
    return mode === "posted" ? "Completed" : "Past";
  }

  return mode === "posted" ? "Posted" : "Upcoming";
};

const getEventLocation = (event: SaiEvent) =>
  event.venueName || event.city || event.address || "Location pending";

const toDisplayEvent = (
  event: SaiEvent,
  mode: MyEventsTab
): DisplayEvent => ({
  attendees:
    mode === "posted"
      ? `${event.rsvps || 0} RSVPs · ${event.comments || 0} comments`
      : `${event.rsvps || 0} devotees attending`,
  badge: getEventBadge(event, mode),
  bookmarked: event.bookmarkedByMe || event.rsvpedByMe,
  date: `${formatDate(event.startAt)} · ${formatTime(event.startAt)}`,
  host: event.ownerName || "Verified Host",
  id: event.id,
  imageLabel: event.type || "Event",
  location: getEventLocation(event),
  muted: isPastEvent(event),
  official: Boolean(event.permissions?.canManageAttendees),
  primaryAction: mode === "posted" ? "Manage Event" : "View Details",
  source: event,
  title: event.title,
});

const applyFilter = (
  events: SaiEvent[],
  filter: EventFilter
) => {
  if (filter === "upcoming") {
    return events.filter((event) => !isPastEvent(event));
  }

  if (filter === "past") {
    return events.filter(isPastEvent);
  }

  if (filter === "nearby") {
    return events.filter((event) => event.distanceKm != null);
  }

  return events;
};

const sumRsvps = (events: SaiEvent[]) =>
  events.reduce((total, event) => total + (event.rsvps || 0), 0);

const getNextEvent = (events: SaiEvent[]) =>
  [...events]
    .filter((event) => !isPastEvent(event))
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() -
        new Date(b.startAt).getTime()
    )[0];

const getRelativeStart = (event: SaiEvent) => {
  const diff = new Date(event.startAt).getTime() - Date.now();
  const minutes = Math.max(0, Math.round(diff / 60000));

  if (minutes < 60) {
    return `In ${minutes} min`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `In ${hours} hr`;
  }

  return `In ${Math.round(hours / 24)} days`;
};

export default function MyEventsRoute() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const myEvents = useAppSelector(selectMyEvents);
  const myEventsPagination = useAppSelector(selectMyEventsPagination);
  const rsvps = useAppSelector(selectMyEventRsvps);
  const rsvpPagination = useAppSelector(selectMyEventRsvpsPagination);
  const [activeTab, setActiveTab] = useState<MyEventsTab>("attending");
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    dispatch(fetchMyRsvpsRequest({limit: 20, offset: 0}));
    dispatch(fetchMyEventsRequest({limit: 20, offset: 0}));
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const attendingEvents = useMemo(
    () =>
      applyFilter(rsvps, activeFilter).map((event) =>
        toDisplayEvent(event, "attending")
      ),
    [activeFilter, rsvps]
  );

  const postedEvents = useMemo(
    () =>
      applyFilter(myEvents, activeFilter).map((event) =>
        toDisplayEvent(event, "posted")
      ),
    [activeFilter, myEvents]
  );

  const visibleEvents = activeTab === "attending" ? attendingEvents : postedEvents;
  const nextRsvpEvent = useMemo(() => getNextEvent(rsvps), [rsvps]);
  const postedUpcomingCount = useMemo(
    () => myEvents.filter((event) => !isPastEvent(event)).length,
    [myEvents]
  );
  const rsvpUpcomingCount = useMemo(
    () => rsvps.filter((event) => !isPastEvent(event)).length,
    [rsvps]
  );
  const activePagination: EventPagination | null | undefined =
    activeTab === "posted" ? myEventsPagination : rsvpPagination;
  const canLoadMore = Boolean(
    activePagination?.hasMore &&
      activePagination.nextOffset != null &&
      !loading
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
    setTimeout(() => setRefreshing(false), 700);
  }, [fetchData]);

  useEffect(() => {
    if (!loading && refreshing) {
      setRefreshing(false);
    }
  }, [loading, refreshing]);

  const handleLoadMore = useCallback(() => {
    if (!canLoadMore) {
      return;
    }

    const params = {
      limit: activePagination?.limit || 20,
      offset: activePagination?.nextOffset || 0,
    };

    dispatch(
      activeTab === "posted"
        ? fetchMyEventsRequest(params)
        : fetchMyRsvpsRequest(params)
    );
  }, [
    activePagination?.limit,
    activePagination?.nextOffset,
    activeTab,
    canLoadMore,
    dispatch,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <ArrowLeft color="#1F2937" size={21} />
        </Pressable>
        <Text style={styles.headerTitle}>My Events</Text>
        <Pressable
          onPress={() => router.push("/events/create" as any)}
          style={styles.headerIcon}
        >
          <Plus color="#1F2937" size={20} />
        </Pressable>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#F97316"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabPanel}>
          <View style={styles.segmented}>
            <TabButton
              active={activeTab === "attending"}
              label="I'm Attending"
              onPress={() => setActiveTab("attending")}
            />
            <TabButton
              active={activeTab === "posted"}
              label="My Posted Events"
              onPress={() => setActiveTab("posted")}
            />
          </View>

          <View style={styles.statsRow}>
            <StatMini
              icon={<CalendarCheck color="#FFFFFF" size={14} />}
              label={activeTab === "attending" ? "Total Commitments" : "Total Events"}
              value={
                activeTab === "attending"
                  ? `${rsvps.length} Events`
                  : `${myEvents.length} Events`
              }
            />
            <StatMini
              icon={<Clock3 color="#FFFFFF" size={14} />}
              label={activeTab === "attending" ? "Upcoming" : "Total RSVPs"}
              value={
                activeTab === "attending"
                  ? `${rsvpUpcomingCount} Soon`
                  : `${sumRsvps(myEvents)} RSVPs`
              }
            />
          </View>
        </View>

        <FilterBar
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {activeTab === "attending" ? (
          nextRsvpEvent ? <UrgentAlert event={nextRsvpEvent} /> : null
        ) : (
          <PostedStats
            events={myEvents.length}
            rsvps={sumRsvps(myEvents)}
            upcoming={postedUpcomingCount}
          />
        )}

        {loading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#F97316" />
          </View>
        ) : null}

        <View style={styles.cardsSection}>
          {visibleEvents.map((event, index) => (
            <MyEventCard
              key={`${event.title}-${index}`}
              event={event}
              mode={activeTab}
            />
          ))}
          {!loading && !visibleEvents.length && (
            <EmptyState
              text={
                activeTab === "attending"
                  ? "Your RSVP events from backend will appear here."
                  : "Events created by you will appear here."
              }
            />
          )}
          {canLoadMore && (
            <Pressable
              onPress={handleLoadMore}
              style={styles.loadMoreButton}
            >
              <Text style={styles.loadMoreText}>Load more</Text>
            </Pressable>
          )}
        </View>

        <QuickActions />
      </ScrollView>
    </View>
  );
}

function TabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function StatMini({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statMini}>
      <View style={styles.statMiniIcon}>{icon}</View>
      <View>
        <Text style={styles.statMiniLabel}>{label}</Text>
        <Text style={styles.statMiniValue}>{value}</Text>
      </View>
    </View>
  );
}

function FilterBar({
  activeFilter,
  onChange,
}: {
  activeFilter: EventFilter;
  onChange: (filter: EventFilter) => void;
}) {
  const filters = [
    {icon: Filter, key: "all" as const, label: "All Events"},
    {icon: Clock3, key: "upcoming" as const, label: "Upcoming"},
    {icon: History, key: "past" as const, label: "Past"},
    {icon: MapPin, key: "nearby" as const, label: "Nearby"},
  ];

  return (
    <View style={styles.filterWrap}>
      <ScrollView
        contentContainerStyle={styles.filterContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {filters.map((filter) => {
          const Icon = filter.icon;
          const active = activeFilter === filter.key;

          return (
            <Pressable
              key={filter.label}
              onPress={() => onChange(filter.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Icon color={active ? "#FFFFFF" : "#6B7280"} size={13} />
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function UrgentAlert({
  event,
}: {
  event: SaiEvent;
}) {
  const openDirections = () => {
    const destination =
      event.latitude && event.longitude
        ? `${event.latitude},${event.longitude}`
        : encodeURIComponent(getEventLocation(event));

    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destination}`);
  };

  return (
    <View style={styles.alertWrap}>
      <View style={styles.alertCard}>
        <View style={styles.alertIcon}>
          <Bell color="#FFFFFF" size={22} />
        </View>
        <View style={styles.alertBody}>
          <View style={styles.alertMetaRow}>
            <Text style={styles.alertBadge}>HAPPENING SOON</Text>
            <Text style={styles.alertTime}>{getRelativeStart(event)}</Text>
          </View>
          <Text style={styles.alertTitle}>{event.title}</Text>
          <Text style={styles.alertText}>
            {formatDate(event.startAt)} · {formatTime(event.startAt)} ·{" "}
            {getEventLocation(event)}
          </Text>
          <View style={styles.alertActions}>
            <Pressable
              onPress={openDirections}
              style={styles.alertPrimary}
            >
              <Navigation color="#2B1308" size={14} />
              <Text style={styles.alertPrimaryText}>Get Directions</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/events/${event.id}` as any)}
              style={styles.alertSecondary}
            >
              <CalendarCheck color="#FFFFFF" size={15} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function PostedStats({
  events,
  rsvps,
  upcoming,
}: {
  events: number;
  rsvps: number;
  upcoming: number;
}) {
  return (
    <View style={styles.postedStats}>
      <PostedStat icon={<CalendarCheck color="#F97316" size={19} />} label="Total Events" value={String(events)} />
      <PostedStat icon={<Users color="#F97316" size={19} />} label="Total RSVPs" value={String(rsvps)} />
      <PostedStat icon={<Star color="#F97316" size={19} />} label="Upcoming" value={String(upcoming)} />
    </View>
  );
}

function PostedStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.postedStatCard}>
      <View style={styles.postedStatIcon}>{icon}</View>
      <Text style={styles.postedStatValue}>{value}</Text>
      <Text style={styles.postedStatLabel}>{label}</Text>
    </View>
  );
}

function MyEventCard({
  event,
  mode,
}: {
  event: DisplayEvent;
  mode: MyEventsTab;
}) {
  return (
    <Pressable
      onPress={() => {
        if (event.id) {
          router.push(`/events/${event.id}` as any);
        }
      }}
      style={[styles.eventCard, event.muted && styles.eventCardMuted]}
    >
      <View style={styles.cardImage}>
        <Text style={styles.cardImageText}>{event.imageLabel}</Text>
        <View style={[styles.statusBadge, event.muted && styles.statusBadgeMuted]}>
          {event.badge === "LIVE NOW" ? <View style={styles.liveDot} /> : null}
          <Text style={styles.statusText}>{event.badge}</Text>
        </View>
        <View style={styles.bookmarkBubble}>
          {mode === "posted" ? (
            <Edit3 color="#1F2937" size={15} />
          ) : (
            <Bookmark
              color="#1F2937"
              fill={event.bookmarked ? "#1F2937" : "transparent"}
              size={15}
            />
          )}
        </View>
        <View style={styles.dateOverlay}>
          <CalendarClock color="#1F2937" size={13} />
          <Text numberOfLines={1} style={styles.dateOverlayText}>{event.date}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={[styles.cardTitle, event.muted && styles.cardTitleMuted]}>
          {event.title}
        </Text>
        <View style={styles.locationRow}>
          <MapPin color="#6B7280" size={13} />
          <Text numberOfLines={1} style={styles.locationText}>{event.location}</Text>
        </View>

        {mode === "posted" ? (
          <MetricsLine text={event.attendees} />
        ) : (
          <>
            <AttendeeRow text={event.attendees} muted={event.muted} />
            {event.host ? <HostRow host={event.host} official={event.official} /> : null}
          </>
        )}

        <View style={styles.cardActions}>
          <Pressable
            onPress={() => {
              if (event.id) {
                router.push(`/events/${event.id}` as any);
              }
            }}
            style={[styles.primaryAction, event.muted && styles.pastAction]}
          >
            {mode === "posted" ? (
              <TrendingUp color={event.muted ? "#6B7280" : "#FFFFFF"} size={14} />
            ) : (
              <CalendarCheck color={event.muted ? "#6B7280" : "#FFFFFF"} size={14} />
            )}
            <Text style={[styles.primaryActionText, event.muted && styles.pastActionText]}>
              {event.primaryAction}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const destination =
                event.source.latitude && event.source.longitude
                  ? `${event.source.latitude},${event.source.longitude}`
                  : encodeURIComponent(event.location);

              Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destination}`);
            }}
            style={styles.iconAction}
          >
            <Navigation color="#1F2937" size={15} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function AttendeeRow({
  muted,
  text,
}: {
  muted?: boolean;
  text: string;
}) {
  return (
    <View style={styles.attendeeRow}>
      <View style={[styles.attendeeIcon, muted && styles.plusAvatarMuted]}>
        <Users color="#FFFFFF" size={14} />
      </View>
      <Text style={styles.attendeeText}>{text}</Text>
    </View>
  );
}

function HostRow({
  host,
  official,
}: {
  host: string;
  official?: boolean;
}) {
  return (
    <View style={styles.hostRow}>
      <View style={styles.hostAvatar}>
        <Users color="#F97316" size={13} />
      </View>
      <Text style={styles.hostText}>By {host}</Text>
      <View style={styles.hostDot} />
      <Text style={styles.hostMuted}>{official ? "Official Event" : "Verified Host"}</Text>
    </View>
  );
}

function MetricsLine({text}: {text: string}) {
  const parts = text.split(" · ");

  return (
    <View style={styles.metricsRow}>
      {parts.map((part) => {
        const [value, ...label] = part.split(" ");

        return (
          <View key={part} style={styles.metricItem}>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricLabel}>{label.join(" ")}</Text>
          </View>
        );
      })}
    </View>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <CalendarCheck color="#F97316" size={24} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function QuickActions() {
  return (
    <View style={styles.quickWrap}>
      <View style={styles.quickPanel}>
        <Text style={styles.quickTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <Pressable
            onPress={() => router.push("/events/create")}
            style={styles.quickCard}
          >
            <View style={styles.quickIcon}>
              <CalendarPlus color="#FFFFFF" size={17} />
            </View>
            <View style={styles.quickCopy}>
              <Text style={styles.quickLabel}>Create Event</Text>
              <Text style={styles.quickSub}>Host your own</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.quickCard}>
            <View style={styles.quickIcon}>
              <Search color="#FFFFFF" size={17} />
            </View>
            <View style={styles.quickCopy}>
              <Text style={styles.quickLabel}>Discover</Text>
              <Text style={styles.quickSub}>Find events</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alertActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  alertBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  alertBody: {
    flex: 1,
  },
  alertCard: {
    backgroundColor: "#2B1308",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  alertIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  alertMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  alertPrimary: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 42,
  },
  alertPrimaryText: {
    color: "#2B1308",
    fontSize: 12,
    fontWeight: "900",
  },
  alertSecondary: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    minHeight: 42,
    justifyContent: "center",
    width: 46,
  },
  alertText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  alertTime: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  alertTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 8,
  },
  alertWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  attendeeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 12,
  },
  attendeeIcon: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  attendeeText: {
    color: "#6B7280",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  avatar: {
    borderColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    width: 28,
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  avatarStack: {
    flexDirection: "row",
  },
  bookmarkBubble: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  cardBody: {
    padding: 16,
  },
  cardImage: {
    alignItems: "center",
    backgroundColor: "#E8DFD5",
    height: 160,
    justifyContent: "center",
    position: "relative",
  },
  cardImageText: {
    color: "#8B7355",
    fontSize: 14,
    fontWeight: "800",
  },
  cardsSection: {
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardTitle: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  cardTitleMuted: {
    color: "#6B7280",
  },
  container: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },
  dateOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    bottom: 12,
    flexDirection: "row",
    gap: 6,
    left: 12,
    minHeight: 36,
    paddingHorizontal: 10,
    position: "absolute",
    right: 12,
  },
  dateOverlayText: {
    color: "#1F2937",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  eventCardMuted: {
    opacity: 0.78,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    flexDirection: "row",
    gap: 7,
    minHeight: 36,
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: "#F97316",
  },
  filterContent: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterWrap: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
  },
  header: {
    alignItems: "center",
    backgroundColor: "rgba(250,250,249,0.96)",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 54,
  },
  headerIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
  },
  hostAvatar: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  hostDot: {
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  hostMuted: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },
  hostRow: {
    alignItems: "center",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginBottom: 12,
    paddingBottom: 12,
  },
  hostText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "800",
  },
  iconAction: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 44,
  },
  liveDot: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  loadingBox: {
    alignItems: "center",
    paddingTop: 20,
  },
  loadMoreButton: {
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 14,
    minHeight: 44,
    justifyContent: "center",
  },
  loadMoreText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 6,
    marginBottom: 12,
  },
  locationText: {
    color: "#6B7280",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricsRow: {
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 12,
  },
  metricLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  metricValue: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
  },
  pastAction: {
    backgroundColor: "#FFF7ED",
  },
  pastActionText: {
    color: "#6B7280",
  },
  plusAvatar: {
    alignItems: "center",
    backgroundColor: "#F97316",
    justifyContent: "center",
    marginLeft: -8,
  },
  plusAvatarMuted: {
    backgroundColor: "#6B7280",
  },
  plusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  postedStatCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  postedStatIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    marginBottom: 8,
    width: 40,
  },
  postedStatLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
  },
  postedStats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postedStatValue: {
    color: "#1F2937",
    fontSize: 22,
    fontWeight: "900",
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 12,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  quickCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flex: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  quickCopy: {
    flex: 1,
  },
  quickGrid: {
    flexDirection: "row",
    gap: 10,
  },
  quickIcon: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  quickLabel: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
  },
  quickPanel: {
    backgroundColor: "#FFF7ED",
    borderRadius: 24,
    padding: 16,
  },
  quickSub: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  quickTitle: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 12,
  },
  quickWrap: {
    paddingBottom: 110,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  segmented: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    padding: 5,
  },
  statMini: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  statMiniIcon: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  statMiniLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
  },
  statMiniValue: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  statusBadge: {
    alignItems: "center",
    backgroundColor: "rgba(249,115,22,0.92)",
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: "absolute",
    top: 12,
  },
  statusBadgeMuted: {
    backgroundColor: "rgba(107,114,128,0.9)",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  tabPanel: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    padding: 16,
  },
  tabText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "800",
  },
  tabTextActive: {
    color: "#1F2937",
  },
});
