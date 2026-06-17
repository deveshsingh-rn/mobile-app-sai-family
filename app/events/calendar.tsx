import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
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
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  MapPin,
  Music,
  Plus,
  Settings,
  Sparkles,
  Users,
} from "lucide-react-native";

import {
  exportCalendarRequest,
  fetchEventCalendarRequest,
  fetchEventRecommendationsRequest,
  fetchCalendarPreferencesRequest,
  fetchCommunityCalendarsRequest,
  fetchMyRsvpsRequest,
  subscribeCommunityCalendarRequest,
  unsubscribeCommunityCalendarRequest,
  updateCalendarPreferencesRequest,
} from "@/store/events/actions";
import {
  selectCalendarExportError,
  selectCalendarExporting,
  selectCalendarPreferences,
  selectCalendarPreferencesLoading,
  selectCommunityCalendars,
  selectCommunityCalendarsLoading,
  selectEventCalendar,
  selectEventCalendarDays,
  selectEventCalendarSummary,
  selectEventRecommendations,
  selectEventRecommendationsLoading,
  selectEventsError,
  selectEventsLoading,
  selectMyEventRsvps,
} from "@/store/events/selectors";
import {
  EventType,
  EventCalendarDay,
  SaiEvent,
} from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

const palette = {
  bg: "#FAFAF9",
  border: "#E7D7BE",
  card: "#FFFFFF",
  chip: "#FFF7ED",
  ink: "#1F2937",
  muted: "#6B7280",
  primary: "#F97316",
  soft: "#F6EFD9",
};

const eventTypeOrder: EventType[] = [
  "satsang",
  "bhajan",
  "pooja",
  "seva",
  "medical",
  "darshan",
  "general",
];

const typeMeta: Record<
  EventType,
  {
    color: string;
    label: string;
  }
> = {
  bhajan: {
    color: "#EA580C",
    label: "Bhajan",
  },
  darshan: {
    color: "#7C2D12",
    label: "Darshan",
  },
  general: {
    color: "#78716C",
    label: "General",
  },
  medical: {
    color: "#DC2626",
    label: "Medical",
  },
  pooja: {
    color: "#B45309",
    label: "Pooja",
  },
  satsang: {
    color: "#1F2937",
    label: "Satsang",
  },
  seva: {
    color: "#16A34A",
    label: "Seva",
  },
};

const reminderOptions: {
  label: string;
  minutes: number;
}[] = [
  {
    label: "15 minutes before",
    minutes: 15,
  },
  {
    label: "30 minutes before",
    minutes: 30,
  },
  {
    label: "1 hour before",
    minutes: 60,
  },
  {
    label: "1 day before",
    minutes: 1440,
  },
];

type CalendarDay = {
  date: Date;
  day: number;
  inMonth: boolean;
  key: string;
};

const currentMonth = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );

  return `${date.getFullYear()}-${month}`;
};

const getDateKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const currentDateKey = () => getDateKey(new Date());

const getEventDateKey = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return getDateKey(date);
};

const getMonthDate = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1, 1);
};

const formatMonthTitle = (month: string) =>
  getMonthDate(month).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

const shiftMonth = (month: string, amount: number) => {
  const date = getMonthDate(month);
  date.setMonth(date.getMonth() + amount);

  const nextMonth = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );

  return `${date.getFullYear()}-${nextMonth}`;
};

const getCalendarDays = (month: string): CalendarDay[] => {
  const monthDate = getMonthDate(month);
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from(
    {
      length: 42,
    },
    (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        date,
        day: date.getDate(),
        inMonth: date.getMonth() === monthIndex,
        key: getDateKey(date),
      };
    }
  );
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

const formatSelectedDate = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      weekday: "long",
    }
  );

const formatCompactDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      day: "--",
      weekday: "DAY",
    };
  }

  return {
    day: String(date.getDate()),
    weekday: date
      .toLocaleDateString("en-IN", {
        weekday: "short",
      })
      .toUpperCase(),
  };
};

function eventLocation(event: SaiEvent) {
  return event.venueName || event.city || event.address || "Venue pending";
}

function eventType(event?: SaiEvent): EventType {
  return event?.type && typeMeta[event.type]
    ? event.type
    : "general";
}

function SectionHeader({
  action,
  eyebrow,
  onActionPress,
  title,
}: {
  action?: string;
  eyebrow?: string;
  onActionPress?: () => void;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!!eyebrow && <Text style={styles.sectionEyebrow}>{eyebrow}</Text>}
      </View>
      {!!action && (
        <Pressable
          onPress={onActionPress}
          style={styles.textAction}
        >
          <Text style={styles.textActionLabel}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

function TypePill({
  type,
}: {
  type: EventType;
}) {
  const meta = typeMeta[type];

  return (
    <View style={styles.typePill}>
      <View
        style={[
          styles.typeDot,
          {
            backgroundColor: meta.color,
          },
        ]}
      />
      <Text style={styles.typeText}>{meta.label}</Text>
    </View>
  );
}

function SelectedEventCard({
  event,
}: {
  event: SaiEvent;
}) {
  const type = eventType(event);

  return (
    <Pressable
      onPress={() => {
        router.push(`/events/${event.id}` as any);
      }}
      style={({pressed}) => [
        styles.selectedCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.selectedIcon}>
        {type === "bhajan" ? (
          <Music color={palette.ink} size={20} />
        ) : (
          <Sparkles color={palette.ink} size={20} />
        )}
      </View>
      <View style={styles.selectedBody}>
        <View style={styles.selectedTitleRow}>
          <Text numberOfLines={2} style={styles.selectedTitle}>
            {event.title}
          </Text>
          <Text style={styles.selectedTime}>
            {formatTime(event.startAt)}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.selectedLocation}>
          {eventLocation(event)}
        </Text>
        <View style={styles.selectedMetaRow}>
          <View style={styles.inlineMeta}>
            <Users color="#9CA3AF" size={13} />
            <Text style={styles.inlineMetaText}>
              {event.rsvps ?? 0} going
            </Text>
          </View>
          <TypePill type={type} />
        </View>
      </View>
    </Pressable>
  );
}

function UpcomingCard({
  event,
}: {
  event: SaiEvent;
}) {
  const date = formatCompactDate(event.startAt);
  const type = eventType(event);

  return (
    <Pressable
      onPress={() => {
        router.push(`/events/${event.id}` as any);
      }}
      style={({pressed}) => [
        styles.upcomingCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.dateTile}>
        <Text style={styles.dateTileWeek}>{date.weekday}</Text>
        <Text style={styles.dateTileDay}>{date.day}</Text>
      </View>
      <View style={styles.upcomingBody}>
        <Text numberOfLines={1} style={styles.upcomingTitle}>
          {event.title}
        </Text>
        <Text numberOfLines={1} style={styles.upcomingMeta}>
          {`${formatTime(event.startAt)} - ${eventLocation(event)}`}
        </Text>
        <TypePill type={type} />
      </View>
    </Pressable>
  );
}

function RecommendationCard({
  event,
}: {
  event: SaiEvent;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/events/${event.id}` as any)}
      style={styles.recommendationCard}
    >
      <View style={styles.recommendationImage}>
        <Text style={styles.imageText}>{event.type || "Event"}</Text>
      </View>
      <View style={styles.recommendationBody}>
        <View style={styles.recommendationTitleRow}>
          <Text style={styles.recommendationTitle}>{event.title}</Text>
        </View>
        <View style={styles.detailLine}>
          <CalendarDays color={palette.muted} size={13} />
          <Text style={styles.detailText}>
            {formatTime(event.startAt)}
          </Text>
        </View>
        <View style={styles.detailLine}>
          <MapPin color={palette.muted} size={13} />
          <Text style={styles.detailText}>{eventLocation(event)}</Text>
        </View>
        <View style={styles.recommendationFooter}>
          <TypePill type={eventType(event)} />
          <View style={styles.primaryMiniButton}>
            <Text style={styles.primaryMiniText}>View</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function EmptySmallCard({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <View style={styles.emptySmallCard}>
      {icon}
      <Text style={styles.emptySmallText}>{text}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  onPress,
  subtitle,
  title,
}: {
  icon: React.ReactNode;
  onPress?: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.quickCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.quickIcon}>{icon}</View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function PreferenceRow({
  active,
  disabled,
  onPress,
  subtitle,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.preferenceRow,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.preferenceTextWrap}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
      </View>
      <View
        style={[
          styles.switchTrack,
          active && styles.switchTrackActive,
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            active && styles.switchThumbActive,
          ]}
        />
      </View>
    </Pressable>
  );
}

export default function EventCalendarRoute() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const calendar = useAppSelector(selectEventCalendar);
  const calendarDaysFromApi = useAppSelector(selectEventCalendarDays);
  const calendarSummary = useAppSelector(selectEventCalendarSummary);
  const recommendations = useAppSelector(selectEventRecommendations);
  const recommendationsLoading = useAppSelector(
    selectEventRecommendationsLoading
  );
  const calendarPreferences = useAppSelector(selectCalendarPreferences);
  const calendarPreferencesLoading = useAppSelector(
    selectCalendarPreferencesLoading
  );
  const calendarExporting = useAppSelector(selectCalendarExporting);
  const calendarExportError = useAppSelector(selectCalendarExportError);
  const communityCalendars = useAppSelector(selectCommunityCalendars);
  const communityCalendarsLoading = useAppSelector(
    selectCommunityCalendarsLoading
  );
  const rsvps = useAppSelector(selectMyEventRsvps);
  const [month, setMonth] = useState(currentMonth());
  const [selectedDate, setSelectedDate] = useState(currentDateKey());
  const [refreshing, setRefreshing] = useState(false);

  const liveCalendarEvents = useMemo(
    () =>
      calendarDaysFromApi.length
        ? calendarDaysFromApi.flatMap((day) => day.events)
        : calendar,
    [calendar, calendarDaysFromApi]
  );

  const calendarMetaByDay = useMemo(
    () =>
      calendarDaysFromApi.reduce<Record<string, EventCalendarDay>>(
        (days, day) => ({
          ...days,
          [day.date]: day,
        }),
        {}
      ),
    [calendarDaysFromApi]
  );

  const calendarEventsByDay = useMemo(
    () =>
      liveCalendarEvents.reduce<Record<string, SaiEvent[]>>(
        (days, event) => {
          const key = getEventDateKey(event.startAt);

          if (!key) {
            return days;
          }

          return {
            ...days,
            [key]: [...(days[key] || []), event],
          };
        },
        {}
      ),
    [liveCalendarEvents]
  );

  const selectedDateEvents = calendarEventsByDay[selectedDate] || [];
  const calendarDays = useMemo(() => getCalendarDays(month), [month]);
  const monthEvents = useMemo(
    () =>
      liveCalendarEvents.filter((event) =>
        getEventDateKey(event.startAt).startsWith(month)
      ),
    [liveCalendarEvents, month]
  );

  const typeCounts = useMemo(
    () =>
      monthEvents.reduce<Record<string, number>>((counts, event) => {
        const type = eventType(event);

        return {
          ...counts,
          [type]: (counts[type] || 0) + 1,
        };
      }, {}),
    [monthEvents]
  );

  const upcomingEvents = useMemo(
    () =>
      [...liveCalendarEvents]
        .filter((event) => new Date(event.startAt).getTime() >= Date.now())
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() -
            new Date(b.startAt).getTime()
        )
        .slice(0, 3),
    [liveCalendarEvents]
  );

  const summaryTotal =
    calendarSummary?.total ??
    calendarSummary?.totalEvents ??
    monthEvents.length;
  const summaryAttending = calendarSummary?.attending ?? rsvps.length;
  const reminderMinutes =
    calendarPreferences?.defaultReminderMinutes ?? 30;

  const fetchData = useCallback(() => {
    dispatch(fetchEventCalendarRequest(month));
    dispatch(
      fetchEventRecommendationsRequest({
        limit: 10,
      })
    );
    dispatch(fetchCalendarPreferencesRequest());
    dispatch(fetchCommunityCalendarsRequest());
    dispatch(
      fetchMyRsvpsRequest({
        limit: 20,
        offset: 0,
      })
    );
  }, [dispatch, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (calendarExportError) {
      Alert.alert("Calendar export", calendarExportError);
    }
  }, [calendarExportError]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  }, [fetchData]);

  const handleShiftMonth = useCallback(
    (amount: number) => {
      const nextMonth = shiftMonth(month, amount);
      setMonth(nextMonth);
      setSelectedDate(`${nextMonth}-01`);
    },
    [month]
  );

  const handleExportCalendar = useCallback(() => {
    dispatch(exportCalendarRequest());
  }, [dispatch]);

  const handleTogglePreference = useCallback(
    (key: "showBookmarkedEvents" | "showCreatedEvents" | "showRsvpedEvents") => {
      dispatch(
        updateCalendarPreferencesRequest({
          [key]: !calendarPreferences?.[key],
        })
      );
    },
    [calendarPreferences, dispatch]
  );

  const handleReminderChange = useCallback(
    (minutes: number) => {
      dispatch(
        updateCalendarPreferencesRequest({
          defaultReminderMinutes: minutes,
        })
      );
    },
    [dispatch]
  );

  const handleCommunityCalendarPress = useCallback(
    (id: string, subscribed?: boolean) => {
      dispatch(
        subscribed
          ? unsubscribeCommunityCalendarRequest(id)
          : subscribeCommunityCalendarRequest(id)
      );
    },
    [dispatch]
  );

  const myCalendarList = rsvps.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <ArrowLeft color={palette.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Events Calendar</Text>
        <Pressable
          onPress={() => router.push("/events/create" as any)}
          style={styles.headerButton}
        >
          <Plus color={palette.ink} size={20} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor={palette.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthNav}>
          <View style={styles.monthRow}>
            <Pressable
              onPress={() => handleShiftMonth(-1)}
              style={styles.monthButton}
            >
              <ChevronLeft color={palette.ink} size={18} />
            </Pressable>
            <Text style={styles.monthTitle}>{formatMonthTitle(month)}</Text>
            <Pressable
              onPress={() => handleShiftMonth(1)}
              style={styles.monthButton}
            >
              <ChevronRight color={palette.ink} size={18} />
            </Pressable>
          </View>
          <Text style={styles.monthHint}>Use arrows to navigate months</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.legend}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {eventTypeOrder.map((type) => (
            <TypePill key={type} type={type} />
          ))}
        </ScrollView>

        <View style={styles.calendarPanel}>
          <View style={styles.weekRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <Text key={day} style={styles.weekText}>
                  {day}
                </Text>
              )
            )}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((item) => {
              const isSelected = selectedDate === item.key;
              const isToday = currentDateKey() === item.key;
              const eventCount = calendarEventsByDay[item.key]?.length || 0;
              const dotCount =
                calendarMetaByDay[item.key]?.dots?.length || 0;
              const count = eventCount || dotCount;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => setSelectedDate(item.key)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.daySelected,
                    isToday && !isSelected && styles.dayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !item.inMonth && styles.dayMuted,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {item.day}
                  </Text>
                  {!!count && (
                    <View style={styles.dotRow}>
                      {Array.from({
                        length: Math.min(count, 3),
                      }).map((_, index) => (
                        <View
                          key={`${item.key}-${index}`}
                          style={[
                            styles.calendarDot,
                            {
                              backgroundColor: isSelected
                                ? "#FFFFFF"
                                : index === 0
                                  ? palette.ink
                                  : index === 1
                                    ? palette.primary
                                    : "#F59E0B",
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                  {count > 3 && (
                    <Text
                      style={[
                        styles.moreText,
                        isSelected && styles.moreTextSelected,
                      ]}
                    >
                      +{count - 3}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.selectedHeader}>
          <View>
            <Text style={styles.selectedHeaderTitle}>
              {formatSelectedDate(selectedDate)}
            </Text>
            <Text style={styles.selectedHeaderSub}>
              {selectedDateEvents.length} events scheduled
            </Text>
          </View>
          <Pressable
            onPress={() => setSelectedDate(currentDateKey())}
            style={styles.todayButton}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </Pressable>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {loading && calendar.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={palette.primary} />
          </View>
        ) : (
          <View style={styles.cardStack}>
            {selectedDateEvents.map((event) => (
              <SelectedEventCard key={event.id} event={event} />
            ))}
            {!selectedDateEvents.length && (
              <EmptySmallCard
                icon={<CalendarDays color={palette.primary} size={20} />}
                text="No live events are scheduled for this date."
              />
            )}
          </View>
        )}

        <View style={styles.sectionBand}>
          <SectionHeader
            action="View All"
            onActionPress={() => router.push("/events" as any)}
            title="Upcoming This Week"
          />
          <View style={styles.cardStack}>
            {upcomingEvents.map((event) => (
              <UpcomingCard key={event.id} event={event} />
            ))}
            {!upcomingEvents.length && (
              <EmptySmallCard
                icon={<CalendarCheck color={palette.primary} size={20} />}
                text="No upcoming events returned for this month yet."
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title={`${formatMonthTitle(month)} Overview`} />
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <CalendarDays color={palette.ink} size={17} />
              </View>
              <Text style={styles.statValue}>{summaryTotal}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <CheckCircle2 color={palette.ink} size={17} />
              </View>
              <Text style={styles.statValue}>{summaryAttending}</Text>
              <Text style={styles.statLabel}>Attending</Text>
            </View>
          </View>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Event Types</Text>
            {eventTypeOrder.map(
              (type) => (
                <View key={type} style={styles.breakdownRow}>
                  <TypePill type={type} />
                  <Text style={styles.breakdownValue}>
                    {calendarSummary?.byType?.[type] ??
                      typeCounts[type] ??
                      0} events
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        <View style={styles.sectionBand}>
          <SectionHeader
            action="Refresh"
            eyebrow="Based on your interests"
            onActionPress={() =>
              dispatch(
                fetchEventRecommendationsRequest({
                  limit: 10,
                })
              )
            }
            title="Recommended for You"
          />
          <View style={styles.cardStack}>
            {recommendationsLoading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={palette.primary} />
              </View>
            )}
            {recommendations.map((event) => (
              <RecommendationCard key={event.id} event={event} />
            ))}
            {!recommendationsLoading && !recommendations.length && (
              <EmptySmallCard
                icon={<Sparkles color={palette.primary} size={20} />}
                text="Recommendations will appear after backend returns matching events."
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            action="Manage"
            onActionPress={() => router.push("/events/rsvps" as any)}
            title="My Calendar Events"
          />
          <View style={styles.cardStack}>
            {myCalendarList.map(
              (event) => (
                <View key={event.id} style={styles.myEventCard}>
                  <View style={styles.myEventIcon}>
                    <CheckCircle2 color={palette.ink} size={18} />
                  </View>
                  <View style={styles.myEventBody}>
                    <Text numberOfLines={1} style={styles.myEventTitle}>
                      {event.title}
                    </Text>
                    <Text style={styles.myEventTime}>
                      {formatTime(event.startAt)}
                    </Text>
                    <View style={styles.myEventActions}>
                      <Pressable
                        onPress={() => router.push(`/events/${event.id}` as any)}
                        style={styles.outlineMiniButton}
                      >
                        <Text style={styles.outlineMiniText}>View Details</Text>
                      </Pressable>
                      <View style={styles.iconMiniButton}>
                        <Bell color={palette.muted} size={14} />
                      </View>
                    </View>
                  </View>
                </View>
              )
            )}
            {!myCalendarList.length && (
              <EmptySmallCard
                icon={<CalendarCheck color={palette.primary} size={20} />}
                text="RSVP to events and they will appear here."
              />
            )}
          </View>
        </View>

        <View style={styles.sectionBand}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.quickGrid}>
            <QuickAction
              icon={<Plus color={palette.ink} size={20} />}
              onPress={() => router.push("/events/create" as any)}
              subtitle="Host your own event"
              title="Create Event"
            />
            <QuickAction
              icon={<CalendarCheck color={palette.ink} size={20} />}
              onPress={() => router.push("/events/rsvps" as any)}
              subtitle="Events you are attending"
              title="My RSVPs"
            />
            <QuickAction
              icon={<Download color={palette.ink} size={20} />}
              onPress={handleExportCalendar}
              subtitle={calendarExporting ? "Preparing file" : "Download ICS feed"}
              title={calendarExporting ? "Exporting" : "Export"}
            />
            <QuickAction
              icon={<Settings color={palette.ink} size={20} />}
              onPress={() =>
                Alert.alert(
                  "Calendar settings",
                  "Reminder and feed preferences are available below."
                )
              }
              subtitle="Reminder and feed rules"
              title="Settings"
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Calendar Export" />
            <View style={styles.syncCard}>
              <View style={styles.syncTop}>
                <View style={styles.syncIcon}>
                  <CalendarDays color={palette.ink} size={18} />
                </View>
                <View style={styles.syncTextWrap}>
                  <Text style={styles.syncTitle}>ICS Calendar Feed</Text>
                  <Text style={styles.syncStatus}>
                    {calendarExporting ? "Preparing export" : "Ready from backend"}
                  </Text>
                </View>
                <Pressable
                  disabled={calendarExporting}
                  onPress={handleExportCalendar}
                  style={[
                    styles.primaryMiniButton,
                    calendarExporting && styles.disabled,
                  ]}
                >
                  <Text style={styles.primaryMiniText}>
                    {calendarExporting ? "Exporting" : "Export"}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.syncDescription}>
                Downloads future RSVP, created, and bookmarked events using
                your current calendar preferences.
              </Text>
            </View>
        </View>

        <View style={styles.sectionBand}>
          <SectionHeader
            eyebrow="Subscribe to community event feeds"
            title="Community Calendars"
          />
          {communityCalendarsLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={palette.primary} />
            </View>
          )}
          {communityCalendars.map((calendarItem) => (
            <View key={calendarItem.id} style={styles.communityCard}>
              <View style={styles.communityIcon}>
                {calendarItem.subscribedByMe ? (
                  <Users color={palette.ink} size={20} />
                ) : calendarItem.type === "seva" ? (
                  <Heart color={palette.ink} size={20} />
                ) : (
                  <Sparkles color={palette.ink} size={20} />
                )}
              </View>
              <View style={styles.communityBody}>
                <View style={styles.communityTitleRow}>
                  <Text style={styles.communityTitle}>
                    {calendarItem.title}
                  </Text>
                  {!!calendarItem.subscribedByMe && (
                    <CheckCircle2 color={palette.primary} size={16} />
                  )}
                </View>
                <Text style={styles.communitySubtitle}>
                  {[
                    calendarItem.city,
                    calendarItem.state,
                    calendarItem.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Community calendar"}
                  {` - ${calendarItem.subscribers ?? 0} subscribers`}
                </Text>
                <Pressable
                  onPress={() =>
                    handleCommunityCalendarPress(
                      calendarItem.id,
                      calendarItem.subscribedByMe
                    )
                  }
                  style={[
                    styles.communityButton,
                    !calendarItem.subscribedByMe &&
                      styles.communityButtonFilled,
                  ]}
                >
                  <Text
                    style={[
                      styles.communityButtonText,
                      !calendarItem.subscribedByMe &&
                        styles.communityButtonTextFilled,
                    ]}
                  >
                    {calendarItem.subscribedByMe ? "Unsubscribe" : "Subscribe"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
          {!communityCalendarsLoading && !communityCalendars.length && (
            <EmptySmallCard
              icon={<Users color={palette.primary} size={20} />}
              text="No community calendars returned by backend yet."
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Notification Preferences" />
          <View style={styles.preferenceCard}>
            <PreferenceRow
              active={reminderMinutes > 0}
              disabled={calendarPreferencesLoading}
              onPress={() =>
                handleReminderChange(reminderMinutes > 0 ? 0 : 30)
              }
              subtitle={`${reminderMinutes || 0} minutes before events start`}
              title="Event Reminders"
            />
            <PreferenceRow
              active={Boolean(calendarPreferences?.showRsvpedEvents)}
              disabled={calendarPreferencesLoading}
              onPress={() => handleTogglePreference("showRsvpedEvents")}
              subtitle="Show events you RSVP to in calendar feed"
              title="RSVP Events"
            />
            <PreferenceRow
              active={Boolean(calendarPreferences?.showCreatedEvents)}
              disabled={calendarPreferencesLoading}
              onPress={() => handleTogglePreference("showCreatedEvents")}
              subtitle="Show events created by you in calendar feed"
              title="Created Events"
            />
            <PreferenceRow
              active={Boolean(calendarPreferences?.showBookmarkedEvents)}
              disabled={calendarPreferencesLoading}
              onPress={() => handleTogglePreference("showBookmarkedEvents")}
              subtitle="Show bookmarked events in calendar feed"
              title="Bookmarked Events"
            />
          </View>
          <View style={styles.reminderCard}>
            <Text style={styles.breakdownTitle}>Reminder Timing</Text>
            {reminderOptions.map(({label, minutes}) => (
                <Pressable
                  disabled={calendarPreferencesLoading}
                  key={String(minutes)}
                  onPress={() => handleReminderChange(minutes)}
                  style={styles.radioRow}
                >
                  <View
                    style={[
                      styles.radio,
                      reminderMinutes === minutes && styles.radioActive,
                    ]}
                  />
                  <Text style={styles.radioText}>{label}</Text>
                </Pressable>
              ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  breakdownCard: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  breakdownRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  breakdownTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 6,
  },
  breakdownValue: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  calendarDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  calendarPanel: {
    backgroundColor: palette.card,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  cardStack: {
    gap: 12,
    paddingHorizontal: 16,
  },
  communityBody: {
    flex: 1,
  },
  communityButton: {
    alignSelf: "flex-start",
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  communityButtonFilled: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  communityButtonText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  communityButtonTextFilled: {
    color: "#FFFFFF",
  },
  communityCard: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    padding: 12,
  },
  communityIcon: {
    alignItems: "center",
    backgroundColor: palette.soft,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  communitySubtitle: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  communityTitle: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
  },
  communityTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  container: {
    backgroundColor: palette.bg,
    flex: 1,
  },
  content: {
    paddingBottom: 34,
    paddingTop: 76,
  },
  dateTile: {
    alignItems: "center",
    backgroundColor: palette.soft,
    borderRadius: 10,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  dateTileDay: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: "900",
  },
  dateTileWeek: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "900",
  },
  dayCell: {
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 999,
    justifyContent: "center",
    marginVertical: 2,
    width: `${100 / 7}%`,
  },
  dayMuted: {
    color: "#D6D3D1",
  },
  daySelected: {
    backgroundColor: palette.ink,
  },
  dayText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  dayToday: {
    backgroundColor: palette.chip,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 8,
  },
  detailText: {
    color: palette.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
  dotRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  emptySmallCard: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  emptySmallText: {
    color: palette.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  header: {
    alignItems: "center",
    backgroundColor: "rgba(250,250,249,0.96)",
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 76,
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 28,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  headerButton: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  imageText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  inlineMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  inlineMetaText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  legend: {
    backgroundColor: palette.bg,
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 24,
  },
  monthButton: {
    alignItems: "center",
    backgroundColor: palette.soft,
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  monthHint: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  monthNav: {
    backgroundColor: palette.card,
    borderBottomColor: "#F1E4CE",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  monthRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  monthTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  moreText: {
    bottom: 4,
    color: palette.ink,
    fontSize: 8,
    fontWeight: "900",
    position: "absolute",
  },
  moreTextSelected: {
    color: "#FFFFFF",
  },
  myEventActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 9,
  },
  myEventBody: {
    flex: 1,
  },
  myEventCard: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  myEventIcon: {
    alignItems: "center",
    backgroundColor: palette.soft,
    borderRadius: 10,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  myEventTime: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  myEventTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  iconMiniButton: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 34,
  },
  outlineMiniButton: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  outlineMiniText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  preferenceCard: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  preferenceRow: {
    alignItems: "center",
    borderBottomColor: "#F1E4CE",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
  },
  preferenceSubtitle: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  preferenceTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  preferenceTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.86,
  },
  primaryMiniButton: {
    backgroundColor: palette.ink,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  primaryMiniText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  quickCard: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: "48%",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },
  quickIcon: {
    alignItems: "center",
    backgroundColor: palette.soft,
    borderRadius: 10,
    height: 42,
    justifyContent: "center",
    marginBottom: 10,
    width: 42,
  },
  quickSubtitle: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  quickTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  radio: {
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    width: 16,
  },
  radioActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  radioRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    paddingVertical: 5,
  },
  radioText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  recommendationBody: {
    padding: 12,
  },
  recommendationCard: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  recommendationFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  recommendationImage: {
    alignItems: "center",
    backgroundColor: palette.soft,
    height: 130,
    justifyContent: "center",
  },
  recommendationTitle: {
    color: palette.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
  },
  recommendationTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  reminderCard: {
    backgroundColor: palette.chip,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  sectionBand: {
    backgroundColor: palette.chip,
    paddingBottom: 22,
    paddingTop: 22,
  },
  sectionBandLast: {
    backgroundColor: palette.chip,
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  sectionEyebrow: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  selectedBody: {
    flex: 1,
  },
  selectedCard: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  selectedHeader: {
    alignItems: "center",
    backgroundColor: palette.chip,
    borderTopColor: palette.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  selectedHeaderSub: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  selectedHeaderTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  selectedIcon: {
    alignItems: "center",
    backgroundColor: palette.soft,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  selectedLocation: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  selectedMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  selectedTime: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  selectedTitle: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19,
  },
  selectedTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  smallBadge: {
    backgroundColor: palette.soft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  smallBadgeText: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  statCard: {
    backgroundColor: palette.chip,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statIcon: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    marginBottom: 8,
    width: 34,
  },
  statLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statValue: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
  },
  supportIcon: {
    alignItems: "center",
    backgroundColor: palette.soft,
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  supportLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  supportRow: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 14,
  },
  supportText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  switchThumb: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    height: 20,
    left: 2,
    position: "absolute",
    top: 2,
    width: 20,
  },
  switchThumbActive: {
    left: 22,
  },
  switchTrack: {
    backgroundColor: "#E7E5E4",
    borderRadius: 999,
    height: 24,
    width: 44,
  },
  switchTrackActive: {
    backgroundColor: palette.ink,
  },
  todayButton: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 64,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  todayButtonText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  syncCard: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  syncDescription: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 10,
  },
  syncIcon: {
    alignItems: "center",
    backgroundColor: palette.soft,
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  syncStatus: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  syncTextWrap: {
    flex: 1,
  },
  syncTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  syncTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  textAction: {
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  textActionLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  typeDot: {
    borderRadius: 3,
    height: 7,
    width: 7,
  },
  typePill: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  typeText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  upcomingBody: {
    flex: 1,
  },
  upcomingCard: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  upcomingMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 2,
  },
  upcomingTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekText: {
    color: palette.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
});
