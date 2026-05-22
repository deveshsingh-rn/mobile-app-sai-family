import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

import {
  CalendarDays,
  Clock3,
  MapPin,
  NotebookPen,
  Plus,
  Sparkles,
  TicketCheck,
  UserCircle2,
  UsersRound,
} from "lucide-react-native";

import {
  fetchEventsRequest,
} from "@/store/events/actions";
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
  value: EventType | "all";
}[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Bhajan",
    value: "bhajan",
  },
  {
    label: "Pooja",
    value: "pooja",
  },
  {
    label: "Seva",
    value: "seva",
  },
  {
    label: "Medical",
    value: "medical",
  },
  {
    label: "Satsang",
    value: "satsang",
  },
  {
    label: "Darshan",
    value: "darshan",
  },
  {
    label: "General",
    value: "general",
  },
];

const QUICK_ACTIONS = [
  {
    href: "/events/create",
    icon: Plus,
    label: "Create",
  },
  {
    href: "/events/calendar",
    icon: CalendarDays,
    label: "Calendar",
  },
  {
    href: "/events/rsvps",
    icon: TicketCheck,
    label: "RSVPs",
  },
  {
    href: "/events/my-events",
    icon: NotebookPen,
    label: "My Events",
  },
] as const;

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date pending";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
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

function EventCard({
  item,
}: {
  item: SaiEvent;
}) {
  const location =
    item.venueName ||
    item.city ||
    item.address;

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/events/${item.id}`
        )
      }
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <ImageBackground
        imageStyle={styles.bannerImage}
        source={
          item.bannerUrl
            ? { uri: item.bannerUrl }
            : undefined
        }
        style={[
          styles.banner,
          !item.bannerUrl &&
            styles.bannerFallback,
        ]}
      >
        <View style={styles.bannerOverlay}>
          <Text style={styles.datePill}>
            {formatDate(item.startAt)}
          </Text>

          <Text style={styles.typePill}>
            {item.type || "general"}
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.cardBody}>
        <Text
          numberOfLines={2}
          style={styles.eventTitle}
        >
          {item.title}
        </Text>

        <Text
          numberOfLines={2}
          style={styles.eventDescription}
        >
          {item.description}
        </Text>

        <View style={styles.metaRow}>
          <Clock3
            color="#8b641f"
            size={16}
          />
          <Text style={styles.metaText}>
            {formatTime(item.startAt)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <MapPin
            color="#8b641f"
            size={16}
          />
          <Text
            numberOfLines={1}
            style={styles.metaText}
          >
            {location}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.rsvpBadge}>
            <UsersRound
              color="#7a5311"
              size={15}
            />
            <Text style={styles.rsvpText}>
              {item.rsvps || 0} going
            </Text>
          </View>

          <Text style={styles.openText}>
            View details
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function EventsScreen() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(
    selectEventsFeed
  );
  const loading = useAppSelector(
    selectEventsLoading
  );
  const error = useAppSelector(
    selectEventsError
  );

  const [selectedType, setSelectedType] =
    useState<EventType | "all">("all");
  const [refreshing, setRefreshing] =
    useState(false);

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
    dispatch(
      fetchEventsRequest(fetchParams)
    );
  }, [dispatch, fetchParams]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    dispatch(
      fetchEventsRequest(fetchParams)
    );

    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  }, [dispatch, fetchParams]);

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator
            color="#b97813"
            size="large"
          />
        </View>
      );
    }

    return (
      <View style={styles.stateBox}>
        <CalendarDays
          color="#b97813"
          size={34}
        />
        <Text style={styles.stateTitle}>
          No events found
        </Text>
        <Text style={styles.stateText}>
          Upcoming satsang, aarti, seva, and community events will appear here.
        </Text>
      </View>
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: SaiEvent }) => (
      <EventCard item={item} />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <UserCircle2
            color="#8e5d10"
            size={32}
            strokeWidth={1.5}
          />

          <Text style={styles.headerTitle}>
            Events
          </Text>

          <Sparkles
            color="#8e5d10"
            size={24}
            strokeWidth={1.5}
          />
        </View>

        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;

            return (
              <Pressable
                key={action.label}
                onPress={() =>
                  router.push(
                    action.href as any
                  )
                }
                style={({ pressed }) => [
                  styles.quickAction,
                  pressed &&
                    styles.quickActionPressed,
                ]}
              >
                <Icon
                  color="#7a5311"
                  size={18}
                />
                <Text
                  numberOfLines={1}
                  style={styles.quickActionText}
                >
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          contentContainerStyle={
            styles.filtersContent
          }
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {EVENT_FILTERS.map((filter) => {
            const active =
              selectedType === filter.value;

            return (
              <Pressable
                key={filter.value}
                onPress={() =>
                  setSelectedType(
                    filter.value
                  )
                }
                style={[
                  styles.filterChip,
                  active &&
                    styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active &&
                      styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <FlashList
        contentContainerStyle={
          styles.listContent
        }
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#b97813"
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fffaf0",
    flex: 1,
  },

  fixedTop: {
    backgroundColor:
      "rgba(255,250,240,0.97)",
    borderBottomColor:
      "rgba(224,193,138,0.24)",
    borderBottomWidth: 1,
    paddingTop: 54,
    zIndex: 10,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 18,
  },

  headerTitle: {
    color: "#3f2502",
    fontSize: 22,
    fontWeight: "800",
  },

  quickActions: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },

  quickAction: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minHeight: 62,
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  quickActionPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  quickActionText: {
    color: "#62410d",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  filtersContent: {
    gap: 10,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },

  filterChip: {
    backgroundColor:
      "rgba(255,255,255,0.74)",
    borderColor:
      "rgba(205,159,76,0.32)",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  filterChipActive: {
    backgroundColor: "#b97813",
    borderColor: "#b97813",
  },

  filterText: {
    color: "#73511a",
    fontSize: 13,
    fontWeight: "800",
  },

  filterTextActive: {
    color: "#fffaf0",
  },

  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  listContent: {
    paddingBottom: 120,
    paddingTop: 14,
  },

  card: {
    backgroundColor: "#fffdf8",
    borderColor:
      "rgba(221,187,130,0.54)",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: "hidden",
  },

  cardPressed: {
    opacity: 0.92,
  },

  banner: {
    height: 132,
    justifyContent: "space-between",
  },

  bannerFallback: {
    backgroundColor: "#ead3a7",
  },

  bannerImage: {
    resizeMode: "cover",
  },

  bannerOverlay: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },

  datePill: {
    backgroundColor:
      "rgba(255,250,240,0.94)",
    borderRadius: 8,
    color: "#4e3309",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  typePill: {
    backgroundColor:
      "rgba(79,51,9,0.78)",
    borderRadius: 8,
    color: "#fffaf0",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "capitalize",
  },

  cardBody: {
    padding: 14,
  },

  eventTitle: {
    color: "#2f1b03",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },

  eventDescription: {
    color: "#79571b",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    marginTop: 6,
  },

  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  metaText: {
    color: "#60420f",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },

  cardFooter: {
    alignItems: "center",
    borderTopColor:
      "rgba(221,187,130,0.38)",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
  },

  rsvpBadge: {
    alignItems: "center",
    backgroundColor:
      "rgba(185,120,19,0.1)",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  rsvpText: {
    color: "#7a5311",
    fontSize: 12,
    fontWeight: "800",
  },

  openText: {
    color: "#a0640f",
    fontSize: 13,
    fontWeight: "900",
  },

  stateBox: {
    alignItems: "center",
    marginTop: 90,
    paddingHorizontal: 28,
  },

  stateTitle: {
    color: "#4e3309",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },

  stateText: {
    color: "#79571b",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
});
