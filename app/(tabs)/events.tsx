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
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import {
  Bookmark,
  Calendar,
  CalendarCheck,
  ChevronDown,
  Clock3,
  HandHeart,
  Heart,
  LocateFixed,
  List,
  Map,
  MapPin,
  Mic,
  Minus,
  Music,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Stethoscope,
  Users,
} from "lucide-react-native";

import {
  fetchCommunityCalendarsRequest,
  fetchEventsHomeRequest,
  fetchEventsRequest,
  fetchNearbyEventsRequest,
} from "@/store/events/actions";
import {
  selectCommunityCalendars,
  selectCommunityCalendarsLoading,
  selectEventsError,
  selectEventsFeed,
  selectEventsHome,
  selectEventsHomeLoading,
  selectEventsLoading,
  selectNearbyEvents,
  selectNearbyEventsLoading,
} from "@/store/events/selectors";
import {
  CommunityCalendar,
  EventHomeResult,
  EventType,
  SaiEvent,
} from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

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

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
};

const endOfWeek = () => {
  const date = startOfToday();
  date.setDate(date.getDate() + 7);
  return date;
};

const endOfMonth = () => {
  const date = startOfToday();
  date.setMonth(date.getMonth() + 1);
  return date;
};

const isBetween = (event: SaiEvent, start: Date, end: Date) => {
  const time = new Date(event.startAt).getTime();
  return time >= start.getTime() && time < end.getTime();
};

const isFutureEvent = (event: SaiEvent) =>
  new Date(event.startAt).getTime() >= Date.now();

const sortBySoonest = (items: SaiEvent[]) =>
  [...items].sort(
    (a, b) =>
      new Date(a.startAt).getTime() -
      new Date(b.startAt).getTime()
  );

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
  key: string,
  fallback: number
) => home?.sections?.[key]?.count ?? fallback;

function EventsScreen() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEventsFeed);
  const home = useAppSelector(selectEventsHome);
  const homeLoading = useAppSelector(selectEventsHomeLoading);
  const nearbyEvents = useAppSelector(selectNearbyEvents);
  const nearbyLoading = useAppSelector(selectNearbyEventsLoading);
  const communityCalendars = useAppSelector(selectCommunityCalendars);
  const communityCalendarsLoading = useAppSelector(selectCommunityCalendarsLoading);
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

  useEffect(() => {
    dispatch(fetchEventsRequest(fetchParams));
    dispatch(fetchEventsHomeRequest({limit: 5}));
    dispatch(fetchNearbyEventsRequest({limit: 20, radius: 25}));
    dispatch(fetchCommunityCalendarsRequest());
  }, [dispatch, fetchParams]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchEventsRequest(fetchParams));
    dispatch(fetchEventsHomeRequest({limit: 5}));
    dispatch(fetchNearbyEventsRequest({limit: 20, radius: 25}));
    dispatch(fetchCommunityCalendarsRequest());
    setTimeout(() => setRefreshing(false), 700);
  }, [dispatch, fetchParams]);

  const futureEvents = useMemo(
    () => sortBySoonest(events.filter(isFutureEvent)),
    [events]
  );
  const today = useMemo(() => {
    const start = startOfToday();
    const end = endOfToday();
    return sortBySoonest(events.filter((event) => isBetween(event, start, end)));
  }, [events]);
  const week = useMemo(() => {
    const start = endOfToday();
    const end = endOfWeek();
    return sortBySoonest(events.filter((event) => isBetween(event, start, end)));
  }, [events]);
  const month = useMemo(() => {
    const start = endOfWeek();
    const end = endOfMonth();
    return sortBySoonest(events.filter((event) => isBetween(event, start, end)));
  }, [events]);
  const later = useMemo(() => {
    const start = endOfMonth();
    return sortBySoonest(
      events.filter(
        (event) => new Date(event.startAt).getTime() >= start.getTime()
      )
    );
  }, [events]);
  const nearbyLiveEvents = useMemo(
    () =>
      (nearbyEvents.length ? nearbyEvents : futureEvents)
        .slice()
        .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
        .slice(0, 8),
    [futureEvents, nearbyEvents]
  );

  const todayEvents = sectionEventsFromHome(home, "happeningToday");
  const weekEvents = sectionEventsFromHome(home, "thisWeek");
  const monthEvents = sectionEventsFromHome(home, "thisMonth");
  const laterEvents = sectionEventsFromHome(home, "comingSoon");

  const sections = [
    {
      background: "#FFFFFF",
      count: `${sectionCountFromHome(home, "happeningToday", today.length)} events`,
      events: (todayEvents.length ? todayEvents : today).slice(0, 4).map(toUiEvent),
      title: "Happening Today",
    },
    {
      background: "#FAFAF9",
      count: `${sectionCountFromHome(home, "thisWeek", week.length)} events`,
      events: (weekEvents.length ? weekEvents : week).slice(0, 4).map(toUiEvent),
      title: "This Week",
    },
    {
      background: "#FFFFFF",
      count: `${sectionCountFromHome(home, "thisMonth", month.length)} events`,
      events: (monthEvents.length ? monthEvents : month).slice(0, 4).map(toUiEvent),
      title: "This Month",
    },
    {
      background: "#FAFAF9",
      count: `${sectionCountFromHome(home, "comingSoon", later.length)} events`,
      events: (laterEvents.length ? laterEvents : later).slice(0, 4).map(toUiEvent),
      title: "Coming Soon",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <Text style={styles.headerBack}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Events</Text>
        <Pressable style={styles.headerIcon}>
          <SlidersHorizontal color="#1F2937" size={20} />
        </Pressable>
      </View>

      <View style={styles.controls}>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setViewMode("map")}
            style={[
              styles.toggleButton,
              viewMode === "map" && styles.toggleButtonActive,
            ]}
          >
            <Map color={viewMode === "map" ? "#FFFFFF" : "#6B7280"} size={16} />
            <Text style={viewMode === "map" ? styles.toggleTextActive : styles.toggleText}>Map</Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("list")}
            style={[
              styles.toggleButton,
              viewMode === "list" && styles.toggleButtonActive,
            ]}
          >
            <List color={viewMode === "list" ? "#FFFFFF" : "#6B7280"} size={16} />
            <Text style={viewMode === "list" ? styles.toggleTextActive : styles.toggleText}>List</Text>
          </Pressable>
        </View>

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
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {viewMode === "map" ? (
        <MapOverview events={nearbyLiveEvents} loading={nearbyLoading} />
      ) : (
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#1F2937"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {(loading || homeLoading) && events.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#1F2937" size="large" />
          </View>
        ) : null}

        {sections.map((section) => (
          <EventSection
            key={section.title}
            background={section.background}
            count={section.count}
            events={[...section.events]}
            title={section.title}
          />
        ))}

        <EventProductSections events={futureEvents} home={home} />
        <CreateEventCta />
        <ActivityStats events={events} home={home} />
        <SuggestedCommunities
          calendars={communityCalendars}
          loading={communityCalendarsLoading}
        />
      </ScrollView>
      )}
    </View>
  );
}

function MapOverview({
  events,
  loading,
}: {
  events: SaiEvent[];
  loading: boolean;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.mapScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mapSearchCard}>
        <Search color="#9CA3AF" size={16} />
        <TextInput
          placeholder="Search events, places..."
          placeholderTextColor="#9CA3AF"
          style={styles.mapSearchInput}
        />
        <Pressable style={styles.micButton}>
          <Mic color="#6B7280" size={14} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.mapFilterContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {["All Events", "Bhajan", "Pooja", "Seva", "Medical", "Today", "This Week"].map(
          (item, index) => (
            <Pressable
              key={item}
              style={[styles.mapFilterChip, index === 0 && styles.mapFilterChipActive]}
            >
              {index > 0 && index < 5 ? <View style={styles.mapChipDot} /> : null}
              <Text style={[styles.mapFilterText, index === 0 && styles.mapFilterTextActive]}>
                {item}
              </Text>
            </Pressable>
          )
        )}
      </ScrollView>

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
          <MapPin color="#6B7280" size={13} />
          <Text style={styles.distanceText}>Within 10 km</Text>
        </View>

        <View style={styles.eventCountBadge}>
          <Text style={styles.eventCountText}>{events.length} Events</Text>
        </View>

        <View style={styles.mapControls}>
          <MapControlButton icon={<Plus color="#4B5563" size={16} />} />
          <MapControlButton icon={<Minus color="#4B5563" size={16} />} />
          <MapControlButton icon={<LocateFixed color="#4B5563" size={16} />} />
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

      <EventProductSections compact events={events} />
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
            color="#4B5563"
            fill={event.bookmarkedByMe ? "#6B7280" : "transparent"}
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
            <Calendar color="#9CA3AF" size={12} />
            <Text style={styles.nearbyMetaText}>{formatDate(event.startAt)}</Text>
          </View>
          <View style={styles.nearbyMetaItem}>
            <Users color="#9CA3AF" size={12} />
            <Text style={styles.nearbyMetaText}>{event.rsvps || 0} going</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function EventSection({
  background,
  count,
  events,
  moreLabel,
  title,
}: {
  background: string;
  count: string;
  events: UiEvent[];
  moreLabel?: string;
  title: string;
}) {
  return (
    <View style={[styles.section, { backgroundColor: background }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>

      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}

      {!events.length && (
        <View style={styles.emptySectionCard}>
          <Calendar color="#9CA3AF" size={18} />
          <Text style={styles.emptySectionText}>
            No live events returned for this section.
          </Text>
        </View>
      )}

      {!!moreLabel && (
        <Pressable style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>{moreLabel}</Text>
          <ChevronDown color="#4B5563" size={16} />
        </Pressable>
      )}
    </View>
  );
}

function EventCard({ event }: { event: UiEvent }) {
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
            <Pressable style={styles.bookmarkButton}>
              <Bookmark
                color="#6B7280"
                fill={event.bookmarked ? "#1F2937" : "transparent"}
                size={18}
              />
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
        <Pressable style={[styles.rsvpButton, event.going && styles.rsvpButtonActive]}>
          <CalendarCheck color={event.going ? "#FFFFFF" : "#4B5563"} size={16} />
          <Text style={[styles.rsvpButtonText, event.going && styles.rsvpButtonTextActive]}>
            {event.going ? "Going" : "Interested"}
          </Text>
        </Pressable>
        <Pressable style={styles.shareButton}>
          <Share2 color="#4B5563" size={16} />
        </Pressable>
      </View>
    </Pressable>
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
      <Icon color="#6B7280" size={13} />
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
  events,
  home,
}: {
  compact?: boolean;
  events: SaiEvent[];
  home?: EventHomeResult | null;
}) {
  return (
    <View style={[styles.productWrap, compact && styles.productWrapCompact]}>
      <EventTypeGuide events={events} home={home} />
      <TrendingThisWeek events={events} home={home} />
      <EventQuickActions />
      <WeekScheduler events={events} home={home} />
      <TopOrganisers home={home} />
    </View>
  );
}

function EventTypeGuide({
  events,
  home,
}: {
  events: SaiEvent[];
  home?: EventHomeResult | null;
}) {
  const guide =
    home?.eventTypeGuide?.length
      ? home.eventTypeGuide.map((item) => {
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
        })
      : EVENT_FILTERS.filter((item) => item.value !== "all").map((item) => {
      const Icon = getTypeIcon(item.value);
      const count = events.filter((event) => event.type === item.value).length;

      return {
        count: `${count} live`,
        icon: Icon,
        label: item.label,
        summary: `Live ${item.label.toLowerCase()} gatherings from backend.`,
        type: item.value,
      };
    });

  return (
    <View style={styles.productSection}>
      <SectionHeading
        subtitle="Choose the right gathering faster"
        title="Event Type Guide"
      />
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
                <Icon color="#1F2937" size={22} />
              </View>
              <Text style={styles.typeGuideTitle}>{item.label}</Text>
              <Text style={styles.typeGuideSummary}>{item.summary}</Text>
              <Text style={styles.typeGuideCount}>{item.count}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TrendingThisWeek({
  events,
  home,
}: {
  events: SaiEvent[];
  home?: EventHomeResult | null;
}) {
  const trending = (
    home?.trendingThisWeek?.length
      ? home.trendingThisWeek
      : [...events].sort((a, b) => (b.rsvps || 0) - (a.rsvps || 0))
  ).slice(0, 5);

  return (
    <View style={styles.productSection}>
      <SectionHeading
        action="View all"
        subtitle="Most saved and most RSVP activity"
        title="Trending This Week"
      />
      {trending.map((event, index) => (
        <Pressable
          key={event.id}
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
      {!trending.length && (
        <Text style={styles.emptySectionText}>No trending events yet.</Text>
      )}
    </View>
  );
}

function EventQuickActions() {
  const actions = [
    {
      href: "/events/create",
      icon: Plus,
      label: "Create",
    },
    {
      href: "/events/calendar",
      icon: Calendar,
      label: "Calendar",
    },
    {
      href: "/events/rsvps",
      icon: CalendarCheck,
      label: "My RSVPs",
    },
    {
      href: "/events/my-events",
      icon: Bookmark,
      label: "My Events",
    },
  ] as const;

  return (
    <View style={styles.productSection}>
      <SectionHeading
        subtitle="Shortcuts for your regular event work"
        title="Quick Actions"
      />
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
                <Icon color="#1F2937" size={20} />
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
  events,
  home,
}: {
  events: SaiEvent[];
  home?: EventHomeResult | null;
}) {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayIndex = new Date().getDay();
  const schedule =
    home?.weeklySchedule?.length
      ? home.weeklySchedule.map((item) => ({
          count: item.count || 0,
          day: item.day || "",
          label:
            item.label ||
            (item.type ? eventTypeLabel(item.type) : "Open"),
        }))
      : weekdays.map((day, index) => {
          const count = events.filter(
            (event) => new Date(event.startAt).getDay() === index
          ).length;
          const firstType = events.find(
            (event) => new Date(event.startAt).getDay() === index
          )?.type;

          return {
            count,
            day,
            label: firstType ? eventTypeLabel(firstType) : "Open",
          };
        });

  return (
    <View style={styles.productSectionAlt}>
      <SectionHeading
        subtitle="Scan event density across the current week"
        title="This Week Scheduler"
      />
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
    </View>
  );
}

function TopOrganisers({
  home,
}: {
  home?: EventHomeResult | null;
}) {
  const organisers = home?.topOrganisers || [];

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
        {organisers.map((organiser) => (
          <View key={organiser.id || organiser.name} style={styles.organiserCard}>
            <View style={styles.organiserAvatar}>
              <Text style={styles.organiserAvatarText}>
                {organiser.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <Text numberOfLines={1} style={styles.organiserName}>
              {organiser.name}
            </Text>
            <Text numberOfLines={2} style={styles.organiserSpecialty}>
              {organiser.specialty || "Community organizer"}
            </Text>
            <Text style={styles.organiserEvents}>
              {organiser.eventsOrganized || 0} events
            </Text>
          </View>
        ))}
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

function CreateEventCta() {
  return (
    <View style={styles.createSection}>
      <View style={styles.createCard}>
        <View style={styles.createIcon}>
          <Plus color="#FFFFFF" size={22} />
        </View>
        <Text style={styles.createTitle}>Host Your Event</Text>
        <Text style={styles.createText}>
          Share your spiritual gatherings, satsangs, and community events with the Sai Family.
        </Text>
        <Pressable onPress={() => router.push("/events/create")} style={styles.createButton}>
          <Plus color="#1F2937" size={16} />
          <Text style={styles.createButtonText}>Create New Event</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ActivityStats({
  events,
  home,
}: {
  events: SaiEvent[];
  home: EventHomeResult | null;
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
        <StatCard icon={<CalendarCheck color="#1F2937" size={19} />} label="Events Listed" value={String(stats?.totalEvents ?? events.length)} />
        <StatCard icon={<Users color="#1F2937" size={19} />} label="Total RSVPs" value={String(stats?.totalRsvps ?? totalRsvps)} />
        <StatCard icon={<Bookmark color="#1F2937" size={19} />} label="Bookmarked" value={String(stats?.savedEvents ?? bookmarked)} />
        <StatCard icon={<MapPin color="#1F2937" size={19} />} label="Cities" value={String(cities)} />
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
        {loading && <ActivityIndicator color="#F97316" />}
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
              <Users color="#6B7280" size={13} />
              <Text style={styles.communityMetaText}>{calendar.subscribers ?? 0} subscribers</Text>
              <Calendar color="#6B7280" size={13} />
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
          <Users color="#9CA3AF" size={18} />
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
  attendeeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 9,
  },
  attendeeIcon: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  attendeeText: {
    color: "#6B7280",
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
    backgroundColor: "#F97316",
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
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  committeeRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 12,
  },
  committeeTitle: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "800",
  },
  committeeTrend: {
    color: "#4B5563",
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
    borderColor: "#F6EFD9",
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
    backgroundColor: "#FAFAF9",
  },
  cardTitle: {
    color: "#1F2937",
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
    borderColor: "#F1E8DA",
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  chipText: {
    color: "#4B5563",
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
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    padding: 14,
  },
  communityDescription: {
    color: "#6B7280",
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
    color: "#6B7280",
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
    backgroundColor: "#F1E8DA",
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  communityTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "700",
  },
  container: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },
  controls: {
    backgroundColor: "#FAFAF9",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  organiserAvatar: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  organiserAvatarText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  organiserCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
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
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10,
  },
  organiserName: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
    textAlign: "center",
  },
  organiserSpecialty: {
    color: "#6B7280",
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
    color: "#1F2937",
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
    color: "#F1E8DA",
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
    backgroundColor: "#9CA3AF",
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  activityFootnote: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 12,
  },
  emptySectionCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  emptySectionText: {
    color: "#6B7280",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
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
    backgroundColor: "rgba(250,250,249,0.96)",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 54,
  },
  headerBack: {
    color: "#1F2937",
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
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "700",
  },
  joinButton: {
    alignItems: "center",
    borderColor: "#F1E8DA",
    borderRadius: 12,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    marginTop: 12,
  },
  joinButtonActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  joinButtonText: {
    color: "#4B5563",
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
    borderColor: "#F6EFD9",
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
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "700",
  },
  eventCountBadge: {
    backgroundColor: "#F97316",
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
    backgroundColor: "#FFF7ED",
    height: 500,
    marginTop: 12,
    overflow: "hidden",
    position: "relative",
  },
  mapChipDot: {
    backgroundColor: "#9CA3AF",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  mapControlButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
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
    borderColor: "#F6EFD9",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    height: 34,
    paddingHorizontal: 14,
  },
  mapFilterChipActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  mapFilterContent: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  mapFilterText: {
    color: "#4B5563",
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
    backgroundColor: "#6B7280",
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
    backgroundColor: "#FFFFFF",
    paddingBottom: 110,
  },
  mapSearchCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: "#F6EFD9",
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
    color: "#1F2937",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    minHeight: 32,
  },
  micButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  metaMuted: {
    color: "#6B7280",
    fontSize: 12,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    color: "#6B7280",
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "500",
  },
  rsvpButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F1E8DA",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 40,
    justifyContent: "center",
  },
  rsvpButtonActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  rsvpButtonText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "700",
  },
  rsvpButtonTextActive: {
    color: "#FFFFFF",
  },
  productAction: {
    color: "#4B5563",
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
    backgroundColor: "#FAFAF9",
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  productSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 4,
  },
  productTitle: {
    color: "#1F2937",
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
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  quickLabel: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
  },
  quickTile: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    width: "48%",
  },
  schedulerContent: {
    gap: 9,
    paddingRight: 16,
  },
  schedulerCount: {
    color: "#1F2937",
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
    borderColor: "#F6EFD9",
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 108,
    paddingHorizontal: 12,
    paddingVertical: 13,
    width: 78,
  },
  schedulerDayActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  schedulerDayText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "900",
  },
  schedulerDayTextActive: {
    color: "#F1E8DA",
  },
  schedulerLabel: {
    color: "#6B7280",
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
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    overflow: "hidden",
    width: 280,
  },
  nearbyCardTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "800",
  },
  nearbyCardsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  nearbyDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  nearbyEmpty: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
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
    borderBottomColor: "#FFF7ED",
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
    backgroundColor: "#F6EFD9",
    height: 128,
    justifyContent: "center",
    position: "relative",
  },
  nearbyImageText: {
    color: "#9CA3AF",
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
    color: "#6B7280",
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
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  nearbyTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "800",
  },
  nearbyTypeBadge: {
    backgroundColor: "#6B7280",
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
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
  },
  section: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionCount: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "800",
  },
  shareButton: {
    alignItems: "center",
    borderColor: "#F1E8DA",
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  smallSectionTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "800",
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    width: "48%",
  },
  statIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    marginBottom: 12,
    width: 40,
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  statsSection: {
    backgroundColor: "#FAFAF9",
    padding: 16,
    paddingVertical: 24,
  },
  statValue: {
    color: "#1F2937",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 2,
  },
  storyAccent: {
    backgroundColor: "#F97316",
    borderRadius: 3,
    width: 5,
  },
  storyBody: {
    flex: 1,
    paddingLeft: 12,
  },
  storyBy: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10,
  },
  storyCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 14,
  },
  storyText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 5,
  },
  storyTitle: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#F1E8DA",
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    marginTop: 12,
    width: 48,
  },
  thumbnail: {
    alignItems: "center",
    backgroundColor: "#F1E8DA",
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
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  trendingRank: {
    color: "#9CA3AF",
    fontSize: 22,
    fontWeight: "900",
    marginRight: 12,
    width: 36,
  },
  trendingRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 12,
  },
  trendingTitle: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
  },
  trendingValue: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 10,
  },
  typeGuideCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
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
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 12,
  },
  typeGuideIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  typeGuideSummary: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    minHeight: 50,
  },
  typeGuideTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
  },
  toggleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F1E8DA",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 44,
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  toggleText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  viewAllText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "700",
  },
  viewMoreButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F1E8DA",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 2,
    flexDirection: "row",
    gap: 8,
    height: 48,
    justifyContent: "center",
  },
  viewMoreText: {
    color: "#4B5563",
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
    backgroundColor: "#6B7280",
    borderColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 4,
    height: 16,
    width: 16,
  },
});
