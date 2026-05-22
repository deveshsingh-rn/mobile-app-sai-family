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
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react-native";

import {
  fetchEventCalendarRequest,
  fetchMyEventsRequest,
  fetchMyRsvpsRequest,
} from "@/store/events/actions";
import {
  selectEventCalendar,
  selectEventsError,
  selectEventsLoading,
  selectMyEventRsvps,
  selectMyEvents,
} from "@/store/events/selectors";
import { SaiEvent } from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

type EventListMode =
  | "calendar"
  | "my-events"
  | "rsvps";

const currentMonth = () => {
  const date = new Date();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
};

const formatDate = (value: string) => {
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

function CompactEventCard({
  item,
}: {
  item: SaiEvent;
}) {
  return (
    <Pressable
      onPress={() =>
        router.push(
          `/events/${item.id}` as any
        )
      }
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.dateBox}>
        <Text style={styles.dateText}>
          {formatDate(item.startAt)}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text
          numberOfLines={2}
          style={styles.cardTitle}
        >
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <Clock3
            color="#8b641f"
            size={15}
          />
          <Text style={styles.metaText}>
            {formatTime(item.startAt)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <MapPin
            color="#8b641f"
            size={15}
          />
          <Text
            numberOfLines={1}
            style={styles.metaText}
          >
            {item.venueName ||
              item.city ||
              item.address}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function EventListScreen({
  mode,
}: {
  mode: EventListMode;
}) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(
    selectEventsLoading
  );
  const error = useAppSelector(
    selectEventsError
  );
  const rsvps = useAppSelector(
    selectMyEventRsvps
  );
  const myEvents = useAppSelector(
    selectMyEvents
  );
  const calendar = useAppSelector(
    selectEventCalendar
  );
  const [month, setMonth] =
    useState(currentMonth());
  const [refreshing, setRefreshing] =
    useState(false);

  const config = useMemo(() => {
    if (mode === "calendar") {
      return {
        data: calendar,
        empty: "No events in this month.",
        title: "Event Calendar",
      };
    }

    if (mode === "my-events") {
      return {
        data: myEvents,
        empty: "You have not created any events yet.",
        title: "My Events",
      };
    }

    return {
      data: rsvps,
      empty: "You have not RSVP'd to any events yet.",
      title: "My RSVPs",
    };
  }, [calendar, mode, myEvents, rsvps]);

  const fetchData = useCallback(() => {
    if (mode === "calendar") {
      dispatch(
        fetchEventCalendarRequest(month)
      );
      return;
    }

    if (mode === "my-events") {
      dispatch(
        fetchMyEventsRequest({
          limit: 20,
          offset: 0,
        })
      );
      return;
    }

    dispatch(
      fetchMyRsvpsRequest({
        limit: 20,
        offset: 0,
      })
    );
  }, [dispatch, mode, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  }, [fetchData]);

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
          {config.empty}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ArrowLeft
            color="#5b3b0b"
            size={22}
          />
        </Pressable>

        <Text style={styles.topTitle}>
          {config.title}
        </Text>

        <View style={styles.topSpacer} />
      </View>

      {mode === "calendar" && (
        <View style={styles.monthRow}>
          <TextInput
            onChangeText={setMonth}
            placeholder="YYYY-MM"
            placeholderTextColor="#a98b54"
            style={styles.monthInput}
            value={month}
          />

          <Pressable
            onPress={fetchData}
            style={styles.monthButton}
          >
            <Text style={styles.monthButtonText}>
              Load
            </Text>
          </Pressable>
        </View>
      )}

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <FlashList
        contentContainerStyle={
          styles.listContent
        }
        data={config.data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#b97813"
          />
        }
        renderItem={({ item }) => (
          <CompactEventCard item={item} />
        )}
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
  topBar: {
    alignItems: "center",
    borderBottomColor:
      "rgba(224,193,138,0.3)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 54,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor:
      "rgba(183,122,24,0.12)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  topTitle: {
    color: "#2f1b03",
    fontSize: 18,
    fontWeight: "900",
  },
  topSpacer: {
    width: 40,
  },
  monthRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
  monthInput: {
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 8,
    borderWidth: 1,
    color: "#2d1b02",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  monthButton: {
    alignItems: "center",
    backgroundColor: "#b97813",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  monthButtonText: {
    color: "#fffaf0",
    fontSize: 14,
    fontWeight: "900",
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 110,
    paddingTop: 14,
  },
  card: {
    backgroundColor: "#fffdf8",
    borderColor:
      "rgba(221,187,130,0.54)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 12,
  },
  pressed: {
    opacity: 0.88,
  },
  dateBox: {
    alignItems: "center",
    backgroundColor:
      "rgba(185,120,19,0.12)",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 8,
    width: 78,
  },
  dateText: {
    color: "#7a5311",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: "#2f1b03",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 8,
  },
  metaText: {
    color: "#60420f",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  stateBox: {
    alignItems: "center",
    marginTop: 110,
    paddingHorizontal: 28,
  },
  stateTitle: {
    color: "#4e3309",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },
});
