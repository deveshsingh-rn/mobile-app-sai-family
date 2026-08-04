import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart3,
  BookHeart,
  Check,
  ChevronRight,
  CircleEllipsis,
  House,
  RotateCcw,
  Share2,
  Sparkles,
  Undo2,
  Volume2,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import {
  createDefaultNaamJapData,
  getLocalDateKey,
  loadNaamJapData,
  type NaamJapData,
  saveNaamJapData,
} from "@/services/naam-jap-storage";

type NaamJapTab = "home" | "insights" | "experience" | "more";

const SAI_IMAGE = require("@/assets/images/saijii.jpg");
const TARGETS: NaamJapData["target"][] = [27, 54, 108];

const TAB_ITEMS = [
  { Icon: House, key: "home" as const, label: "Home" },
  { Icon: BarChart3, key: "insights" as const, label: "Insights" },
  { Icon: BookHeart, key: "experience" as const, label: "Experience" },
  { Icon: CircleEllipsis, key: "more" as const, label: "More" },
];

const getDateKeyOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function NaamJapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<NaamJapTab>("home");
  const [data, setData] = useState<NaamJapData>(createDefaultNaamJapData);
  const [hydrated, setHydrated] = useState(false);
  const dataRef = useRef(data);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    void loadNaamJapData().then((stored) => {
      if (mounted) {
        dataRef.current = stored;
        hydratedRef.current = true;
        setData(stored);
        setHydrated(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const timeout = setTimeout(() => {
      void saveNaamJapData(data);
    }, 220);

    return () => clearTimeout(timeout);
  }, [data, hydrated]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" && hydratedRef.current) {
        void saveNaamJapData(dataRef.current);
      }
    });

    return () => {
      subscription.remove();

      if (hydratedRef.current) {
        void saveNaamJapData(dataRef.current);
      }
    };
  }, []);

  const roundCount =
    data.sessionCount === 0
      ? 0
      : ((data.sessionCount - 1) % data.target) + 1;
  const progress = roundCount / data.target;
  const completedMalas = Math.floor(data.totalCount / 108);
  const ringSize = Math.min(width - 88, 236);
  const ringStroke = 10;
  const radius = (ringSize - ringStroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const weeklyCounts = useMemo(() => {
    const today = getLocalDateKey();

    return Array.from({ length: 7 }, (_, index) => {
      const date = getDateKeyOffset(index - 6);
      const count =
        date === today
          ? data.todayCount
          : data.history.find((item) => item.date === date)?.count || 0;
      const dateValue = new Date(`${date}T12:00:00`);

      return {
        count,
        date,
        label: new Intl.DateTimeFormat("en-IN", { weekday: "short" })
          .format(dateValue)
          .slice(0, 1),
      };
    });
  }, [data.history, data.todayCount]);

  const maxWeeklyCount = Math.max(1, ...weeklyCounts.map((item) => item.count));

  const increment = useCallback(() => {
    setData((current) => {
      const nextSessionCount = current.sessionCount + 1;

      if (current.hapticsEnabled) {
        const completedTarget = nextSessionCount % current.target === 0;
        void (completedTarget
          ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      }

      return {
        ...current,
        sessionCount: nextSessionCount,
        todayCount: current.todayCount + 1,
        totalCount: current.totalCount + 1,
      };
    });
  }, []);

  const undoLast = () => {
    setData((current) => {
      if (current.sessionCount === 0) {
        return current;
      }

      void Haptics.selectionAsync();

      return {
        ...current,
        sessionCount: Math.max(0, current.sessionCount - 1),
        todayCount: Math.max(0, current.todayCount - 1),
        totalCount: Math.max(0, current.totalCount - 1),
      };
    });
  };

  const resetSession = () => {
    Alert.alert(
      "Reset this session?",
      "Your lifetime and today totals will remain unchanged.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () =>
            setData((current) => ({ ...current, sessionCount: 0 })),
          style: "destructive",
          text: "Reset session",
        },
      ]
    );
  };

  const resetToday = () => {
    Alert.alert("Reset today’s count?", "This cannot be undone.", [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () =>
          setData((current) => ({
            ...current,
            sessionCount: 0,
            todayCount: 0,
            totalCount: Math.max(0, current.totalCount - current.todayCount),
          })),
        style: "destructive",
        text: "Reset today",
      },
    ]);
  };

  const shareProgress = async () => {
    await Share.share({
      message: `Om Sai Ram. I completed ${data.todayCount} Sai Naam Jap today with Sai Ki Family.`,
    });
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/experiences" as never);
    }
  };

  if (!hydrated) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#C2410C" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable
          accessibilityLabel="Close Naam Jap"
          accessibilityRole="button"
          hitSlop={6}
          onPress={goBack}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <ArrowLeft color="#292524" size={24} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>DAILY PRACTICE</Text>
          <Text style={styles.headerTitle}>Sai Naam Jap</Text>
        </View>
        <View style={styles.malaBadge}>
          <Sparkles color="#9A3412" size={15} />
          <Text style={styles.malaBadgeText}>{completedMalas}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "home" ? (
          <>
            <View style={styles.welcomeBand}>
              <Image source={SAI_IMAGE} style={styles.saiImage} />
              <View style={styles.welcomeCopy}>
                <Text style={styles.welcomeTitle}>Om Sai Ram</Text>
                <Text style={styles.welcomeText}>
                  Keep your attention on Sai. Tap once with every Naam.
                </Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <Stat label="Today" value={data.todayCount} />
              <View style={styles.statDivider} />
              <Stat label="Lifetime" value={data.totalCount} />
              <View style={styles.statDivider} />
              <Stat label="108 Malas" value={completedMalas} />
            </View>

            <View style={styles.counterArea}>
              <Svg height={ringSize} width={ringSize}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  fill="none"
                  r={radius}
                  stroke="#F0E8DD"
                  strokeWidth={ringStroke}
                />
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  fill="none"
                  r={radius}
                  rotation="-90"
                  origin={`${ringSize / 2}, ${ringSize / 2}`}
                  stroke="#C2410C"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  strokeWidth={ringStroke}
                />
              </Svg>
              <Pressable
                accessibilityHint="Increases your Sai Naam count by one"
                accessibilityLabel={`Count ${roundCount} of ${data.target}`}
                accessibilityRole="button"
                onPress={increment}
                style={({ pressed }) => [
                  styles.counterButton,
                  { height: ringSize - 34, width: ringSize - 34 },
                  pressed && styles.counterPressed,
                ]}
              >
                <Text style={styles.counterMantra}>SAI</Text>
                <Text style={styles.counterValue}>{roundCount}</Text>
                <Text style={styles.counterTarget}>of {data.target}</Text>
                <Text style={styles.counterPrompt}>TAP TO COUNT</Text>
              </Pressable>
            </View>

            <Text style={styles.roundText}>
              Session total: {data.sessionCount} Naam
            </Text>
            <View style={styles.secondaryActions}>
              <SmallAction
                disabled={data.sessionCount === 0}
                Icon={Undo2}
                label="Undo"
                onPress={undoLast}
              />
              <SmallAction
                disabled={data.sessionCount === 0}
                Icon={RotateCcw}
                label="Reset session"
                onPress={resetSession}
              />
            </View>
          </>
        ) : null}

        {activeTab === "insights" ? (
          <>
            <SectionIntro
              eyebrow="YOUR PRACTICE"
              text="A gentle view of your consistency. Every Naam matters."
              title="Insights"
            />
            <View style={styles.metricGrid}>
              <Metric label="Today" value={data.todayCount} />
              <Metric label="Lifetime" value={data.totalCount} />
              <Metric label="Completed malas" value={completedMalas} />
              <Metric
                label="Current target"
                value={`${roundCount}/${data.target}`}
              />
            </View>
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Last 7 days</Text>
              <View style={styles.chart}>
                {weeklyCounts.map((item) => (
                  <View key={item.date} style={styles.chartColumn}>
                    <Text style={styles.chartValue}>{item.count}</Text>
                    <View style={styles.chartTrack}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: Math.max(
                              item.count ? 12 : 2,
                              (item.count / maxWeeklyCount) * 120
                            ),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}

        {activeTab === "experience" ? (
          <>
            <SectionIntro
              eyebrow="AFTER NAAM JAP"
              text="Carry the calm from your practice into the Sai Family."
              title="Share the feeling"
            />
            <View style={styles.reflectionBand}>
              <Image source={SAI_IMAGE} style={styles.reflectionImage} />
              <View style={styles.reflectionOverlay} />
              <View style={styles.reflectionCopy}>
                <Text style={styles.reflectionTitle}>
                  How did Sai Naam touch you today?
                </Text>
                <Text style={styles.reflectionText}>
                  Share a prayer, a feeling, or a small moment with other devotees.
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/experiences/post" as never)}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            >
              <BookHeart color="#FFFFFF" size={20} />
              <Text style={styles.primaryActionText}>Share an experience</Text>
              <ChevronRight color="#FFFFFF" size={20} />
            </Pressable>
            <Pressable
              onPress={shareProgress}
              style={({ pressed }) => [styles.outlineAction, pressed && styles.pressed]}
            >
              <Share2 color="#9A3412" size={19} />
              <Text style={styles.outlineActionText}>Share today’s count</Text>
            </Pressable>
          </>
        ) : null}

        {activeTab === "more" ? (
          <>
            <SectionIntro
              eyebrow="PREFERENCES"
              text="Choose a count that feels comfortable for your daily practice."
              title="Practice settings"
            />
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Count target</Text>
              <View style={styles.targetControl}>
                {TARGETS.map((target) => (
                  <Pressable
                    key={target}
                    onPress={() => setData((current) => ({ ...current, target }))}
                    style={[
                      styles.targetOption,
                      data.target === target && styles.activeTargetOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.targetText,
                        data.target === target && styles.activeTargetText,
                      ]}
                    >
                      {target}
                    </Text>
                    {data.target === target ? (
                      <Check color="#FFFFFF" size={14} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Volume2 color="#9A3412" size={20} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>Gentle haptic feedback</Text>
                <Text style={styles.settingDescription}>
                  Feel a light response with each Naam.
                </Text>
              </View>
              <Switch
                onValueChange={(hapticsEnabled) =>
                  setData((current) => ({ ...current, hapticsEnabled }))
                }
                trackColor={{ false: "#D6D3D1", true: "#FDBA74" }}
                thumbColor={data.hapticsEnabled ? "#C2410C" : "#FFFFFF"}
                value={data.hapticsEnabled}
              />
            </View>
            <Pressable
              onPress={resetToday}
              style={({ pressed }) => [styles.dangerAction, pressed && styles.pressed]}
            >
              <RotateCcw color="#B42318" size={19} />
              <Text style={styles.dangerActionText}>Reset today’s count</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TAB_ITEMS.map(({ Icon, key, label }) => {
          const active = activeTab === key;

          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={key}
              onPress={() => setActiveTab(key)}
              style={styles.tabButton}
            >
              <View style={[styles.tabIcon, active && styles.activeTabIcon]}>
                <Icon
                  color={active ? "#C2410C" : "#78716C"}
                  size={21}
                  strokeWidth={active ? 2.4 : 2}
                />
              </View>
              <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value.toLocaleString("en-IN")}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SectionIntro({
  eyebrow,
  text,
  title,
}: {
  eyebrow: string;
  text: string;
  title: string;
}) {
  return (
    <View style={styles.sectionIntro}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageDescription}>{text}</Text>
    </View>
  );
}

function SmallAction({
  disabled,
  Icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  Icon: typeof Undo2;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallAction,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon color="#57534E" size={17} />
      <Text style={styles.smallActionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F7F4", flex: 1 },
  loadingScreen: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FFFCF8",
    borderBottomColor: "#E9E2D8",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 66,
    paddingBottom: 10,
    paddingHorizontal: 14,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerCopy: { flex: 1, marginLeft: 8 },
  headerEyebrow: { color: "#C2410C", fontSize: 10, fontWeight: "800" },
  headerTitle: { color: "#292524", fontSize: 19, fontWeight: "900", marginTop: 1 },
  malaBadge: {
    alignItems: "center",
    backgroundColor: "#FFF1DF",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 11,
  },
  malaBadgeText: { color: "#9A3412", fontSize: 13, fontWeight: "800" },
  content: { paddingBottom: 36 },
  welcomeBand: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#ECE6DD",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  saiImage: { borderRadius: 31, height: 62, width: 62 },
  welcomeCopy: { flex: 1, marginLeft: 13 },
  welcomeTitle: { color: "#292524", fontSize: 20, fontWeight: "900" },
  welcomeText: { color: "#78716C", fontSize: 13, lineHeight: 19, marginTop: 3 },
  statRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
  },
  stat: { alignItems: "center", flex: 1 },
  statValue: { color: "#292524", fontSize: 17, fontWeight: "900" },
  statLabel: { color: "#78716C", fontSize: 10, fontWeight: "700", marginTop: 3 },
  statDivider: { backgroundColor: "#E7E5E4", height: 28, width: 1 },
  counterArea: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  counterButton: {
    alignItems: "center",
    backgroundColor: "#292524",
    borderColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 5,
    justifyContent: "center",
    position: "absolute",
    shadowColor: "#7C2D12",
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  counterPressed: { opacity: 0.88, transform: [{ scale: 0.975 }] },
  counterMantra: { color: "#FDBA74", fontSize: 14, fontWeight: "900" },
  counterValue: { color: "#FFFFFF", fontSize: 50, fontWeight: "800", marginTop: 1 },
  counterTarget: { color: "#D6D3D1", fontSize: 13, fontWeight: "700" },
  counterPrompt: { color: "#A8A29E", fontSize: 9, fontWeight: "800", marginTop: 10 },
  roundText: { color: "#57534E", fontSize: 13, fontWeight: "700", marginTop: 18, textAlign: "center" },
  secondaryActions: { flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 14 },
  smallAction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E2DA",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  smallActionText: { color: "#57534E", fontSize: 13, fontWeight: "700" },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  sectionIntro: { paddingHorizontal: 20, paddingTop: 24 },
  sectionEyebrow: { color: "#C2410C", fontSize: 11, fontWeight: "900" },
  pageTitle: { color: "#292524", fontSize: 28, fontWeight: "900", marginTop: 5 },
  pageDescription: { color: "#78716C", fontSize: 14, lineHeight: 21, marginTop: 6 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 18 },
  metric: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9E3DA",
    borderRadius: 14,
    borderWidth: 1,
    padding: 15,
    width: "48%",
  },
  metricValue: { color: "#292524", fontSize: 24, fontWeight: "900" },
  metricLabel: { color: "#78716C", fontSize: 12, fontWeight: "700", marginTop: 5 },
  chartSection: { backgroundColor: "#FFFFFF", borderTopColor: "#ECE6DD", borderTopWidth: 1, padding: 18 },
  sectionTitle: { color: "#292524", fontSize: 17, fontWeight: "900" },
  chart: { alignItems: "flex-end", flexDirection: "row", gap: 8, height: 180, marginTop: 18 },
  chartColumn: { alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end" },
  chartValue: { color: "#78716C", fontSize: 9, marginBottom: 4 },
  chartTrack: { backgroundColor: "#F2EDE6", borderRadius: 5, flex: 1, justifyContent: "flex-end", overflow: "hidden", width: 18 },
  chartBar: { backgroundColor: "#C2410C", borderRadius: 5, minHeight: 2, width: "100%" },
  chartLabel: { color: "#78716C", fontSize: 11, fontWeight: "700", marginTop: 6 },
  reflectionBand: { height: 290, marginTop: 22, overflow: "hidden", position: "relative" },
  reflectionImage: { height: "100%", width: "100%" },
  reflectionOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(28,25,23,0.48)" },
  reflectionCopy: { bottom: 22, left: 20, position: "absolute", right: 20 },
  reflectionTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", lineHeight: 30 },
  reflectionText: { color: "#F5F5F4", fontSize: 14, lineHeight: 21, marginTop: 7 },
  primaryAction: {
    alignItems: "center",
    backgroundColor: "#292524",
    borderRadius: 13,
    flexDirection: "row",
    gap: 9,
    marginHorizontal: 18,
    marginTop: 18,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primaryActionText: { color: "#FFFFFF", flex: 1, fontSize: 15, fontWeight: "800" },
  outlineAction: {
    alignItems: "center",
    borderColor: "#E7D7BE",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginHorizontal: 18,
    marginTop: 10,
    minHeight: 50,
  },
  outlineActionText: { color: "#9A3412", fontSize: 14, fontWeight: "800" },
  settingSection: { backgroundColor: "#FFFFFF", marginTop: 22, padding: 18 },
  settingLabel: { color: "#292524", fontSize: 15, fontWeight: "800" },
  targetControl: { flexDirection: "row", gap: 8, marginTop: 12 },
  targetOption: {
    alignItems: "center",
    backgroundColor: "#F5F5F4",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 46,
  },
  activeTargetOption: { backgroundColor: "#C2410C" },
  targetText: { color: "#57534E", fontSize: 15, fontWeight: "800" },
  activeTargetText: { color: "#FFFFFF" },
  settingRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopColor: "#ECE6DD",
    borderTopWidth: 1,
    flexDirection: "row",
    padding: 18,
  },
  settingIcon: { alignItems: "center", backgroundColor: "#FFF1DF", borderRadius: 12, height: 44, justifyContent: "center", width: 44 },
  settingCopy: { flex: 1, marginLeft: 12 },
  settingTitle: { color: "#292524", fontSize: 15, fontWeight: "800" },
  settingDescription: { color: "#78716C", fontSize: 12, lineHeight: 18, marginTop: 2 },
  dangerAction: {
    alignItems: "center",
    backgroundColor: "#FFF1F0",
    borderRadius: 13,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    margin: 18,
    minHeight: 50,
  },
  dangerActionText: { color: "#B42318", fontSize: 14, fontWeight: "800" },
  bottomBar: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E7E2DA",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingTop: 7,
  },
  tabButton: { alignItems: "center", flex: 1, minHeight: 52 },
  tabIcon: { alignItems: "center", borderRadius: 12, height: 30, justifyContent: "center", width: 40 },
  activeTabIcon: { backgroundColor: "#FFF1DF" },
  tabLabel: { color: "#78716C", fontSize: 10, fontWeight: "700", marginTop: 2 },
  activeTabLabel: { color: "#C2410C", fontWeight: "900" },
});
