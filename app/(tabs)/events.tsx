import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import {
  Bookmark,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  FilePenLine,
  HandHeart,
  Heart,
  LocateFixed,
  List,
  Map,
  MapPin,
  Minus,
  Music,
  Plus,
  Share2,
  Stethoscope,
  Users,
} from "lucide-react-native";

import {
  bookmarkEventRequest,
  cancelEventRsvpRequest,
  fetchCommunityCalendarsRequest,
  fetchEventBookmarksRequest,
  fetchEventDraftsRequest,
  fetchEventsHomeRequest,
  fetchEventsRequest,
  fetchMyEventsRequest,
  fetchNearbyEventsRequest,
  rsvpEventRequest,
  shareEventRequest,
  unbookmarkEventRequest,
} from "@/store/events/actions";
import {
  selectCommunityCalendars,
  selectCommunityCalendarsLoading,
  selectEventBookmarks,
  selectEventBookmarksPagination,
  selectEventDraftsById,
  selectEventDraftsLoading,
  selectEventsError,
  selectEventsFeed,
  selectEventsHome,
  selectEventsHomeLoading,
  selectEventsLoading,
  selectMyEvents,
  selectIsEventBookmarkPending,
  selectIsEventRsvpPending,
  selectIsEventSharePending,
  selectNearbyEvents,
  selectNearbyEventsLoading,
} from "@/store/events/selectors";
import {
  CommunityCalendar,
  EventDraft,
  EventHomeResult,
  EventType,
  SaiEvent,
} from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";
import { requestLocationPermissionWithSettingsFallback } from "@/services/location-permissions";
import { selectDevoteeAccount } from "@/store/devotee-account/selectors";
import { FontAwesome } from "@expo/vector-icons";
import { createEventShareMessage } from "@/utils/event-links";

const EVENT_FILTERS: {
  label: string;
  value: EventType | "all";
}[] = [
  { label: "All Events", value: "all" },
  { label: "Bhajan", value: "bhajan" },
  { label: "Seva", value: "seva" },
  { label: "Satsang", value: "satsang" },
  { label: "Pooja", value: "pooja" },
  { label: "Medical", value: "medical" },
  { label: "Darshan", value: "darshan" },
];

// Keep upcoming discovery controls implemented but hidden until their next release.
const SHOW_EVENT_MAP_TAB = false;
const SHOW_EVENT_CATEGORY_FILTERS = false;

const mapMarkers = [
  { icon: Music, left: "25%", top: "14%" },
  { icon: HandHeart, right: "20%", top: "30%" },
  { icon: Heart, left: "35%", top: "58%" },
  { icon: Stethoscope, right: "30%", top: "45%" },
  { icon: Music, left: "15%", top: "70%" },
  { icon: HandHeart, right: "15%", top: "60%" },
  { icon: Heart, left: "60%", top: "25%" },
  { icon: Music, right: "40%", top: "55%" },
] as const;

type UiEvent = {
  attendees: string;
  bookmarked: boolean;
  date: string;
  going: boolean;
  id: string;
  imageLabel: string;
  location: string;
  sourceId?: string;
  time: string;
  title: string;
  urgency?: string;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date pending";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
};

const formatTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time pending";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const toUiEvent = (event: SaiEvent): UiEvent => ({
  attendees: `+${event.rsvps || 0} going`,
  bookmarked: Boolean(event.bookmarkedByMe),
  date: formatDate(event.startAt),
  going: !!event.rsvpedByMe,
  id: event.id,
  imageLabel: event.type || "Event",
  location: event.venueName || event.city || event.address || "Location pending",
  sourceId: event.id,
  time: `${formatTime(event.startAt)} - ${formatTime(event.endAt)}`,
  title: event.title,
});

const getTypeIcon = (type?: string) => {
  if (type === "seva") {
    return HandHeart;
  }
  if (type === "medical") {
    return Stethoscope;
  }
  if (type === "pooja" || type === "darshan") {
    return Heart;
  }
  return Music;
};

const eventTypeLabel = (type?: string) =>
  type ? type.charAt(0).toUpperCase() + type.slice(1) : "Event";

const sectionEventsFromHome = (
  home: EventHomeResult | null,
  key: string
) => home?.sections?.[key]?.events || [];

const sectionCountFromHome = (
  home: EventHomeResult | null,
  key: string
) => home?.sections?.[key]?.count ?? 0;

function EventsScreen() {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectDevoteeAccount);
  const events = useAppSelector(selectEventsFeed);
  const home = useAppSelector(selectEventsHome);
  const homeLoading = useAppSelector(selectEventsHomeLoading);
  const nearbyEvents = useAppSelector(selectNearbyEvents);
  const nearbyLoading = useAppSelector(selectNearbyEventsLoading);
  const communityCalendars = useAppSelector(selectCommunityCalendars);
  const communityCalendarsLoading = useAppSelector(selectCommunityCalendarsLoading);
  const eventBookmarks = useAppSelector(selectEventBookmarks);
  const eventBookmarksPagination = useAppSelector(selectEventBookmarksPagination);
  const myEvents = useAppSelector(selectMyEvents);
  const draftsById = useAppSelector(selectEventDraftsById);
  const draftsLoading = useAppSelector(selectEventDraftsLoading);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);

  const [selectedType, setSelectedType] = useState<EventType | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [refreshing, setRefreshing] = useState(false);

  const fetchParams = useMemo(
    () => ({
      limit: 20,
      page: 1,
      type:
        selectedType === "all"
          ? undefined
          : selectedType,
    }),
    [selectedType]
  );

  const fetchNearbyFromLocation = useCallback(async () => {
    try {
      const hasPermission =
        await requestLocationPermissionWithSettingsFallback({
          message:
            "Please allow location access to show events near you.",
          settingsMessage:
            "Location access is turned off for Sai Family. Please enable it from Settings to show nearby events.",
        });

      if (!hasPermission) {
        return;
      }

      const current =
        await Location.getCurrentPositionAsync({});

      dispatch(
        fetchNearbyEventsRequest({
          lat: current.coords.latitude,
          limit: 20,
          lng: current.coords.longitude,
          radius: 25,
          type:
            selectedType === "all"
              ? undefined
              : selectedType,
        })
      );
    } catch {
      // Nearby is an enhancement; the screen falls back to upcoming events.
    }
  }, [dispatch, selectedType]);

  useEffect(() => {
    dispatch(fetchEventsRequest(fetchParams));
    dispatch(fetchEventsHomeRequest({limit: 5}));
    dispatch(fetchEventBookmarksRequest({limit: 20, offset: 0}));
    dispatch(fetchMyEventsRequest({limit: 20, offset: 0}));
    dispatch(fetchEventDraftsRequest({limit: 20, offset: 0, status: "active"}));
    fetchNearbyFromLocation();
    dispatch(fetchCommunityCalendarsRequest());
  }, [dispatch, fetchNearbyFromLocation, fetchParams]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchEventsRequest(fetchParams));
    dispatch(fetchEventsHomeRequest({limit: 5}));
    dispatch(fetchEventBookmarksRequest({limit: 20, offset: 0}));
    dispatch(fetchMyEventsRequest({limit: 20, offset: 0}));
    dispatch(fetchEventDraftsRequest({limit: 20, offset: 0, status: "active"}));
    fetchNearbyFromLocation();
    dispatch(fetchCommunityCalendarsRequest());
    setTimeout(() => setRefreshing(false), 700);
  }, [dispatch, fetchNearbyFromLocation, fetchParams]);

  const handleBookmark = useCallback(
    (event: UiEvent) => {
      if (!event.sourceId) {
        return;
      }

      dispatch(
        event.bookmarked
          ? unbookmarkEventRequest(event.sourceId)
          : bookmarkEventRequest(event.sourceId)
      );
    },
    [dispatch]
  );

  const handleRsvp = useCallback(
    (event: UiEvent) => {
      if (!event.sourceId) {
        return;
      }

      dispatch(
        event.going
          ? cancelEventRsvpRequest(event.sourceId)
          : rsvpEventRequest(event.sourceId)
      );
    },
    [dispatch]
  );

  const handleShare = useCallback(
    async (event: UiEvent) => {
      if (!event.sourceId) {
        return;
      }

      const result = await Share.share({
        message: createEventShareMessage({
          date: event.date,
          eventId: event.sourceId,
          location: event.location,
          time: event.time,
          title: event.title,
        }),
        title: event.title,
      });

      if (result.action !== Share.dismissedAction) {
        dispatch(shareEventRequest(event.sourceId, "native_share"));
      }
    },
    [dispatch]
  );

  const nearbyLiveEvents = useMemo(
    () =>
      nearbyEvents
        .slice()
        .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
        .slice(0, 8),
    [nearbyEvents]
  );

  const fallbackSections = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const endOfMonth = new Date(
      startOfToday.getFullYear(),
      startOfToday.getMonth() + 1,
      1
    );

    const upcomingEvents = events
      .filter((event) => {
        const startAt = new Date(event.startAt).getTime();
        return Number.isFinite(startAt) && startAt >= startOfToday.getTime();
      })
      .sort(
        (first, second) =>
          new Date(first.startAt).getTime() -
          new Date(second.startAt).getTime()
      );

    return {
      comingSoon: upcomingEvents.filter(
        (event) => new Date(event.startAt) >= endOfWeek
      ),
      happeningToday: upcomingEvents.filter((event) => {
        const startAt = new Date(event.startAt);
        return startAt >= startOfToday && startAt < endOfToday;
      }),
      thisMonth: upcomingEvents.filter(
        (event) => new Date(event.startAt) < endOfMonth
      ),
      thisWeek: upcomingEvents.filter(
        (event) => new Date(event.startAt) < endOfWeek
      ),
    };
  }, [events]);

  const resolveSectionEvents = (
    key: "happeningToday" | "thisWeek" | "thisMonth" | "comingSoon"
  ) => {
    const sectionEvents = sectionEventsFromHome(home, key);

    if (sectionEvents.length) {
      return sectionEvents;
    }

    const trendingKey = key === "happeningToday" ? "today" : key;
    const trendingEvents = home?.trendingSections?.[trendingKey] || [];

    return trendingEvents.length ? trendingEvents : fallbackSections[key];
  };

  const todayEvents = resolveSectionEvents("happeningToday");
  const weekEvents = resolveSectionEvents("thisWeek");
  const monthEvents = resolveSectionEvents("thisMonth");

  const sectionCount = (
    key: "happeningToday" | "thisWeek" | "thisMonth" | "comingSoon",
    sectionEvents: SaiEvent[]
  ) => Math.max(sectionCountFromHome(home, key), sectionEvents.length);

  const sections = [
    {
       background: EXPERIENCE_THEME.background,
      count: `${sectionCount("happeningToday", todayEvents)} Events`,
      events: todayEvents.slice(0, 4).map(toUiEvent),
      title: "Happening Today",
    },
    {
      background: EXPERIENCE_THEME.background,
      count: `${sectionCount("thisWeek", weekEvents)} Events`,
      events: weekEvents.slice(0, 4).map(toUiEvent),
      title: "This Week",
    },
    {
      background: EXPERIENCE_THEME.background,
      count: `${sectionCount("thisMonth", monthEvents)} Events`,
      events: monthEvents.slice(0, 4).map(toUiEvent),
      title: "This Month",
    },
    // {
    //   background: EXPERIENCE_THEME.background,
    //   count: `${sectionCount("comingSoon", laterEvents)} Events`,
    //   events: laterEvents.slice(0, 4).map(toUiEvent),
    //   title: "Coming Soon",
    // },
  ];

  const profileImageUrl =
    account?.profileImage?.uri ||
    account?.profileImageUrl ||
    account?.profile?.profileImageUrl;
  const profileInitial = account?.name?.trim().charAt(0).toUpperCase() || "S";
  const eventDrafts = useMemo(
    () => Object.values(draftsById).filter((draft) => !draft.publishedAt),
    [draftsById]
  );

  return (
    <View style={styles.container}>
      <View style={styles.eventToolbar}>
        <Pressable
          accessibilityLabel="Create event"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.push("/events/create")}
          style={({ pressed }) => [
            styles.createEventAction,
            pressed && styles.toolbarButtonPressed,
          ]}
        >
          <View style={styles.createEventProfileButton}>
            <LinearGradient
              colors={[EXPERIENCE_THEME.heading, "#D97706"]}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.createEventRing}
            >
              <View style={styles.createEventAvatarInset}>
                {profileImageUrl ? (
                  <Image
                    accessibilityLabel={`${account?.name || "Devotee"} profile photo`}
                    resizeMode="cover"
                    source={{ uri: profileImageUrl }}
                    style={styles.createEventAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.createEventAvatar,
                      styles.createEventAvatarFallback,
                    ]}
                  >
                    <Text style={styles.createEventAvatarText}>
                      {profileInitial}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            <View style={styles.createEventBadge}>
              <Plus color="#FFFFFF" size={12} strokeWidth={3.4} />
            </View>
          </View>
          <Text style={styles.createEventActionLabel}>Create Event</Text>
        </Pressable>

        <View style={styles.eventToolbarActions}>
          <Pressable
            accessibilityLabel="Saved events"
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => router.push("/events/bookmarks")}
            style={({ pressed }) => [
              styles.eventToolbarIconButton,
              pressed && styles.toolbarButtonPressed,
            ]}
          >
            <Bookmark
              color={EXPERIENCE_THEME.paragraph}
              size={30}
              strokeWidth={2.15}
            />
          </Pressable>

          <Pressable
            accessibilityLabel="Event calendar"
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => router.push("/events/calendar")}
            style={({ pressed }) => [
              styles.eventToolbarIconButton,
              pressed && styles.toolbarButtonPressed,
            ]}
          >
            <Calendar
              color={EXPERIENCE_THEME.paragraph}
              size={30}
              strokeWidth={2.15}
            />
          </Pressable>
        </View>
      </View>

      {SHOW_EVENT_MAP_TAB || SHOW_EVENT_CATEGORY_FILTERS ? (
        <View style={styles.controls}>
          {SHOW_EVENT_MAP_TAB ? (
            <View style={styles.toggleRow}>
              <Pressable
                onPress={() => setViewMode("map")}
                style={[
                  styles.toggleButton,
                  viewMode === "map" && styles.toggleButtonActive,
                ]}
              >
                <Map
                  color={
                    viewMode === "map"
                      ? "#FFFFFF"
                      : EXPERIENCE_THEME.paragraph
                  }
                  size={16}
                />
                <Text
                  style={
                    viewMode === "map"
                      ? styles.toggleTextActive
                      : styles.toggleText
                  }
                >
                  Map
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setViewMode("list")}
                style={[
                  styles.toggleButton,
                  viewMode === "list" && styles.toggleButtonActive,
                ]}
              >
                <List
                  color={
                    viewMode === "list"
                      ? "#FFFFFF"
                      : EXPERIENCE_THEME.paragraph
                  }
                  size={16}
                />
                <Text
                  style={
                    viewMode === "list"
                      ? styles.toggleTextActive
                      : styles.toggleText
                  }
                >
                  List
                </Text>
              </Pressable>
            </View>
          ) : null}

          {SHOW_EVENT_CATEGORY_FILTERS ? (
            <ScrollView
              contentContainerStyle={styles.chipsContent}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {EVENT_FILTERS.map((filter) => {
                const active = selectedType === filter.value;

                return (
                  <Pressable
                    key={filter.value}
                    onPress={() => setSelectedType(filter.value)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      {SHOW_EVENT_MAP_TAB && viewMode === "map" ? (
        <MapOverview events={nearbyLiveEvents} home={home} loading={nearbyLoading} />
      ) : (
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor={EXPERIENCE_THEME.heading}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
        
      >
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {(loading || homeLoading) && events.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={EXPERIENCE_THEME.heading} size="large" />
          </View>
        ) : null}
        <View style={styles.eventsFeedHeading}>
          <View style={styles.eventsFeedHeadingIcon}>
            {/* <Calendar
              color={EXPERIENCE_THEME.heading}
              size={21}
              strokeWidth={2.3}
            /> */}
            <FontAwesome name="group" size={34} color={EXPERIENCE_THEME.heading} />
          </View>
          <View style={styles.eventsFeedHeadingCopy}>
            <Text style={styles.eventsFeedHeadingTitle}>Events</Text>
            <Text style={styles.eventsFeedHeadingSubtitle}>
              Upcoming Sai Family Events
            </Text>
          </View>
        </View>

        <MyEventsOverview
          drafts={eventDrafts}
          events={myEvents}
          loading={loading || draftsLoading}
        />

        {sections.map((section) => (
          <EventSection
            key={section.title}
            background={section.background}
            count={section.count}
            error={error}
            events={[...section.events]}
            loading={loading || homeLoading}
            onBookmark={handleBookmark}
            onRsvp={handleRsvp}
            onShare={handleShare}
            title={section.title}
          />
        ))}

        <EventProductSections home={home} loading={homeLoading} />
        {/* <ActivityStats
          events={events}
          home={home}
          savedEventsCount={
            eventBookmarksPagination?.total ??
            eventBookmarks.length
          }
        />
        <SuggestedCommunities
          calendars={communityCalendars}
          loading={communityCalendarsLoading}
        /> */}
      </ScrollView>
      )}
    </View>
  );
}

function MapOverview({
  events,
  home,
  loading,
}: {
  events: SaiEvent[];
  home?: EventHomeResult | null;
  loading: boolean;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.mapScrollContent}
      showsVerticalScrollIndicator={false}
    >
      

      

      <View style={styles.mapCanvas}>
        <View style={styles.mapGradient} />
        <View style={[styles.mapGridVertical, { left: "25%" }]} />
        <View style={[styles.mapGridVertical, { left: "50%" }]} />
        <View style={[styles.mapGridVertical, { left: "75%" }]} />
        <View style={[styles.mapGridHorizontal, { top: "25%" }]} />
        <View style={[styles.mapGridHorizontal, { top: "50%" }]} />
        <View style={[styles.mapGridHorizontal, { top: "75%" }]} />

        {events.slice(0, 8).map((event, index) => {
          const Icon = getTypeIcon(event.type);
          const marker = mapMarkers[index % mapMarkers.length];
          return (
            <Pressable
              key={event.id}
              onPress={() => router.push(`/events/${event.id}` as any)}
              style={[styles.mapMarker, marker]}
            >
              <Icon color="#FFFFFF" size={15} />
            </Pressable>
          );
        })}

        <View style={styles.userMarker}>
          <View style={styles.userMarkerCore} />
        </View>

        <View style={styles.distanceBadge}>
          <MapPin color={EXPERIENCE_THEME.paragraph} size={13} />
          <Text style={styles.distanceText}>Within 25 km</Text>
        </View>

        <View style={styles.eventCountBadge}>
          <Text style={styles.eventCountText}>{events.length} Events</Text>
        </View>

        <View style={styles.mapControls}>
          <MapControlButton icon={<Plus color={EXPERIENCE_THEME.paragraph} size={16} />} />
          <MapControlButton icon={<Minus color={EXPERIENCE_THEME.paragraph} size={16} />} />
          <MapControlButton icon={<LocateFixed color={EXPERIENCE_THEME.paragraph} size={16} />} />
        </View>
      </View>

      <View style={styles.nearbySheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.nearbyHeader}>
          <View>
            <Text style={styles.nearbyTitle}>Nearby Events</Text>
            <Text style={styles.nearbySubtitle}>
              {loading
                ? "Loading nearby gatherings..."
                : `${events.length} spiritual gatherings from backend`}
            </Text>
          </View>
          <Pressable>
            <Text style={styles.nearbyViewAll}>View All ›</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.nearbyCardsContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {events.map((event) => (
            <NearbyEventCard key={event.id} event={event} />
          ))}
          {!events.length && (
            <View style={styles.nearbyEmpty}>
              <Text style={styles.nearbyDescription}>
                No nearby events returned yet.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* <EventProductSections compact home={home} loading={loading} /> */}
    </ScrollView>
  );
}

function MapControlButton({ icon }: { icon: React.ReactNode }) {
  return <Pressable style={styles.mapControlButton}>{icon}</Pressable>;
}

function NearbyEventCard({
  event,
}: {
  event: SaiEvent;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/events/${event.id}` as any)}
      style={styles.nearbyCard}
    >
      <View style={styles.nearbyImage}>
        <Text style={styles.nearbyImageText}>{eventTypeLabel(event.type)}</Text>
        <View style={styles.nearbyTypeBadge}>
          <Text style={styles.nearbyTypeText}>{eventTypeLabel(event.type)}</Text>
        </View>
        <View style={styles.nearbyHeart}>
          <Heart
            color={EXPERIENCE_THEME.paragraph}
            fill={event.bookmarkedByMe ? EXPERIENCE_THEME.paragraph : "transparent"}
            size={14}
          />
        </View>
        {event.distanceKm != null && (
          <View style={styles.nearbyDistanceBadge}>
            <MapPin color="#FFFFFF" size={11} />
            <Text style={styles.nearbyDistanceText}>
              {event.distanceKm.toFixed(1)} km
            </Text>
          </View>
        )}
      </View>

      <View style={styles.nearbyBody}>
        <Text numberOfLines={1} style={styles.nearbyCardTitle}>
          {event.title}
        </Text>
        <Text numberOfLines={2} style={styles.nearbyDescription}>
          {event.description}
        </Text>
        <View style={styles.nearbyMetaRow}>
          <View style={styles.nearbyMetaItem}>
            <Calendar color={EXPERIENCE_THEME.paragraph} size={12} />
            <Text style={styles.nearbyMetaText}>{formatDate(event.startAt)}</Text>
          </View>
          <View style={styles.nearbyMetaItem}>
            <Users color={EXPERIENCE_THEME.paragraph} size={12} />
            <Text style={styles.nearbyMetaText}>{event.rsvps || 0} going</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

type MyEventOverviewItem = {
  date?: string;
  id: string;
  kind: "draft" | "published";
  location: string;
  sortTime: number;
  title: string;
};

function MyEventsOverview({
  drafts,
  events,
  loading,
}: {
  drafts: EventDraft[];
  events: SaiEvent[];
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = useMemo<MyEventOverviewItem[]>(
    () => [
      ...drafts.map((draft) => ({
        date: draft.startAt,
        id: draft.id,
        kind: "draft" as const,
        location:
          draft.venueName || draft.city || draft.address || "Location not added",
        sortTime: new Date(draft.updatedAt || draft.createdAt || 0).getTime(),
        title: draft.title || "Untitled event",
      })),
      ...events.map((event) => ({
        date: event.startAt,
        id: event.id,
        kind: "published" as const,
        location:
          event.venueName || event.city || event.address || "Location pending",
        sortTime: new Date(event.updatedAt || event.createdAt || event.startAt).getTime(),
        title: event.title,
      })),
    ].sort((first, second) => second.sortTime - first.sortTime),
    [drafts, events]
  );
  const visibleItems = expanded ? items : items.slice(0, 2);

  return (
    <View style={styles.myEventsSection}>
      <View style={styles.myEventsHeader}>
        <View style={styles.myEventsHeadingCopy}>
          <Text style={styles.myEventsTitle}>My Events</Text>
          <Text style={styles.myEventsSubtitle}>
            {items.length
              ? `${events.length} published · ${drafts.length} drafts`
              : "Your created events and drafts"}
          </Text>
        </View>
        <View style={styles.myEventsCountBadge}>
          <Text style={styles.myEventsCountText}>{items.length}</Text>
        </View>
      </View>

      {loading && !items.length ? (
        <View style={styles.myEventsLoading}>
          <ActivityIndicator color={EXPERIENCE_THEME.heading} />
          <Text style={styles.myEventsLoadingText}>Loading your events...</Text>
        </View>
      ) : null}

      {!loading && !items.length ? (
        <Pressable
          onPress={() => router.push("/events/create")}
          style={styles.myEventsEmpty}
        >
          <CalendarCheck color={EXPERIENCE_THEME.heading} size={23} />
          <View style={styles.myEventsEmptyCopy}>
            <Text style={styles.myEventsEmptyTitle}>Create your first event</Text>
            <Text style={styles.myEventsEmptyText}>
              Your drafts and published events will appear here.
            </Text>
          </View>
          <ChevronRight color={EXPERIENCE_THEME.heading} size={20} />
        </Pressable>
      ) : null}

      {visibleItems.map((item, index) => {
        const isDraft = item.kind === "draft";
        const Icon = isDraft ? FilePenLine : CalendarCheck;

        return (
          <Pressable
            accessibilityLabel={`${isDraft ? "Continue draft" : "Open event"} ${item.title}`}
            accessibilityRole="button"
            key={`${item.kind}-${item.id}`}
            onPress={() =>
              isDraft
                ? router.push({
                    pathname: "/events/create",
                    params: {draft: item.id},
                  } as any)
                : router.push(`/events/${item.id}` as any)
            }
            style={({pressed}) => [
              styles.myEventRow,
              index < visibleItems.length - 1 && styles.myEventRowDivider,
              pressed && styles.myEventRowPressed,
            ]}
          >
            <View style={[
              styles.myEventRowIcon,
              isDraft && styles.myEventRowIconDraft,
            ]}>
              <Icon
                color={isDraft ? "#C2410C" : EXPERIENCE_THEME.heading}
                size={21}
                strokeWidth={2.25}
              />
            </View>
            <View style={styles.myEventRowCopy}>
              <View style={styles.myEventRowTitleLine}>
                <Text numberOfLines={1} style={styles.myEventRowTitle}>
                  {item.title}
                </Text>
                <View style={[
                  styles.myEventStatus,
                  isDraft && styles.myEventStatusDraft,
                ]}>
                  <Text style={[
                    styles.myEventStatusText,
                    isDraft && styles.myEventStatusTextDraft,
                  ]}>
                    {isDraft ? "Draft" : "Published"}
                  </Text>
                </View>
              </View>
              <Text numberOfLines={1} style={styles.myEventRowMeta}>
                {item.date ? formatDate(item.date) : "Date not selected"} · {item.location}
              </Text>
            </View>
            <ChevronRight color="#A8A29E" size={20} />
          </Pressable>
        );
      })}

      {items.length > visibleItems.length ? (
        <Pressable
          onPress={() => setExpanded(true)}
          style={styles.myEventsMoreButton}
        >
          <Text style={styles.myEventsMoreText}>
            Show all {items.length} events
          </Text>
        </Pressable>
      ) : expanded && items.length > 2 ? (
        <Pressable
          onPress={() => setExpanded(false)}
          style={styles.myEventsMoreButton}
        >
          <Text style={styles.myEventsMoreText}>Show less</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function EventSection({
  background,
  count,
  error,
  events,
  loading,
  moreLabel,
  onBookmark,
  onRsvp,
  onShare,
  title,
}: {
  background: string;
  count: string;
  error?: string | null;
  events: UiEvent[];
  loading?: boolean;
  moreLabel?: string;
  onBookmark: (event: UiEvent) => void;
  onRsvp: (event: UiEvent) => void;
  onShare: (event: UiEvent) => void;
  title: string;
}) {
  return (
    <View style={[styles.section, { backgroundColor: background }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>

      {loading && !events.length ? (
        <SectionLoader />
      ) : null}

      {!!error && !events.length && !loading ? (
        <SectionError text="Could not load this event section. Pull down to refresh." />
      ) : null}

      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onBookmark={onBookmark}
          onRsvp={onRsvp}
          onShare={onShare}
        />
      ))}

      {!events.length && !loading && !error && (
        <View style={styles.emptySectionCard}>
          <Calendar color={EXPERIENCE_THEME.paragraph} size={18} />
          <Text style={styles.emptySectionText}>
            No live events returned for this section.
          </Text>
        </View>
      )}

      {!!moreLabel && (
        <Pressable style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>{moreLabel}</Text>
          <ChevronDown color={EXPERIENCE_THEME.paragraph} size={16} />
        </Pressable>
      )}
    </View>
  );
}

function EventCard({
  event,
  onBookmark,
  onRsvp,
  onShare,
}: {
  event: UiEvent;
  onBookmark: (event: UiEvent) => void;
  onRsvp: (event: UiEvent) => void;
  onShare: (event: UiEvent) => void;
}) {
  const bookmarkPending = useAppSelector((state) =>
    selectIsEventBookmarkPending(state, event.sourceId)
  );
  const rsvpPending = useAppSelector((state) =>
    selectIsEventRsvpPending(state, event.sourceId)
  );
  const sharePending = useAppSelector((state) =>
    selectIsEventSharePending(state, event.sourceId)
  );

  return (
    <Pressable
      onPress={() => {
        if (event.sourceId) {
          router.push(`/events/${event.sourceId}`);
        }
      }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardTop}>
        <View style={styles.thumbnail}>
          <Text style={styles.thumbnailText}>{event.imageLabel}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTitleRow}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {event.title}
            </Text>
            <Pressable
              disabled={bookmarkPending}
              onPress={(pressEvent) => {
                pressEvent.stopPropagation();
                onBookmark(event);
              }}
              style={[styles.bookmarkButton, bookmarkPending && styles.disabledButton]}
            >
              {bookmarkPending ? (
                <ActivityIndicator color={EXPERIENCE_THEME.paragraph} size="small" />
              ) : (
                <Bookmark
                  color={EXPERIENCE_THEME.paragraph}
                  fill={event.bookmarked ? EXPERIENCE_THEME.heading : "transparent"}
                  size={18}
                />
              )}
            </Pressable>
          </View>

          <MetaRow
            icon={event.urgency ? "clock" : "calendar"}
            label={event.date === "Today" ? event.time : `${event.date} · ${event.time}`}
            trailing={event.urgency}
          />
          <MetaRow icon="location" label={event.location} />

          <View style={styles.attendeeRow}>
            <View style={styles.attendeeIcon}>
              <Users color="#FFFFFF" size={13} />
            </View>
            <Text style={styles.attendeeText}>{event.attendees}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          disabled={rsvpPending}
          onPress={(pressEvent) => {
            pressEvent.stopPropagation();
            onRsvp(event);
          }}
          style={[
            styles.rsvpButton,
            event.going && styles.rsvpButtonActive,
            rsvpPending && styles.disabledButton,
          ]}
        >
          {rsvpPending ? (
            <ActivityIndicator
              color={event.going ? EXPERIENCE_THEME.paragraph : "#FFFFFF"}
              size="small"
            />
          ) : (
            <CalendarCheck
              color={event.going ? EXPERIENCE_THEME.paragraph : "#FFFFFF"}
              size={16}
            />
          )}
          <Text style={[styles.rsvpButtonText, event.going && styles.rsvpButtonTextActive]}>
            {rsvpPending ? "Updating" : event.going ? "Confirmed" : "Confirm"}
          </Text>
        </Pressable>
        <Pressable
          disabled={sharePending}
          onPress={(pressEvent) => {
            pressEvent.stopPropagation();
            onShare(event);
          }}
          style={[styles.shareButton, sharePending && styles.disabledButton]}
        >
          {sharePending ? (
            <ActivityIndicator color={EXPERIENCE_THEME.paragraph} size="small" />
          ) : (
            <Share2 color={EXPERIENCE_THEME.paragraph} size={16} />
          )}
        </Pressable>
      </View>
    </Pressable>
  );
}

function SectionLoader() {
  return (
    <View style={styles.sectionLoader}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonThumb} />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonLineWide} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonPill} />
          </View>
        </View>
      ))}
    </View>
  );
}

function InlineProductLoader() {
  return (
    <View style={styles.inlineLoader}>
      <ActivityIndicator color={EXPERIENCE_THEME.heading} size="small" />
      <Text style={styles.inlineLoaderText}>Loading live data...</Text>
    </View>
  );
}

function SectionError({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.sectionError}>
      <Text style={styles.sectionErrorText}>{text}</Text>
    </View>
  );
}

function MetaRow({
  icon,
  label,
  trailing,
}: {
  icon: "calendar" | "clock" | "location";
  label: string;
  trailing?: string;
}) {
  const Icon = icon === "location" ? MapPin : icon === "clock" ? Clock3 : Calendar;

  return (
    <View style={styles.metaRow}>
      <Icon color={EXPERIENCE_THEME.paragraph} size={13} />
      <Text numberOfLines={1} style={styles.metaText}>
        {label}
      </Text>
      {!!trailing && (
        <>
          <View style={styles.dot} />
          <Text style={styles.metaMuted}>{trailing}</Text>
        </>
      )}
    </View>
  );
}

function EventProductSections({
  compact = false,
  home,
  loading,
}: {
  compact?: boolean;
  home?: EventHomeResult | null;
  loading?: boolean;
}) {
  return (
    <View style={[styles.productWrap, compact && styles.productWrapCompact]}>
      <EventQuickActions />
      {/* <EventTypeGuide home={home} loading={loading} /> */}
      {/* <TrendingThisWeek home={home} loading={loading} /> */}
      
      {/* <WeekScheduler home={home} loading={loading} /> */}
      {/* <TopOrganisers home={home} loading={loading} /> */}
    </View>
  );
}

function EventTypeGuide({
  home,
  loading,
}: {
  home?: EventHomeResult | null;
  loading?: boolean;
}) {
  const guide = (home?.eventTypeGuide || []).map((item) => {
    const type = item.type || "general";
    const Icon = getTypeIcon(type);

    return {
      count:
        typeof item.count === "number"
          ? `${item.count} live`
          : item.count || "Live",
      icon: Icon,
      label: item.label || eventTypeLabel(type),
      summary:
        item.summary ||
        item.description ||
        `Live ${eventTypeLabel(type).toLowerCase()} gatherings from backend.`,
      type,
    };
  });

  return (
    <View style={styles.productSection}>
      <SectionHeading
        subtitle="Choose the right gathering faster"
        title="Event Type Guide"
      />
      {loading && !guide.length ? (
        <InlineProductLoader />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.typeGuideContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {guide.map((item) => {
          const Icon = item.icon;

          return (
            <Pressable
              key={item.label}
              onPress={() =>
                router.push({
                  pathname: "/events",
                  params: {
                    type: item.type,
                  },
                } as any)
              }
              style={styles.typeGuideCard}
            >
              <View style={styles.typeGuideIcon}>
                <Icon color={EXPERIENCE_THEME.heading} size={22} />
              </View>
              <Text style={styles.typeGuideTitle}>{item.label}</Text>
              <Text style={styles.typeGuideSummary}>{item.summary}</Text>
              <Text style={styles.typeGuideCount}>{item.count}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {!loading && !guide.length && (
        <Text style={styles.emptySectionText}>
          Event type guide will appear when backend returns guide data.
        </Text>
      )}
    </View>
  );
}

function TrendingThisWeek({
  home,
  loading,
}: {
  home?: EventHomeResult | null;
  loading?: boolean;
}) {
  const trending = (home?.trendingThisWeek || []).slice(0, 5);

  return (
    <View style={styles.productSection}>
      <SectionHeading
        action="View all"
        subtitle="Most saved and most RSVP activity"
        title="Trending This Week"
      />
      {loading && !trending.length ? (
        <InlineProductLoader />
      ) : null}
      {trending.map((event, index) => (
        <Pressable
          key={`${event.id}-${index}`}
          onPress={() => router.push(`/events/${event.id}` as any)}
          style={styles.trendingRow}
        >
          <Text style={styles.trendingRank}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <View style={styles.trendingBody}>
            <Text numberOfLines={1} style={styles.trendingTitle}>{event.title}</Text>
            <Text numberOfLines={1} style={styles.trendingMeta}>
              {formatDate(event.startAt)} · {event.venueName || event.city || event.address}
            </Text>
          </View>
          <Text style={styles.trendingValue}>{event.rsvps || 0} going</Text>
        </Pressable>
      ))}
      {!trending.length && !loading && (
        <Text style={styles.emptySectionText}>No trending events yet.</Text>
      )}
    </View>
  );
}

function EventQuickActions() {
  const actions = [
    {
      href: "/events/rsvps",
      icon: CalendarCheck,
      label: "My Confirmed Events",
    },
    // {
    //   href: "/events/my-events",
    //   icon: Bookmark,
    //   label: "My Events",
    // },
  ] as const;

  return (
    <View style={styles.productSection}>
      {/* <SectionHeading
        subtitle="Shortcuts for your regular event work"
        title="Quick Actions"
      /> */}
      <View style={styles.quickGrid}>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Pressable
              key={action.label}
              onPress={() => router.push(action.href)}
              style={styles.quickTile}
            >
              <View style={styles.quickIcon}>
                <Icon color={EXPERIENCE_THEME.heading} size={20} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function WeekScheduler({
  home,
  loading,
}: {
  home?: EventHomeResult | null;
  loading?: boolean;
}) {
  const todayIndex = new Date().getDay();
  const schedule = (home?.weeklySchedule || []).map((item) => ({
    count: item.count || 0,
    day: item.day || "",
    label:
      item.label ||
      (item.type ? eventTypeLabel(item.type) : "Open"),
  }));

  return (
    <View style={styles.productSectionAlt}>
      <SectionHeading
        subtitle="Scan event density across the current week"
        title="This Week Scheduler"
      />
      {loading && !schedule.length ? (
        <InlineProductLoader />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.schedulerContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {schedule.map((day, index) => (
          <View
            key={day.day}
            style={[
              styles.schedulerDay,
              index === todayIndex && styles.schedulerDayActive,
            ]}
          >
            <Text style={[styles.schedulerDayText, index === todayIndex && styles.schedulerDayTextActive]}>
              {day.day}
            </Text>
            <Text style={[styles.schedulerCount, index === todayIndex && styles.schedulerCountActive]}>
              {day.count}
            </Text>
            <Text numberOfLines={1} style={[styles.schedulerLabel, index === todayIndex && styles.schedulerLabelActive]}>
              {day.label}
            </Text>
          </View>
        ))}
      </ScrollView>
      {!loading && !schedule.length && (
        <Text style={styles.emptySectionText}>
          Weekly schedule will appear when backend returns calendar density.
        </Text>
      )}
    </View>
  );
}

function TopOrganisers({
  home,
  loading,
}: {
  home?: EventHomeResult | null;
  loading?: boolean;
}) {
  const organisers = home?.topOrganisers || [];

  if (loading && !organisers.length) {
    return (
      <View style={styles.productSection}>
        <SectionHeading
          subtitle="Trusted organizers from the live events network"
          title="Top Event Organisers"
        />
        <InlineProductLoader />
      </View>
    );
  }

  if (!organisers.length) {
    return null;
  }

  return (
    <View style={styles.productSection}>
      <SectionHeading
        subtitle="Trusted organizers from the live events network"
        title="Top Event Organisers"
      />
      <ScrollView
        contentContainerStyle={styles.organiserContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {organisers.map((organiser, index) => {
          const organiserName =
            typeof organiser.name === "string" && organiser.name.trim()
              ? organiser.name.trim()
              : "Sai Organizer";

          return (
            <View
              key={`${organiser.id || organiserName}-${index}`}
              style={styles.organiserCard}
            >
              <View style={styles.organiserAvatar}>
                <Text style={styles.organiserAvatarText}>
                  {organiserName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.organiserName}>
                {organiserName}
              </Text>
              <Text numberOfLines={2} style={styles.organiserSpecialty}>
                {organiser.specialty || "Community organizer"}
              </Text>
              <Text style={styles.organiserEvents}>
                {organiser.eventsOrganized || 0} events
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SectionHeading({
  action,
  subtitle,
  title,
}: {
  action?: string;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.productHeader}>
      <View style={styles.productHeaderCopy}>
        <Text style={styles.productTitle}>{title}</Text>
        <Text style={styles.productSubtitle}>{subtitle}</Text>
      </View>
      {!!action && <Text style={styles.productAction}>{action}</Text>}
    </View>
  );
}

function ActivityStats({
  events,
  home,
  savedEventsCount,
}: {
  events: SaiEvent[];
  home: EventHomeResult | null;
  savedEventsCount?: number;
}) {
  const totalRsvps = events.reduce((total, event) => total + (event.rsvps || 0), 0);
  const totalComments = events.reduce((total, event) => total + (event.comments || 0), 0);
  const bookmarked = events.filter((event) => event.bookmarkedByMe).length;
  const cities = new Set(events.map((event) => event.city).filter(Boolean)).size;
  const stats = home?.stats;

  return (
    <View style={styles.statsSection}>
      <Text style={styles.smallSectionTitle}>Live Event Activity</Text>
      <View style={styles.statsGrid}>
        <StatCard icon={<CalendarCheck color={EXPERIENCE_THEME.heading} size={19} />} label="Events Listed" value={String(stats?.totalEvents ?? events.length)} />
        <StatCard icon={<Users color={EXPERIENCE_THEME.heading} size={19} />} label="Total RSVPs" value={String(stats?.totalRsvps ?? totalRsvps)} />
        <StatCard icon={<Bookmark color={EXPERIENCE_THEME.heading} size={19} />} label="Bookmarked" value={String(stats?.savedEvents ?? savedEventsCount ?? bookmarked)} />
        <StatCard icon={<MapPin color={EXPERIENCE_THEME.heading} size={19} />} label="Cities" value={String(cities)} />
      </View>
      {!!totalComments && (
        <Text style={styles.activityFootnote}>
          {totalComments} community comments across visible events.
        </Text>
      )}
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SuggestedCommunities({
  calendars,
  loading,
}: {
  calendars: CommunityCalendar[];
  loading: boolean;
}) {
  return (
    <View style={styles.communitySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.smallSectionTitle}>Community Calendars</Text>
        {loading && <ActivityIndicator color={EXPERIENCE_THEME.heading} />}
      </View>

      {calendars.map((calendar) => (
        <View key={calendar.id} style={styles.communityCard}>
          <View style={styles.communityThumb}>
            <Users color="#FFFFFF" size={24} />
          </View>
          <View style={styles.communityBody}>
            <Text numberOfLines={1} style={styles.communityTitle}>{calendar.title}</Text>
            <Text numberOfLines={2} style={styles.communityDescription}>
              {calendar.description || "Community event calendar from backend."}
            </Text>
            <View style={styles.communityMeta}>
              <Users color={EXPERIENCE_THEME.paragraph} size={13} />
              <Text style={styles.communityMetaText}>{calendar.subscribers ?? 0} subscribers</Text>
              <Calendar color={EXPERIENCE_THEME.paragraph} size={13} />
              <Text style={styles.communityMetaText}>{eventTypeLabel(calendar.type)}</Text>
            </View>
            <Pressable style={[styles.joinButton, calendar.subscribedByMe && styles.joinButtonActive]}>
              <Text style={[styles.joinButtonText, calendar.subscribedByMe && styles.joinButtonTextActive]}>
                {calendar.subscribedByMe ? "Subscribed" : "View Calendar"}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
      {!loading && !calendars.length && (
        <View style={styles.emptySectionCard}>
          <Users color={EXPERIENCE_THEME.paragraph} size={18} />
          <Text style={styles.emptySectionText}>
            No community calendars returned yet.
          </Text>
        </View>
      )}
    </View>
  );
}

export default EventsScreen;

const styles = StyleSheet.create({
  myEventRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  myEventRowCopy: {
    flex: 1,
    marginHorizontal: 11,
  },
  myEventRowDivider: {
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  myEventRowIcon: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  myEventRowIconDraft: {
    backgroundColor: "#FFFBEB",
  },
  myEventRowMeta: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 5,
  },
  myEventRowPressed: {
    backgroundColor: "#FFF4E8",
  },
  myEventRowTitle: {
    color: EXPERIENCE_THEME.heading,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
    marginRight: 8,
  },
  myEventRowTitleLine: {
    alignItems: "center",
    flexDirection: "row",
  },
  myEventStatus: {
    backgroundColor: "#ECFDF3",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  myEventStatusDraft: {
    backgroundColor: "#FFF4E8",
  },
  myEventStatusText: {
    color: "#027A48",
    fontSize: 10,
    fontWeight: "900",
  },
  myEventStatusTextDraft: {
    color: "#C2410C",
  },
  myEventsEmpty: {
    alignItems: "center",
    backgroundColor: "#FFF8EC",
    flexDirection: "row",
    minHeight: 82,
    paddingHorizontal: 14,
  },
  myEventsCountBadge: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    minWidth: 30,
    paddingHorizontal: 8,
  },
  myEventsCountText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 13,
    fontWeight: "900",
  },
  myEventsEmptyCopy: {
    flex: 1,
    marginHorizontal: 12,
  },
  myEventsEmptyText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 3,
  },
  myEventsEmptyTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "900",
  },
  myEventsHeader: {
    alignItems: "center",
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  myEventsHeadingCopy: {
    flex: 1,
  },
  myEventsLoading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 74,
    paddingHorizontal: 16,
  },
  myEventsLoadingText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "700",
  },
  myEventsMoreButton: {
    alignItems: "center",
    borderTopColor: EXPERIENCE_THEME.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    justifyContent: "center",
  },
  myEventsMoreText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 14,
    fontWeight: "900",
  },
  myEventsSection: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: "hidden",
  },
  myEventsSubtitle: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2,
  },
  myEventsTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 25,
  },
  eventsFeedHeading: {
    alignItems: "center",
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 16,
  },
  eventsFeedHeadingIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  eventsFeedHeadingCopy: {
    flex: 1,
    marginLeft: 11,
  },
  eventsFeedHeadingTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 25,
  },
  eventsFeedHeadingSubtitle: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 1,
  },
  eventToolbar: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 120,
    paddingBottom: 6,
    paddingHorizontal: 14,
    paddingTop: 54,
  },
  eventToolbarActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  eventToolbarIconButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  toolbarButtonPressed: {
    backgroundColor: EXPERIENCE_THEME.border,
    opacity: 0.76,
    transform: [{ scale: 0.96 }],
  },
  createEventAction: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    minHeight: 60,
    paddingLeft: 4,
    paddingRight: 2,
  },
  createEventActionLabel: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
  },
  createEventProfileButton: {
    alignItems: "center",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    position: "relative",
    width: 60,
  },
  createEventRing: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  createEventAvatarInset: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  createEventAvatar: {
    backgroundColor: EXPERIENCE_THEME.border,
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  createEventAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  createEventAvatarText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 18,
    fontWeight: "900",
  },
  createEventBadge: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.background,
    borderRadius: 10,
    borderWidth: 2,
    bottom: 1,
    height: 21,
    justifyContent: "center",
    position: "absolute",
    right: 1,
    shadowColor: EXPERIENCE_THEME.heading,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: 21,
  },
  attendeeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 9,
  },
  attendeeIcon: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.heading,
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  attendeeText: {
    color: EXPERIENCE_THEME.paragraph,
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  avatar: {
    borderColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    width: 24,
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  avatarStack: {
    flexDirection: "row",
  },
  committeeAvatar: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.heading,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  committeeAvatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  committeeBody: {
    flex: 1,
    marginLeft: 12,
  },
  committeeMeta: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  committeeRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 12,
  },
  committeeTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 15,
    fontWeight: "800",
  },
  committeeTrend: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 11,
    fontWeight: "800",
    maxWidth: 96,
    textAlign: "right",
  },
  bookmarkButton: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardPressed: {
    backgroundColor: EXPERIENCE_THEME.background,
  },
  cardTitle: {
    color: EXPERIENCE_THEME.heading,
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  cardTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    marginBottom: 2,
  },
  cardTop: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  chip: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.heading,
  },
  chipText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipsContent: {
    gap: 8,
    paddingBottom: 4,
  },
  communityBody: {
    flex: 1,
    minWidth: 0,
  },
  communityCard: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    padding: 14,
  },
  communityDescription: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  communityMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 9,
  },
  communityMetaText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 11,
    marginRight: 8,
  },
  communitySection: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 110,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  communityThumb: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  communityTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "700",
  },
  container: {
    backgroundColor: EXPERIENCE_THEME.background,
    flex: 1,
  },
  controls: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  organiserAvatar: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  organiserAvatarText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 14,
    fontWeight: "900",
  },
  organiserCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 12,
    padding: 14,
    width: 148,
  },
  organiserContent: {
    paddingRight: 16,
  },
  organiserEvents: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10,
  },
  organiserName: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
    textAlign: "center",
  },
  organiserSpecialty: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
    minHeight: 34,
    textAlign: "center",
  },
  createButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    height: 48,
    justifyContent: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 14,
    fontWeight: "800",
  },
  createCard: {
    backgroundColor: "#2B1308",
    borderRadius: 24,
    padding: 24,
  },
  createIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  createSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  createText: {
    color: EXPERIENCE_THEME.border,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  createTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 16,
  },
  dot: {
    backgroundColor: EXPERIENCE_THEME.paragraph,
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  disabledButton: {
    opacity: 0.55,
  },
  activityFootnote: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 12,
  },
  emptySectionCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  emptySectionText: {
    color: EXPERIENCE_THEME.paragraph,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  inlineLoader: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineLoaderText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "800",
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    alignItems: "center",
    backgroundColor: "rgba(255,248,236,0.96)",
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 38,
  },
  headerBack: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 34,
    lineHeight: 34,
  },
  headerIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 18,
    fontWeight: "700",
  },
  joinButton: {
    alignItems: "center",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    marginTop: 12,
  },
  joinButtonActive: {
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.heading,
  },
  joinButtonText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "700",
  },
  joinButtonTextActive: {
    color: "#FFFFFF",
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 28,
  },
  distanceBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: "absolute",
    top: 16,
  },
  distanceText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: "700",
  },
  eventCountBadge: {
    backgroundColor: EXPERIENCE_THEME.heading,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: "absolute",
    right: 16,
    top: 16,
  },
  eventCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  mapCanvas: {
    backgroundColor: EXPERIENCE_THEME.background,
    height: 500,
    marginTop: 12,
    overflow: "hidden",
    position: "relative",
  },
  mapChipDot: {
    backgroundColor: EXPERIENCE_THEME.paragraph,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  mapControlButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  mapControls: {
    bottom: 16,
    gap: 8,
    position: "absolute",
    right: 16,
  },
  mapFilterChip: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    height: 34,
    paddingHorizontal: 14,
  },
  mapFilterChipActive: {
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.heading,
  },
  mapFilterContent: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  mapFilterText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "700",
  },
  mapFilterTextActive: {
    color: "#FFFFFF",
  },
  mapGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#EFEFEF",
  },
  mapGridHorizontal: {
    backgroundColor: "rgba(115,115,115,0.22)",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  mapGridVertical: {
    backgroundColor: "rgba(115,115,115,0.22)",
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 1,
  },
  mapMarker: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.paragraph,
    borderColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 4,
    height: 40,
    justifyContent: "center",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    width: 40,
  },
  mapScrollContent: {
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingBottom: 110,
  },
  mapSearchCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  mapSearchInput: {
    color: EXPERIENCE_THEME.heading,
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    minHeight: 32,
  },
  micButton: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  metaMuted: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    color: EXPERIENCE_THEME.paragraph,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "500",
  },
  rsvpButton: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.heading,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 40,
    justifyContent: "center",
  },
  rsvpButtonActive: {
    backgroundColor: "#5CE65C",
    borderColor: '#f9f8f6',
  },
  rsvpButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  rsvpButtonTextActive: {
    color: EXPERIENCE_THEME.paragraph,
  },
  productAction: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "800",
  },
  productHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  productHeaderCopy: {
    flex: 1,
    paddingRight: 12,
  },
  productSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  productSectionAlt: {
    backgroundColor: EXPERIENCE_THEME.background,
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  productSubtitle: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 4,
  },
  productTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 20,
    fontWeight: "900",
  },
  productWrap: {
    backgroundColor: "#FFFFFF",
  },
  productWrapCompact: {
    paddingTop: 4,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickIcon: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  quickLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
  },
  quickTile: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: 3,
    padding: 14,
    width: "100%",
  },
  schedulerContent: {
    gap: 9,
    paddingRight: 16,
  },
  schedulerCount: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
  },
  schedulerCountActive: {
    color: "#FFFFFF",
  },
  schedulerDay: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 108,
    paddingHorizontal: 12,
    paddingVertical: 13,
    width: 78,
  },
  schedulerDayActive: {
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.heading,
  },
  schedulerDayText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "900",
  },
  schedulerDayTextActive: {
    color: EXPERIENCE_THEME.border,
  },
  schedulerLabel: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  schedulerLabelActive: {
    color: "#FFFFFF",
  },
  nearbyBody: {
    padding: 12,
  },
  nearbyCard: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    overflow: "hidden",
    width: 280,
  },
  nearbyCardTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 14,
    fontWeight: "800",
  },
  nearbyCardsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  nearbyDescription: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  nearbyEmpty: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    marginRight: 12,
    padding: 14,
    width: 260,
  },
  nearbyDistanceBadge: {
    alignItems: "center",
    backgroundColor: "rgba(23,23,23,0.82)",
    borderRadius: 12,
    bottom: 8,
    flexDirection: "row",
    gap: 4,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: "absolute",
  },
  nearbyDistanceText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  nearbyHeader: {
    alignItems: "center",
    borderBottomColor: EXPERIENCE_THEME.background,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  nearbyHeart: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 28,
  },
  nearbyImage: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.border,
    height: 128,
    justifyContent: "center",
    position: "relative",
  },
  nearbyImageText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "700",
  },
  nearbyMetaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  nearbyMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  nearbyMetaText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 10,
    fontWeight: "600",
  },
  nearbySheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -44,
    shadowColor: "#000",
    shadowOffset: { height: -6, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  nearbySubtitle: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  nearbyTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 18,
    fontWeight: "800",
  },
  nearbyTypeBadge: {
    backgroundColor: EXPERIENCE_THEME.paragraph,
    borderRadius: 10,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: "absolute",
    top: 8,
  },
  nearbyTypeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  nearbyViewAll: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "800",
  },
  section: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionCount: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionError: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FFE4E6",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  sectionErrorText: {
    color: "#B42318",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  sectionLoader: {
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 20,
    fontWeight: "800",
  },
  shareButton: {
    alignItems: "center",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  skeletonBody: {
    flex: 1,
    gap: 8,
  },
  skeletonCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  skeletonLine: {
    backgroundColor: EXPERIENCE_THEME.border,
    borderRadius: 6,
    height: 10,
    width: "58%",
  },
  skeletonLineWide: {
    backgroundColor: EXPERIENCE_THEME.border,
    borderRadius: 6,
    height: 12,
    width: "82%",
  },
  skeletonPill: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderRadius: 12,
    height: 24,
    width: 104,
  },
  skeletonThumb: {
    backgroundColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    height: 62,
    width: 62,
  },
  smallSectionTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 18,
    fontWeight: "800",
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    width: "48%",
  },
  statIcon: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    marginBottom: 12,
    width: 40,
  },
  statLabel: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  statsSection: {
    backgroundColor: EXPERIENCE_THEME.background,
    padding: 16,
    paddingVertical: 24,
  },
  statValue: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 2,
  },
  storyAccent: {
    backgroundColor: EXPERIENCE_THEME.heading,
    borderRadius: 3,
    width: 5,
  },
  storyBody: {
    flex: 1,
    paddingLeft: 12,
  },
  storyBy: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10,
  },
  storyCard: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 14,
  },
  storyText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 5,
  },
  storyTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 15,
    fontWeight: "900",
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: EXPERIENCE_THEME.border,
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    marginTop: 12,
    width: 48,
  },
  thumbnail: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    height: 80,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 8,
    width: 80,
  },
  thumbnailText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  trendingBody: {
    flex: 1,
    minWidth: 0,
  },
  trendingMeta: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  trendingRank: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 22,
    fontWeight: "900",
    marginRight: 12,
    width: 36,
  },
  trendingRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 12,
  },
  trendingTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 15,
    fontWeight: "900",
  },
  trendingValue: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 10,
  },
  typeGuideCard: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 12,
    padding: 14,
    width: 168,
  },
  typeGuideContent: {
    paddingRight: 16,
  },
  typeGuideCount: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 12,
  },
  typeGuideIcon: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  typeGuideSummary: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    minHeight: 50,
  },
  typeGuideTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
  },
  toggleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 44,
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.heading,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  toggleRowWithoutFilters: {
    marginBottom: 0,
  },
  toggleText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  viewAllText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "700",
  },
  viewMoreButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 2,
    flexDirection: "row",
    gap: 8,
    height: 48,
    justifyContent: "center",
  },
  viewMoreText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "700",
  },
  userMarker: {
    alignItems: "center",
    backgroundColor: "rgba(115,115,115,0.28)",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    left: "50%",
    marginLeft: -28,
    marginTop: -28,
    position: "absolute",
    top: "50%",
    width: 56,
  },
  userMarkerCore: {
    backgroundColor: EXPERIENCE_THEME.paragraph,
    borderColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 4,
    height: 16,
    width: 16,
  },
});
