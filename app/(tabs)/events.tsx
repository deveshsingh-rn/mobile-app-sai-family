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
  Check,
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

import { fetchEventsRequest } from "@/store/events/actions";
import {
  selectEventsError,
  selectEventsFeed,
  selectEventsLoading,
} from "@/store/events/selectors";
import {
  EventType,
  SaiEvent,
} from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

const EVENT_FILTERS: {
  label: string;
  value: EventType | "all" | "festival";
}[] = [
  { label: "All Events", value: "all" },
  { label: "Bhajan", value: "bhajan" },
  { label: "Seva", value: "seva" },
  { label: "Satsang", value: "satsang" },
  { label: "Festival", value: "festival" },
  { label: "Pooja", value: "pooja" },
];

const staticSections = [
  {
    background: "#FFFFFF",
    count: "3 events",
    title: "Happening Today",
    events: [
      {
        attendees: "+47 attending",
        bookmarked: false,
        date: "Today",
        going: true,
        id: "today-bhajan",
        imageLabel: "Evening Bhajan",
        location: "Sai Temple, Downtown",
        title: "Evening Bhajan Session",
        time: "6:00 PM - 7:30 PM",
        urgency: "In 2 hours",
      },
      {
        attendees: "+23 volunteering",
        bookmarked: true,
        date: "Today",
        going: false,
        id: "today-seva",
        imageLabel: "Seva Program",
        location: "Community Center, East Side",
        title: "Community Food Seva",
        time: "8:00 PM - 9:00 PM",
        urgency: "In 4 hours",
      },
      {
        attendees: "+89 attending",
        bookmarked: false,
        date: "Today",
        going: false,
        id: "today-aarti",
        imageLabel: "Aarti Ceremony",
        location: "Shirdi Sai Mandir, North Area",
        title: "Night Aarti & Prasad",
        time: "9:30 PM - 10:00 PM",
        urgency: "In 5 hours",
      },
    ],
  },
  {
    background: "#FAFAF9",
    count: "8 events",
    title: "This Week",
    events: [
      {
        attendees: "+34 interested",
        bookmarked: false,
        date: "Fri, Jan 26",
        going: false,
        id: "week-satsang",
        imageLabel: "Satsang",
        location: "Sai Spiritual Center",
        title: "Weekly Spiritual Discourse",
        time: "7:00 PM",
      },
      {
        attendees: "+18 interested",
        bookmarked: false,
        date: "Sat, Jan 27",
        going: false,
        id: "week-youth",
        imageLabel: "Youth Program",
        location: "Yoga & Meditation Hall",
        title: "Youth Meditation Workshop",
        time: "10:00 AM",
      },
      {
        attendees: "+62 going",
        bookmarked: true,
        date: "Sat, Jan 27",
        going: true,
        id: "week-bhajan",
        imageLabel: "Bhajan Night",
        location: "Main Temple Hall",
        title: "Saturday Bhajan Sandhya",
        time: "6:30 PM",
      },
      {
        attendees: "+28 volunteering",
        bookmarked: false,
        date: "Sun, Jan 28",
        going: false,
        id: "week-seva",
        imageLabel: "Seva Activity",
        location: "Sai Temple Complex",
        title: "Sunday Temple Cleaning Seva",
        time: "8:00 AM",
      },
    ],
    moreLabel: "View 3 More This Week",
  },
  {
    background: "#FFFFFF",
    count: "12 events",
    title: "This Month",
    events: [
      {
        attendees: "+156 interested",
        bookmarked: false,
        date: "Tue, Feb 6",
        going: false,
        id: "month-festival",
        imageLabel: "Festival",
        location: "Grand Temple Complex",
        title: "Maha Shivaratri Celebration",
        time: "All Day",
      },
      {
        attendees: "+41 going",
        bookmarked: true,
        date: "Sat, Feb 10",
        going: true,
        id: "month-workshop",
        imageLabel: "Workshop",
        location: "Cultural Center Hall",
        title: "Vedic Chanting Workshop",
        time: "3:00 PM",
      },
      {
        attendees: "+27 interested",
        bookmarked: false,
        date: "Thu, Feb 15",
        going: false,
        id: "month-pooja",
        imageLabel: "Pooja",
        location: "Pooja Hall, Main Temple",
        title: "Satyanarayana Vratam Pooja",
        time: "6:00 PM",
      },
    ],
    moreLabel: "View 8 More This Month",
  },
  {
    background: "#FAFAF9",
    count: "15 events",
    title: "Coming Soon",
    events: [
      {
        attendees: "+38 interested",
        bookmarked: false,
        date: "Mar 8-10",
        going: false,
        id: "soon-retreat",
        imageLabel: "Retreat",
        location: "Mountain Retreat Center",
        title: "Weekend Spiritual Retreat",
        time: "3 Days",
      },
      {
        attendees: "+72 going",
        bookmarked: true,
        date: "Apr 12-15",
        going: true,
        id: "soon-shirdi",
        imageLabel: "Pilgrimage",
        location: "Shirdi, Maharashtra",
        title: "Shirdi Darshan Group Trip",
        time: "4 Days",
      },
      {
        attendees: "+198 interested",
        bookmarked: false,
        date: "Tue, Apr 16",
        going: false,
        id: "soon-ram",
        imageLabel: "Festival",
        location: "Grand Temple Complex",
        title: "Ram Navami Grand Celebration",
        time: "All Day",
      },
    ],
    moreLabel: "View 12 More Upcoming",
  },
] as const;

const communities = [
  {
    description:
      "Connect with young devotees, organize events, and share spiritual experiences",
    events: "15 events/month",
    joined: true,
    members: "2.4K members",
    title: "Youth Sai Devotees",
  },
  {
    description:
      "Join hands in service activities, food distribution, and community welfare programs",
    events: "22 events/month",
    joined: false,
    members: "1.8K members",
    title: "Seva Volunteers Network",
  },
  {
    description:
      "Learn devotional songs, participate in bhajan sessions, and celebrate through music",
    events: "18 events/month",
    joined: false,
    members: "3.1K members",
    title: "Bhajan & Kirtan Circle",
  },
];

const nearbyEvents = [
  {
    attendees: "45 going",
    bookmarked: false,
    date: "Today, 6:00 PM",
    description:
      "Join us for a divine evening of devotional singing and spiritual connection at the community center.",
    distance: "2.3 km away",
    title: "Thursday Evening Bhajan Sandhya",
    type: "Bhajan",
  },
  {
    attendees: "82 going",
    bookmarked: true,
    date: "Tomorrow, 7:00 AM",
    description:
      "Special worship ceremony honoring spiritual masters with traditional rituals and prasad distribution.",
    distance: "4.1 km away",
    title: "Guru Poornima Special Pooja",
    type: "Pooja",
  },
  {
    attendees: "28 going",
    bookmarked: false,
    date: "Saturday, 10:00 AM",
    description:
      "Volunteer opportunity to serve meals to the underprivileged community members with love.",
    distance: "5.8 km away",
    title: "Weekend Food Distribution Seva",
    type: "Seva",
  },
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

const eventTypeGuide = [
  {
    count: "18 this month",
    icon: Music,
    label: "Bhajan",
    summary: "Devotional music, aarti, and group singing.",
  },
  {
    count: "11 active",
    icon: HandHeart,
    label: "Seva",
    summary: "Food drives, temple help, and volunteer work.",
  },
  {
    count: "9 upcoming",
    icon: CalendarCheck,
    label: "Pooja",
    summary: "Rituals, vratam, prasad, and mandir ceremonies.",
  },
  {
    count: "5 camps",
    icon: Stethoscope,
    label: "Medical",
    summary: "Health camps and community care support.",
  },
];

const activeCommittees = [
  {
    initials: "SY",
    members: "42 members",
    title: "Sai Youth Events",
    trend: "+6 new helpers",
  },
  {
    initials: "SV",
    members: "67 members",
    title: "Seva Volunteers",
    trend: "3 drives this week",
  },
  {
    initials: "BM",
    members: "31 members",
    title: "Bhajan Mandali",
    trend: "2 rehearsals planned",
  },
];

const trendingEvents = [
  {
    meta: "Sat, 6:30 PM · Main Temple Hall",
    rank: "01",
    title: "Saturday Bhajan Sandhya",
    value: "62 going",
  },
  {
    meta: "Sun, 8:00 AM · Sai Temple Complex",
    rank: "02",
    title: "Temple Cleaning Seva",
    value: "28 volunteers",
  },
  {
    meta: "Tue, All Day · Grand Temple Complex",
    rank: "03",
    title: "Maha Shivaratri Celebration",
    value: "156 interested",
  },
];

const topOrganisers = [
  {
    avatar: "RS",
    events: "24 events",
    name: "Ravi Sharma",
    specialty: "Bhajan and satsang host",
  },
  {
    avatar: "PP",
    events: "19 events",
    name: "Priya Patel",
    specialty: "Seva coordination",
  },
  {
    avatar: "AD",
    events: "15 events",
    name: "Amit Desai",
    specialty: "Youth workshops",
  },
];

const weeklySchedule = [
  {
    day: "Mon",
    items: "2",
    label: "Reading",
  },
  {
    day: "Tue",
    items: "1",
    label: "Pooja",
  },
  {
    day: "Wed",
    items: "3",
    label: "Seva",
  },
  {
    day: "Thu",
    items: "4",
    label: "Bhajan",
  },
  {
    day: "Fri",
    items: "2",
    label: "Satsang",
  },
  {
    day: "Sat",
    items: "5",
    label: "Meetups",
  },
  {
    day: "Sun",
    items: "6",
    label: "Mandir",
  },
];

const communityStories = [
  {
    by: "Neha K.",
    text: "The food seva team helped serve 300 meals last Sunday with new volunteers from the app.",
    title: "Seva story",
  },
  {
    by: "Bhajan Circle",
    text: "Our weekly bhajan night moved to a bigger hall after 80 devotees joined through Events.",
    title: "Community growth",
  },
];

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
  bookmarked: false,
  date: formatDate(event.startAt),
  going: !!event.rsvpedByMe,
  id: event.id,
  imageLabel: event.type || "Event",
  location: event.venueName || event.city || event.address || "Location pending",
  sourceId: event.id,
  time: `${formatTime(event.startAt)} - ${formatTime(event.endAt)}`,
  title: event.title,
});

function EventsScreen() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEventsFeed);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);

  const [selectedType, setSelectedType] = useState<EventType | "all" | "festival">("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [refreshing, setRefreshing] = useState(false);

  const fetchParams = useMemo(
    () => ({
      limit: 20,
      page: 1,
      type:
        selectedType === "all" || selectedType === "festival"
          ? undefined
          : selectedType,
    }),
    [selectedType]
  );

  useEffect(() => {
    dispatch(fetchEventsRequest(fetchParams));
  }, [dispatch, fetchParams]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchEventsRequest(fetchParams));
    setTimeout(() => setRefreshing(false), 700);
  }, [dispatch, fetchParams]);

  const apiEvents = useMemo(() => events.slice(0, 3).map(toUiEvent), [events]);
  const firstSection = apiEvents.length > 0
    ? {
        ...staticSections[0],
        count: `${apiEvents.length} events`,
        events: apiEvents,
      }
    : staticSections[0];

  const sections = [firstSection, ...staticSections.slice(1)];

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
        <MapOverview />
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
        {loading && events.length === 0 ? (
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
            moreLabel={"moreLabel" in section ? section.moreLabel : undefined}
            title={section.title}
          />
        ))}

        <EventProductSections />
        <CreateEventCta />
        <ActivityStats />
        <SuggestedCommunities />
      </ScrollView>
      )}
    </View>
  );
}

function MapOverview() {
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

        {mapMarkers.map((marker, index) => {
          const Icon = marker.icon;
          return (
            <View key={index} style={[styles.mapMarker, marker]}>
              <Icon color="#FFFFFF" size={15} />
            </View>
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
          <Text style={styles.eventCountText}>12 Events</Text>
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
            <Text style={styles.nearbySubtitle}>12 spiritual gatherings around you</Text>
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
          {nearbyEvents.map((event) => (
            <NearbyEventCard key={event.title} event={event} />
          ))}
        </ScrollView>
      </View>

      <EventProductSections compact />
    </ScrollView>
  );
}

function MapControlButton({ icon }: { icon: React.ReactNode }) {
  return <Pressable style={styles.mapControlButton}>{icon}</Pressable>;
}

function NearbyEventCard({
  event,
}: {
  event: (typeof nearbyEvents)[number];
}) {
  return (
    <Pressable style={styles.nearbyCard}>
      <View style={styles.nearbyImage}>
        <Text style={styles.nearbyImageText}>Event Image</Text>
        <View style={styles.nearbyTypeBadge}>
          <Text style={styles.nearbyTypeText}>{event.type}</Text>
        </View>
        <View style={styles.nearbyHeart}>
          <Heart
            color="#4B5563"
            fill={event.bookmarked ? "#6B7280" : "transparent"}
            size={14}
          />
        </View>
        <View style={styles.nearbyDistanceBadge}>
          <MapPin color="#FFFFFF" size={11} />
          <Text style={styles.nearbyDistanceText}>{event.distance}</Text>
        </View>
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
            <Text style={styles.nearbyMetaText}>{event.date}</Text>
          </View>
          <View style={styles.nearbyMetaItem}>
            <Users color="#9CA3AF" size={12} />
            <Text style={styles.nearbyMetaText}>{event.attendees}</Text>
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
            <View style={styles.avatarStack}>
              {[101, 102, 103].map((seed, index) => (
                <Image
                  key={seed}
                  source={{
                    uri: `https://api.dicebear.com/7.x/notionists/png?scale=200&seed=${seed}`,
                  }}
                  style={[styles.avatar, index > 0 && styles.avatarOverlap]}
                />
              ))}
            </View>
            <Text style={styles.attendeeText}>{event.attendees}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable style={[styles.rsvpButton, event.going && styles.rsvpButtonActive]}>
          {event.going ? (
            <Check color="#FFFFFF" size={16} />
          ) : (
            <CalendarCheck color="#4B5563" size={16} />
          )}
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

function EventProductSections({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.productWrap, compact && styles.productWrapCompact]}>
      <EventTypeGuide />
      <ActiveCommittees />
      <TrendingThisWeek />
      <TopOrganisers />
      <EventQuickActions />
      <WeekScheduler />
      <CommunityStories />
    </View>
  );
}

function EventTypeGuide() {
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
        {eventTypeGuide.map((item) => {
          const Icon = item.icon;

          return (
            <Pressable key={item.label} style={styles.typeGuideCard}>
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

function ActiveCommittees() {
  return (
    <View style={styles.productSectionAlt}>
      <SectionHeading
        subtitle="Teams actively hosting and managing events"
        title="Active Committees"
      />
      {activeCommittees.map((item) => (
        <View key={item.title} style={styles.committeeRow}>
          <View style={styles.committeeAvatar}>
            <Text style={styles.committeeAvatarText}>{item.initials}</Text>
          </View>
          <View style={styles.committeeBody}>
            <Text style={styles.committeeTitle}>{item.title}</Text>
            <Text style={styles.committeeMeta}>{item.members}</Text>
          </View>
          <Text style={styles.committeeTrend}>{item.trend}</Text>
        </View>
      ))}
    </View>
  );
}

function TrendingThisWeek() {
  return (
    <View style={styles.productSection}>
      <SectionHeading
        action="View all"
        subtitle="Most saved and most RSVP activity"
        title="Trending This Week"
      />
      {trendingEvents.map((event) => (
        <View key={event.rank} style={styles.trendingRow}>
          <Text style={styles.trendingRank}>{event.rank}</Text>
          <View style={styles.trendingBody}>
            <Text numberOfLines={1} style={styles.trendingTitle}>{event.title}</Text>
            <Text numberOfLines={1} style={styles.trendingMeta}>{event.meta}</Text>
          </View>
          <Text style={styles.trendingValue}>{event.value}</Text>
        </View>
      ))}
    </View>
  );
}

function TopOrganisers() {
  return (
    <View style={styles.productSectionAlt}>
      <SectionHeading
        subtitle="Recognize people who keep the calendar alive"
        title="Top Event Organisers"
      />
      <ScrollView
        contentContainerStyle={styles.organiserContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {topOrganisers.map((organiser) => (
          <View key={organiser.name} style={styles.organiserCard}>
            <View style={styles.organiserAvatar}>
              <Text style={styles.organiserAvatarText}>{organiser.avatar}</Text>
            </View>
            <Text numberOfLines={1} style={styles.organiserName}>{organiser.name}</Text>
            <Text numberOfLines={2} style={styles.organiserSpecialty}>{organiser.specialty}</Text>
            <Text style={styles.organiserEvents}>{organiser.events}</Text>
          </View>
        ))}
      </ScrollView>
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

function WeekScheduler() {
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
        {weeklySchedule.map((day, index) => (
          <View
            key={day.day}
            style={[
              styles.schedulerDay,
              index === 5 && styles.schedulerDayActive,
            ]}
          >
            <Text style={[styles.schedulerDayText, index === 5 && styles.schedulerDayTextActive]}>
              {day.day}
            </Text>
            <Text style={[styles.schedulerCount, index === 5 && styles.schedulerCountActive]}>
              {day.items}
            </Text>
            <Text numberOfLines={1} style={[styles.schedulerLabel, index === 5 && styles.schedulerLabelActive]}>
              {day.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function CommunityStories() {
  return (
    <View style={styles.productSection}>
      <SectionHeading
        subtitle="Impact from events and gatherings"
        title="Community Stories"
      />
      {communityStories.map((story) => (
        <View key={story.title} style={styles.storyCard}>
          <View style={styles.storyAccent} />
          <View style={styles.storyBody}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storyText}>{story.text}</Text>
            <Text style={styles.storyBy}>Shared by {story.by}</Text>
          </View>
        </View>
      ))}
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

function ActivityStats() {
  return (
    <View style={styles.statsSection}>
      <Text style={styles.smallSectionTitle}>Your Event Activity</Text>
      <View style={styles.statsGrid}>
        <StatCard icon={<CalendarCheck color="#1F2937" size={19} />} label="Events Attended" value="12" />
        <StatCard icon={<Bookmark color="#1F2937" size={19} />} label="Saved Events" value="8" />
        <StatCard icon={<Clock3 color="#1F2937" size={19} />} label="Hours of Seva" value="24" />
        <StatCard icon={<Users color="#1F2937" size={19} />} label="Connections Made" value="156" />
      </View>
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

function SuggestedCommunities() {
  return (
    <View style={styles.communitySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.smallSectionTitle}>Suggested Communities</Text>
        <Text style={styles.viewAllText}>View All</Text>
      </View>

      {communities.map((community) => (
        <View key={community.title} style={styles.communityCard}>
          <View style={styles.communityThumb}>
            <Users color="#FFFFFF" size={24} />
          </View>
          <View style={styles.communityBody}>
            <Text numberOfLines={1} style={styles.communityTitle}>{community.title}</Text>
            <Text numberOfLines={2} style={styles.communityDescription}>{community.description}</Text>
            <View style={styles.communityMeta}>
              <Users color="#6B7280" size={13} />
              <Text style={styles.communityMetaText}>{community.members}</Text>
              <Calendar color="#6B7280" size={13} />
              <Text style={styles.communityMetaText}>{community.events}</Text>
            </View>
            <Pressable style={[styles.joinButton, community.joined && styles.joinButtonActive]}>
              <Text style={[styles.joinButtonText, community.joined && styles.joinButtonTextActive]}>
                Join Community
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
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
