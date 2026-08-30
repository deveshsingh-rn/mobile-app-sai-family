import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  RotateCw,
} from "lucide-react-native";

import {
  fetchEventCalendarRequest,
  fetchMyEventsRequest,
  fetchMyRsvpsRequest,
} from "@/store/events/actions";
import {
  selectEventCalendar,
  selectEventCalendarDays,
  selectEventCalendarSummary,
  selectEventsError,
  selectEventsLoading,
  selectMyEventRsvps,
  selectMyEventRsvpsPagination,
  selectMyEvents,
  selectMyEventsPagination,
} from "@/store/events/selectors";
import {
  EventCalendarDay,
  EventPagination,
  SaiEvent,
} from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";
import { EventScreenHeader } from "@/components/events/EventScreenHeader";
import { EventListSkeleton } from "@/components/events/EventSkeletons";

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

const currentDateKey = () => {
  const date = new Date();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0"
  );

  return `${date.getFullYear()}-${month}-${day}`;
};

const getDateKey = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0"
  );

  return `${date.getFullYear()}-${month}-${day}`;
};

const getMonthDate = (month: string) => {
  const [year, monthNumber] = month
    .split("-")
    .map(Number);

  return new Date(year, monthNumber - 1, 1);
};

const formatMonthTitle = (month: string) =>
  getMonthDate(month).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );

const shiftMonth = (
  month: string,
  amount: number
) => {
  const date = getMonthDate(month);
  date.setMonth(date.getMonth() + amount);

  const nextMonth = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  return `${date.getFullYear()}-${nextMonth}`;
};

const getMonthDays = (month: string) => {
  const date = getMonthDate(month);
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const firstDay = new Date(
    year,
    monthIndex,
    1
  ).getDay();
  const totalDays = new Date(
    year,
    monthIndex + 1,
    0
  ).getDate();

  return [
    ...Array.from(
      {
        length: firstDay,
      },
      () => null
    ),
    ...Array.from(
      {
        length: totalDays,
      },
      (_, index) => {
        const day = index + 1;
        const dayKey = String(day).padStart(
          2,
          "0"
        );

        return {
          day,
          key: `${month}-${dayKey}`,
        };
      }
    ),
  ];
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
  mode,
}: {
  item: SaiEvent;
  mode: EventListMode;
}) {
  const countLabel =
    mode === "my-events"
      ? `${item.rsvps || 0} RSVPs · ${item.comments || 0} comments`
      : item.rsvpedByMe
        ? "You are going"
        : item.type || "Event";

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
        <View style={styles.cardMetaTop}>
          <Text style={styles.typePill}>
            {item.type || "general"}
          </Text>
          {!!item.status && (
            <Text style={styles.statusText}>
              {item.status}
            </Text>
          )}
        </View>

        <Text
          numberOfLines={2}
          style={styles.cardTitle}
        >
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <Clock3
            color="#78716C"
            size={15}
          />
          <Text style={styles.metaText}>
            {formatTime(item.startAt)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <MapPin
            color="#78716C"
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

        <Text style={styles.countText}>
          {countLabel}
        </Text>
      </View>
    </Pressable>
  );
}

function getEventsFromCalendarDays(
  days: EventCalendarDay[]
) {
  return days.flatMap((day) =>
    Array.isArray(day.events) ? day.events : []
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
  const rsvpPagination = useAppSelector(
    selectMyEventRsvpsPagination
  );
  const myEvents = useAppSelector(
    selectMyEvents
  );
  const myEventsPagination = useAppSelector(
    selectMyEventsPagination
  );
  const calendar = useAppSelector(
    selectEventCalendar
  );
  const calendarDaysFromApi = useAppSelector(
    selectEventCalendarDays
  );
  const calendarSummary = useAppSelector(
    selectEventCalendarSummary
  );
  const [month, setMonth] =
    useState(currentMonth());
  const [
    selectedDate,
    setSelectedDate,
  ] = useState(currentDateKey());
  const [refreshing, setRefreshing] =
    useState(false);

  const calendarEventsByDay = useMemo(
    () => {
      const apiEvents =
        calendarDaysFromApi.length > 0
          ? getEventsFromCalendarDays(
              calendarDaysFromApi
            )
          : calendar;

      return apiEvents.reduce<
        Record<string, SaiEvent[]>
      >((days, event) => {
        const key = getDateKey(event.startAt);

        if (!key) {
          return days;
        }

        return {
          ...days,
          [key]: [
            ...(days[key] || []),
            event,
          ],
        };
      }, {});
    },
    [calendar, calendarDaysFromApi]
  );

  const calendarMetaByDay = useMemo(
    () =>
      calendarDaysFromApi.reduce<
        Record<string, EventCalendarDay>
      >((days, day) => ({
        ...days,
        [day.date]: day,
      }), {}),
    [calendarDaysFromApi]
  );

  const selectedDateEvents = useMemo(
    () =>
      calendarEventsByDay[selectedDate] || [],
    [calendarEventsByDay, selectedDate]
  );

  const config = useMemo(() => {
    if (mode === "calendar") {
      return {
        data: selectedDateEvents,
        empty: "No events on this date.",
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
  }, [
    mode,
    myEvents,
    rsvps,
    selectedDateEvents,
  ]);

  const activePagination: EventPagination | null | undefined =
    mode === "my-events"
      ? myEventsPagination
      : mode === "rsvps"
        ? rsvpPagination
        : null;

  const canLoadMore = Boolean(
    activePagination?.hasMore &&
      activePagination.nextOffset != null &&
      !loading
  );

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

  useEffect(() => {
    if (!loading && refreshing) {
      setRefreshing(false);
    }
  }, [loading, refreshing]);

  const handleShiftMonth = useCallback(
    (amount: number) => {
      const nextMonth = shiftMonth(
        month,
        amount
      );
      setMonth(nextMonth);
      setSelectedDate(`${nextMonth}-01`);
    },
    [month]
  );

  const handleToday = useCallback(() => {
    const todayMonth = currentMonth();
    setMonth(todayMonth);
    setSelectedDate(currentDateKey());
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!canLoadMore) {
      return;
    }

    const params = {
      limit: activePagination?.limit || 20,
      offset: activePagination?.nextOffset || 0,
    };

    if (mode === "my-events") {
      dispatch(fetchMyEventsRequest(params));
      return;
    }

    if (mode === "rsvps") {
      dispatch(fetchMyRsvpsRequest(params));
    }
  }, [
    activePagination?.limit,
    activePagination?.nextOffset,
    canLoadMore,
    dispatch,
    mode,
  ]);

  const calendarDays = useMemo(
    () => getMonthDays(month),
    [month]
  );

  const renderCalendarHeader = () => {
    if (mode !== "calendar") {
      return null;
    }

    return (
      <View style={styles.calendarPanel}>
        <View style={styles.monthHeader}>
          <Pressable
            onPress={() =>
              handleShiftMonth(-1)
            }
            style={styles.monthIconButton}
          >
            <ChevronLeft
              color="#292524"
              size={20}
            />
          </Pressable>

          <Text style={styles.monthTitle}>
            {formatMonthTitle(month)}
          </Text>

          <Pressable
            onPress={() => handleShiftMonth(1)}
            style={styles.monthIconButton}
          >
            <ChevronRight
              color="#292524"
              size={20}
            />
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {calendarSummary?.total ?? calendar.length}
            </Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {calendarSummary?.attending ?? rsvps.length}
            </Text>
            <Text style={styles.summaryLabel}>Attending</Text>
          </View>
          <Pressable
            onPress={handleToday}
            style={styles.todayButton}
          >
            <RotateCw color="#9A3412" size={14} />
            <Text style={styles.todayText}>Today</Text>
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <Text
              key={day}
              style={styles.weekText}
            >
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarDays.map((item, index) => {
            if (!item) {
              return (
                <View
                  key={`empty-${index}`}
                  style={styles.dayCell}
                />
              );
            }

            const isSelected =
              selectedDate === item.key;
            const isToday =
              currentDateKey() === item.key;
            const count =
              calendarEventsByDay[item.key]
                ?.length ||
              calendarMetaByDay[item.key]?.dots
                ?.length ||
              0;
            const hasBackendDay =
              Boolean(calendarMetaByDay[item.key]);

            return (
              <Pressable
                key={item.key}
                onPress={() =>
                  setSelectedDate(item.key)
                }
                style={[
                  styles.dayCell,
                  isSelected &&
                    styles.dayCellSelected,
                  isToday &&
                    !isSelected &&
                    styles.dayCellToday,
                  hasBackendDay &&
                    styles.dayCellWithData,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected &&
                      styles.dayTextSelected,
                  ]}
                >
                  {item.day}
                </Text>

                {!!count && (
                  <View style={styles.dayCountWrap}>
                    <View
                      style={[
                        styles.eventDot,
                        isSelected &&
                          styles.eventDotSelected,
                      ]}
                    />
                    {count > 1 && (
                      <Text
                        style={[
                          styles.dayCountText,
                          isSelected &&
                            styles.dayTextSelected,
                        ]}
                      >
                        {count}
                      </Text>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.selectedDateBar}>
          <CalendarDays
            color="#9A3412"
            size={17}
          />
          <Text style={styles.selectedDateText}>
            {selectedDateEvents.length} event
            {selectedDateEvents.length === 1
              ? ""
              : "s"}{" "}
            on{" "}
            {new Date(
              `${selectedDate}T00:00:00`
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push("/events/create" as any)
          }
          style={styles.createInlineButton}
        >
          <Plus color="#FFFFFF" size={16} />
          <Text style={styles.createInlineText}>
            Create event for this date
          </Text>
        </Pressable>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return <EventListSkeleton />;
    }

    return (
      <View style={styles.stateBox}>
        <CalendarDays
          color="#F97316"
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
      <EventScreenHeader
        onBack={() => router.back()}
        onRightPress={() =>
          mode === "calendar"
            ? router.push("/events/create" as any)
            : handleRefresh()
        }
        rightAccessibilityLabel={mode === "calendar" ? "Create event" : "Refresh events"}
        rightIcon={
          mode === "calendar" ? (
            <Plus color="#292524" size={21} />
          ) : (
            <RotateCw color="#292524" size={19} />
          )
        }
        subtitle={
          mode === "calendar"
            ? "Browse gatherings by date"
            : mode === "my-events"
              ? "Gatherings organized by you"
              : "Your upcoming spiritual commitments"
        }
        title={config.title}
      />

      {renderCalendarHeader()}

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
        ListFooterComponent={
          canLoadMore ? (
            <Pressable
              onPress={handleLoadMore}
              style={styles.loadMoreButton}
            >
              <Text style={styles.loadMoreText}>
                Load more
              </Text>
            </Pressable>
          ) : config.data.length > 0 ? (
            <Text style={styles.endText}>
              You are all caught up
            </Text>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#F97316"
          />
        }
        renderItem={({ item }) => (
          <CompactEventCard
            item={item}
            mode={mode}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAF9",
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
  calendarPanel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F1E4D5",
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: 1,
    margin: 16,
    padding: 14,
    shadowColor: "#5B2C0B",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  monthIconButton: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  monthTitle: {
    color: "#292524",
    fontSize: 17,
    fontWeight: "900",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  summaryItem: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    flex: 1,
    padding: 10,
  },
  summaryNumber: {
    color: "#292524",
    fontSize: 18,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#78716C",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  todayButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#FED7AA",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  todayText: {
    color: "#9A3412",
    fontSize: 12,
    fontWeight: "900",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekText: {
    color: "#78716C",
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  dayCell: {
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    marginVertical: 2,
    width: `${100 / 7}%`,
  },
  dayCellSelected: {
    backgroundColor: "#F97316",
  },
  dayCellToday: {
    backgroundColor: "#FFF4E8",
  },
  dayCellWithData: {
    borderColor: "#FED7AA",
    borderWidth: 1,
  },
  dayText: {
    color: "#292524",
    fontSize: 14,
    fontWeight: "900",
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  eventDot: {
    backgroundColor: "#F97316",
    borderRadius: 3,
    height: 6,
    marginTop: 4,
    width: 6,
  },
  eventDotSelected: {
    backgroundColor: "#FFFFFF",
  },
  dayCountWrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  dayCountText: {
    color: "#9A3412",
    fontSize: 9,
    fontWeight: "900",
    marginLeft: 3,
  },
  selectedDateBar: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
  },
  selectedDateText: {
    color: "#292524",
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  createInlineButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 13,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 44,
  },
  createInlineText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  listContent: {
    paddingBottom: 110,
    paddingTop: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F1E4D5",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 13,
    shadowColor: "#5B2C0B",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  pressed: {
    opacity: 0.88,
  },
  dateBox: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderRadius: 13,
    justifyContent: "center",
    paddingHorizontal: 8,
    width: 78,
  },
  dateText: {
    color: "#9A3412",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  cardBody: {
    flex: 1,
  },
  cardMetaTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    color: "#292524",
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
    color: "#57534E",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  countText: {
    color: "#78716C",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 9,
  },
  typePill: {
    backgroundColor: "#FFF4E8",
    borderRadius: 999,
    color: "#9A3412",
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "capitalize",
  },
  statusText: {
    color: "#78716C",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  loadMoreButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFF4E8",
    borderRadius: 12,
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  loadMoreText: {
    color: "#9A3412",
    fontSize: 13,
    fontWeight: "900",
  },
  endText: {
    color: "#78716C",
    fontSize: 12,
    fontWeight: "800",
    paddingVertical: 18,
    textAlign: "center",
  },
  stateBox: {
    alignItems: "center",
    marginTop: 110,
    paddingHorizontal: 28,
  },
  stateTitle: {
    color: "#57534E",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },
});
