import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart3,
  BookHeart,
  Check,
  ChevronRight,
  CircleEllipsis,
  Clock3,
  Edit3,
  Hand,
  House,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Share2,
  Trash2,
  Undo2,
  Volume2,
} from "lucide-react-native";
import { MotiView } from "moti";
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
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NaamJapSkiaBackground } from "@/components/naam-jap/NaamJapSkiaBackground";
import { PressableScale } from "@/components/naam-jap/PressableScale";
import {
  createDefaultNaamJapData,
  getLocalDateKey,
  loadNaamJapData,
  type NaamJapData,
  type NaamJapName,
  saveNaamJapData,
} from "@/services/naam-jap-storage";

type NaamJapTab = "home" | "insights" | "experience" | "more";
type NaamJapSheet = "more" | "names" | "target" | null;
type FloatingNaamItem = { id: string; left: number; label: string };

const SAI_IMAGE = require("@/assets/images/saijii.jpg");
const TARGETS: NaamJapData["target"][] = [27, 54, 108];

const TAB_ITEMS = [
  { Icon: House, key: "home" as const, label: "Home" },
  { Icon: BarChart3, key: "insights" as const, label: "Insights" },
  { Icon: BookHeart, key: "experience" as const, label: "Experience" },
  { Icon: CircleEllipsis, key: "more" as const, label: "More" },
];

const TAB_WIDTH_PERCENT = 100 / TAB_ITEMS.length;

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
  const [activeTab, setActiveTab] = useState<NaamJapTab>("home");
  const [data, setData] = useState<NaamJapData>(createDefaultNaamJapData);
  const [hydrated, setHydrated] = useState(false);
  const [activeSheet, setActiveSheet] = useState<NaamJapSheet>(null);
  const [floatingNaams, setFloatingNaams] = useState<FloatingNaamItem[]>([]);
  const [nameDraft, setNameDraft] = useState("");
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
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
  const completedMalas = Math.floor(data.totalCount / 108);
  const todayMalas = Math.floor(data.todayCount / 108);
  const selectedName =
    data.jaapNames.find((item) => item.id === data.selectedNameId) ||
    data.jaapNames[0];
  const targetNaamCount = data.targetMalas * 108;
  const targetProgress = Math.min(1, data.sessionCount / targetNaamCount);

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

  const countNaam = useCallback(() => {
    const currentName =
      dataRef.current.jaapNames.find(
        (item) => item.id === dataRef.current.selectedNameId
      ) || dataRef.current.jaapNames[0];
    const id = `${Date.now()}-${Math.random()}`;

    setFloatingNaams((current) => [
      ...current.slice(-5),
      {
        id,
        label: currentName?.label || "Sai Ram",
        left: 6 + Math.random() * 38,
      },
    ]);
    increment();
  }, [increment]);

  useEffect(() => {
    if (!data.autoCountSeconds || activeTab !== "home") {
      return;
    }

    const interval = setInterval(countNaam, data.autoCountSeconds * 1000);

    return () => clearInterval(interval);
  }, [activeTab, countNaam, data.autoCountSeconds]);

  const switchTab = useCallback((tab: NaamJapTab) => {
    void Haptics.selectionAsync();
    setActiveTab(tab);
  }, []);

  const closeSheet = () => {
    setActiveSheet(null);
    setEditingNameId(null);
    setNameDraft("");
  };

  const saveName = () => {
    const label = nameDraft.trim();

    if (!label) {
      return;
    }

    setData((current) => {
      if (editingNameId) {
        return {
          ...current,
          jaapNames: current.jaapNames.map((item) =>
            item.id === editingNameId ? { ...item, label } : item
          ),
        };
      }

      const newName: NaamJapName = {
        id: `${Date.now()}`,
        label,
      };

      return {
        ...current,
        jaapNames: [...current.jaapNames, newName],
        selectedNameId: newName.id,
      };
    });
    setEditingNameId(null);
    setNameDraft("");
  };

  const editName = (name: NaamJapName) => {
    setEditingNameId(name.id);
    setNameDraft(name.label);
  };

  const deleteName = (name: NaamJapName) => {
    if (data.jaapNames.length === 1) {
      Alert.alert("Keep one Naam", "At least one Naam is required for Jaap.");
      return;
    }

    Alert.alert("Delete this Naam?", name.label, [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () =>
          setData((current) => {
            const remaining = current.jaapNames.filter(
              (item) => item.id !== name.id
            );

            return {
              ...current,
              jaapNames: remaining,
              selectedNameId:
                current.selectedNameId === name.id
                  ? remaining[0].id
                  : current.selectedNameId,
            };
          }),
        style: "destructive",
        text: "Delete",
      },
    ]);
  };

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
      <NaamJapSkiaBackground />
      <BlurView
        intensity={76}
        tint="light"
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        <PressableScale
          accessibilityLabel="Close Naam Jap"
          accessibilityRole="button"
          hitSlop={6}
          onPress={goBack}
          style={styles.headerButton}
        >
          <ArrowLeft color="#292524" size={24} />
        </PressableScale>
        <Text style={styles.headerTitle}>Naam Jap</Text>
        <View style={styles.headerActions}>
          <PressableScale
            accessibilityLabel="Naam Jap options"
            accessibilityRole="button"
            onPress={() => setActiveSheet("more")}
            style={[styles.headerButton, { marginRight: 8 }]}
          >
            <MoreHorizontal color="#292524" size={24} />
          </PressableScale>
          <PressableScale
            accessibilityLabel="Edit mala goal"
            accessibilityRole="button"
            onPress={() => setActiveSheet("target")}
            style={styles.headerButton}
          >
            <Edit3 color="#292524" size={21} />
          </PressableScale>
        </View>
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "home" ? (
          <>
            <MotiView
              animate={{ opacity: 1, translateY: 0 }}
              from={{ opacity: 0, translateY: 12 }}
              transition={{ delay: 30, duration: 420, type: "timing" }}
            >
              <PressableScale
                accessibilityHint="Opens your saved Naam list"
                accessibilityRole="button"
                onPress={() => setActiveSheet("names")}
                scaleTo={0.985}
                style={styles.naamHeading}
              >
                <BlurView
                  intensity={20}
                  pointerEvents="none"
                  style={StyleSheet.absoluteFill}
                  tint="light"
                />
                <LinearGradient
                  colors={["rgba(255,255,255,0.62)", "rgba(235,246,239,0.22)"]}
                  end={{ x: 1, y: 1 }}
                  pointerEvents="none"
                  start={{ x: 0, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.naamAccent} />
                <View style={styles.naamHeadingCopy}>
                  <Text style={styles.naamEyebrow}>YOUR JAAP</Text>
                  <Text numberOfLines={2} style={styles.naamTitle}>
                    {selectedName?.label || "Sai Ram"}
                  </Text>
                  <Text style={styles.naamHint}>Tap to choose or create a Naam</Text>
                </View>
                <View style={styles.editNameButton}>
                  <Pencil color="#8A4B12" size={18} />
                </View>
              </PressableScale>
            </MotiView>

            <MotiView
              animate={{ opacity: 1, translateY: 0 }}
              from={{ opacity: 0, translateY: 14 }}
              style={styles.malaCards}
              transition={{ delay: 110, duration: 440, type: "timing" }}
            >
              <MalaStatCard
                count={data.todayCount}
                label="Today’s malas"
                malas={todayMalas}
              />
              <MalaStatCard
                count={data.totalCount}
                label="Lifetime malas"
                malas={completedMalas}
              />
            </MotiView>

            <MotiView
              animate={{ opacity: 1 }}
              from={{ opacity: 0 }}
              transition={{ delay: 180, duration: 420, type: "timing" }}
            >
              <View style={styles.goalRow}>
                <Text style={styles.goalText}>
                  {data.sessionCount.toLocaleString("en-IN")} / {targetNaamCount.toLocaleString("en-IN")} Naam
                </Text>
                <Text style={styles.goalText}>{data.targetMalas} mala goal</Text>
              </View>
              <View style={styles.goalTrack}>
                <MotiView
                  animate={{ width: `${targetProgress * 100}%` }}
                  style={styles.goalProgress}
                  transition={{ damping: 20, stiffness: 120, type: "spring" }}
                />
              </View>
            </MotiView>

            <MotiView
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              from={{ opacity: 0, scale: 0.975, translateY: 18 }}
              style={styles.tapFieldShell}
              transition={{ delay: 210, duration: 480, type: "timing" }}
            >
              <PressableScale
                accessibilityHint="Counts one repetition"
                accessibilityLabel={`Count ${selectedName?.label || "Sai Ram"}`}
                accessibilityRole="button"
                onPress={countNaam}
                scaleTo={0.985}
                style={styles.tapField}
              >
                <LinearGradient
                  colors={["#f5f4d1", "#c5e2de", "#d2cceb"]}
                  end={{ x: 1, y: 1 }}
                  pointerEvents="none"
                  start={{ x: 0, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <View pointerEvents="none" style={styles.tapFieldGlow} />
                <View pointerEvents="none" style={styles.tapFieldEdge} />
                <LiveCounter round={roundCount} target={data.target} />
                {floatingNaams.map((item) => (
                  <FloatingNaam
                    item={item}
                    key={item.id}
                    onDone={() =>
                      setFloatingNaams((current) =>
                        current.filter((entry) => entry.id !== item.id)
                      )
                    }
                  />
                ))}
                <View style={styles.tapPrompt}>
                  <View style={styles.handStage}>
                    <MotiView
                      animate={{ opacity: 0, scale: 1.65 }}
                      from={{ opacity: 0.32, scale: 0.82 }}
                      style={styles.handPulse}
                      transition={{ duration: 1900, loop: true, type: "timing" }}
                    />
                    <MotiView
                      animate={{ scale: 1.04 }}
                      from={{ scale: 0.98 }}
                      transition={{
                        duration: 1300,
                        loop: true,
                        repeatReverse: true,
                        type: "timing",
                      }}
                    >
                      <View style={styles.handCircle}>
                        <Hand color="#FBBF24" size={34} strokeWidth={1.8} />
                      </View>
                    </MotiView>
                  </View>
                  <Text style={styles.tapTitle}>Tap for every Naam</Text>
                  <Text style={styles.tapDescription}>
                    Keep your mind on Sai and tap gently
                  </Text>
                </View>
                {data.autoCountSeconds ? (
                  <View style={styles.autoBadge}>
                    <Clock3 color="#166534" size={14} />
                    <Text style={styles.autoBadgeText}>
                      Auto every {data.autoCountSeconds}s
                    </Text>
                  </View>
                ) : null}
              </PressableScale>
            </MotiView>

            <View style={styles.secondaryActions}>
              <SmallAction disabled={data.sessionCount === 0} Icon={Undo2} label="Undo" onPress={undoLast} />
              <SmallAction disabled={data.sessionCount === 0} Icon={RotateCcw} label="Reset" onPress={resetSession} />
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
                      <MotiView
                        animate={{
                          height: Math.max(
                            item.count ? 12 : 2,
                            (item.count / maxWeeklyCount) * 120
                          ),
                        }}
                        style={styles.chartBar}
                        transition={{ damping: 18, stiffness: 140, type: "spring" }}
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
            <PressableScale
              onPress={() => router.push("/(tabs)/experiences/post" as never)}
              scaleTo={0.97}
              style={styles.primaryAction}
            >
              <BookHeart color="#FFFFFF" size={20} />
              <Text style={styles.primaryActionText}>Share an experience</Text>
              <ChevronRight color="#FFFFFF" size={20} />
            </PressableScale>
            <PressableScale
              onPress={shareProgress}
              scaleTo={0.97}
              style={styles.outlineAction}
            >
              <Share2 color="#9A3412" size={19} />
              <Text style={styles.outlineActionText}>Share today’s count</Text>
            </PressableScale>
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
                  <PressableScale
                    key={target}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setData((current) => ({ ...current, target }));
                    }}
                    scaleTo={0.94}
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
                  </PressableScale>
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
            <PressableScale
              onPress={resetToday}
              scaleTo={0.97}
              style={styles.dangerAction}
            >
              <RotateCcw color="#B42318" size={19} />
              <Text style={styles.dangerActionText}>Reset today’s count</Text>
            </PressableScale>
          </>
        ) : null}
      </ScrollView>

      <BlurView
        intensity={82}
        tint="light"
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}
      >
        <MotiView
          animate={{
            left: `${
              TAB_ITEMS.findIndex((t) => t.key === activeTab) *
              TAB_WIDTH_PERCENT
            }%`,
          }}
          style={[styles.tabIndicator, { width: `${TAB_WIDTH_PERCENT}%` }]}
          transition={{ damping: 18, stiffness: 200, type: "spring" }}
        >
          <View style={styles.tabIndicatorPill} />
        </MotiView>
        {TAB_ITEMS.map(({ Icon, key, label }) => {
          const active = activeTab === key;

          return (
            <PressableScale
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={key}
              onPress={() => switchTab(key)}
              scaleTo={0.9}
              style={styles.tabButton}
            >
              <View style={styles.tabIcon}>
                <Icon
                  color={active ? "#C2410C" : "#78716C"}
                  size={21}
                  strokeWidth={active ? 2.4 : 2}
                />
              </View>
              <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </BlurView>

      <NaamJapBottomSheet
        activeSheet={activeSheet}
        closeSheet={closeSheet}
        data={data}
        deleteName={deleteName}
        editName={editName}
        editingNameId={editingNameId}
        nameDraft={nameDraft}
        saveName={saveName}
        selectedName={selectedName}
        setData={setData}
        setNameDraft={setNameDraft}
      />
    </View>
  );
}

function LiveCounter({ round, target }: { round: number; target: number }) {
  return (
    <MotiView
      key={round}
      animate={{ opacity: 1, scale: 1 }}
      from={{ opacity: 0.6, scale: 1.18 }}
      style={styles.liveCount}
      transition={{ damping: 12, stiffness: 220, type: "spring" }}
    >
      <Text style={styles.liveCountValue}>{round}</Text>
      <Text style={styles.liveCountTarget}> / {target}</Text>
    </MotiView>
  );
}

function FloatingNaam({
  item,
  onDone,
}: {
  item: FloatingNaamItem;
  onDone: () => void;
}) {
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const timeout = setTimeout(() => onDoneRef.current(), 1750);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <MotiView
      animate={{ opacity: 0, scale: 1.1, translateY: -200 }}
      from={{ opacity: 1, scale: 0.7, translateY: 0 }}
      style={[styles.floatingNaam, { left: `${item.left}%` }]}
      transition={{
        damping: 14,
        opacity: { duration: 1500, type: "timing" },
        stiffness: 90,
        type: "spring",
      }}
    >
      <Text numberOfLines={1} style={styles.floatingNaamText}>
        {item.label}
      </Text>
    </MotiView>
  );
}

function MalaStatCard({
  count,
  label,
  malas,
}: {
  count: number;
  label: string;
  malas: number;
}) {
  return (
    <BlurView intensity={70} tint="light" style={styles.malaStatCard}>
      <Text style={styles.malaStatLabel}>{label}</Text>
      <View style={styles.malaStatValueRow}>
        <Text style={styles.malaStatValue}>{malas.toLocaleString("en-IN")}</Text>
        <Text style={styles.malaStatUnit}>mala</Text>
      </View>
      <Text style={styles.malaStatCount}>
        {count.toLocaleString("en-IN")} Naam
      </Text>
    </BlurView>
  );
}

function NaamJapBottomSheet({
  activeSheet,
  closeSheet,
  data,
  deleteName,
  editName,
  editingNameId,
  nameDraft,
  saveName,
  selectedName,
  setData,
  setNameDraft,
}: {
  activeSheet: NaamJapSheet;
  closeSheet: () => void;
  data: NaamJapData;
  deleteName: (name: NaamJapName) => void;
  editName: (name: NaamJapName) => void;
  editingNameId: string | null;
  nameDraft: string;
  saveName: () => void;
  selectedName?: NaamJapName;
  setData: React.Dispatch<React.SetStateAction<NaamJapData>>;
  setNameDraft: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={closeSheet}
      presentationStyle="overFullScreen"
      transparent
      visible={Boolean(activeSheet)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalRoot}
      >
        <PressableScale
          accessibilityLabel="Close"
          onPress={closeSheet}
          scaleTo={1}
          style={styles.modalBackdrop}
        />
        <BlurView intensity={92} tint="light" style={styles.sheet}>
          <View style={styles.sheetHandle} />

          {activeSheet === "more" ? (
            <>
              <Text style={styles.sheetTitle}>Counter options</Text>
              <Text style={styles.sheetDescription}>
                Choose whether each Naam is counted by touch or on a gentle timer.
              </Text>
              <View style={styles.sheetSettingRow}>
                <View style={styles.sheetSettingIcon}>
                  <Clock3 color="#9A3412" size={21} />
                </View>
                <View style={styles.sheetSettingCopy}>
                  <Text style={styles.sheetSettingTitle}>Automatic counter</Text>
                  <Text style={styles.sheetSettingText}>
                    Count one Naam at your chosen interval
                  </Text>
                </View>
                <Switch
                  onValueChange={(enabled) =>
                    setData((current) => ({
                      ...current,
                      autoCountSeconds: enabled
                        ? current.autoCountSeconds || 1
                        : null,
                    }))
                  }
                  trackColor={{ false: "#D6D3D1", true: "#86EFAC" }}
                  thumbColor={data.autoCountSeconds ? "#166534" : "#FFFFFF"}
                  value={Boolean(data.autoCountSeconds)}
                />
              </View>
              {data.autoCountSeconds ? (
                <View style={styles.intervalSection}>
                  <Text style={styles.intervalLabel}>Count every</Text>
                  <View style={styles.intervalOptions}>
                    {[1, 2, 5].map((seconds) => {
                      const active = data.autoCountSeconds === seconds;
                      return (
                        <PressableScale
                          key={seconds}
                          onPress={() =>
                            setData((current) => ({
                              ...current,
                              autoCountSeconds: seconds,
                            }))
                          }
                          scaleTo={0.94}
                          style={[
                            styles.intervalButton,
                            active && styles.activeIntervalButton,
                          ]}
                        >
                          <Text
                            style={[
                              styles.intervalButtonText,
                              active && styles.activeIntervalButtonText,
                            ]}
                          >
                            {seconds} sec
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}

          {activeSheet === "target" ? (
            <>
              <Text style={styles.sheetTitle}>Set your mala goal</Text>
              <Text style={styles.sheetDescription}>
                One mala contains 108 Naam. Choose a comfortable goal for this session.
              </Text>
              <View style={styles.targetStepper}>
                <PressableScale
                  accessibilityLabel="Reduce mala goal"
                  disabled={data.targetMalas <= 1}
                  onPress={() =>
                    setData((current) => ({
                      ...current,
                      targetMalas: Math.max(1, current.targetMalas - 1),
                    }))
                  }
                  scaleTo={0.88}
                  style={[
                    styles.stepperButton,
                    data.targetMalas <= 1 && styles.disabled,
                  ]}
                >
                  <Minus color="#292524" size={25} />
                </PressableScale>
                <View style={styles.targetValueCopy}>
                  <MotiView
                    key={data.targetMalas}
                    animate={{ opacity: 1, scale: 1 }}
                    from={{ opacity: 0.5, scale: 1.15 }}
                    transition={{ damping: 14, stiffness: 240, type: "spring" }}
                  >
                    <Text style={styles.targetValue}>{data.targetMalas}</Text>
                  </MotiView>
                  <Text style={styles.targetValueLabel}>malas</Text>
                </View>
                <PressableScale
                  accessibilityLabel="Increase mala goal"
                  disabled={data.targetMalas >= 10000}
                  onPress={() =>
                    setData((current) => ({
                      ...current,
                      targetMalas: Math.min(10000, current.targetMalas + 1),
                    }))
                  }
                  scaleTo={0.88}
                  style={styles.stepperButton}
                >
                  <Plus color="#292524" size={25} />
                </PressableScale>
              </View>
              <Text style={styles.targetSummary}>
                {(data.targetMalas * 108).toLocaleString("en-IN")} total Naam
              </Text>
              <PressableScale
                onPress={closeSheet}
                scaleTo={0.97}
                style={styles.sheetPrimaryButton}
              >
                <Text style={styles.sheetPrimaryButtonText}>Save goal</Text>
              </PressableScale>
            </>
          ) : null}

          {activeSheet === "names" ? (
            <>
              <Text style={styles.sheetTitle}>Choose your Naam</Text>
              <Text style={styles.sheetDescription}>
                Select, add, rename, or remove the Naam used for your Jaap.
              </Text>
              <View style={styles.nameInputRow}>
                <TextInput
                  accessibilityLabel="Naam"
                  maxLength={40}
                  onChangeText={setNameDraft}
                  onSubmitEditing={saveName}
                  placeholder="Add a Naam"
                  placeholderTextColor="#A8A29E"
                  returnKeyType="done"
                  style={styles.nameInput}
                  value={nameDraft}
                />
                <PressableScale
                  disabled={!nameDraft.trim()}
                  onPress={saveName}
                  scaleTo={0.93}
                  style={[
                    styles.saveNameButton,
                    !nameDraft.trim() && styles.disabled,
                  ]}
                >
                  <Text style={styles.saveNameButtonText}>
                    {editingNameId ? "Save" : "Add"}
                  </Text>
                </PressableScale>
              </View>
              <ScrollView
                contentContainerStyle={styles.nameList}
                keyboardShouldPersistTaps="handled"
                style={styles.nameListScroll}
              >
                {data.jaapNames.map((name) => {
                  const selected = selectedName?.id === name.id;
                  return (
                    <View key={name.id} style={styles.nameRow}>
                      <PressableScale
                        onPress={() =>
                          setData((current) => ({
                            ...current,
                            selectedNameId: name.id,
                          }))
                        }
                        scaleTo={0.98}
                        style={styles.nameSelectArea}
                      >
                        <View style={[styles.nameCheck, selected && styles.activeNameCheck]}>
                          {selected ? <Check color="#FFFFFF" size={15} /> : null}
                        </View>
                        <Text numberOfLines={1} style={styles.nameRowText}>
                          {name.label}
                        </Text>
                      </PressableScale>
                      <PressableScale
                        accessibilityLabel={`Edit ${name.label}`}
                        hitSlop={6}
                        onPress={() => editName(name)}
                        scaleTo={0.85}
                        style={styles.nameAction}
                      >
                        <Pencil color="#57534E" size={18} />
                      </PressableScale>
                      <PressableScale
                        accessibilityLabel={`Delete ${name.label}`}
                        hitSlop={6}
                        onPress={() => deleteName(name)}
                        scaleTo={0.85}
                        style={styles.nameAction}
                      >
                        <Trash2 color="#B42318" size={18} />
                      </PressableScale>
                    </View>
                  );
                })}
              </ScrollView>
              <PressableScale
                onPress={closeSheet}
                scaleTo={0.97}
                style={styles.sheetPrimaryButton}
              >
                <Text style={styles.sheetPrimaryButtonText}>Done</Text>
              </PressableScale>
            </>
          ) : null}
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
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
    <MotiView
      animate={{ opacity: 1, translateY: 0 }}
      from={{ opacity: 0, translateY: 10 }}
      style={styles.sectionIntro}
      transition={{ duration: 380, type: "timing" }}
    >
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageDescription}>{text}</Text>
    </MotiView>
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
    <PressableScale
      disabled={disabled}
      onPress={onPress}
      scaleTo={0.92}
      style={[styles.smallAction, disabled && styles.disabled]}
    >
      <Icon color="#57534E" size={17} />
      <Text style={styles.smallActionText}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF", flex: 1 },
  loadingScreen: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    backgroundColor: "rgba(230, 229, 229, 0.74)",
    borderBottomColor: "rgba(255,255,255,0.88)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 66,
    paddingBottom: 10,
    paddingHorizontal: 14,
    shadowColor: "#1C1917",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    zIndex: 5,
  },
  headerButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.9)",
    borderCurve: "continuous",
    borderRadius: 15,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
  },
  headerCopy: { flex: 1, marginLeft: 8 },
  headerEyebrow: { color: "#C2410C", fontSize: 10, fontWeight: "800" },
  headerTitle: {
    color: "#292524",
    flex: 1,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginLeft: 8,
  },
  malaBadge: {
    alignItems: "center",
    backgroundColor: "#FFF1DF",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 11,
  },
  malaBadgeText: { color: "#9A3412", fontSize: 13, fontWeight: "800", letterSpacing: 0.2 },
  content: { paddingBottom: 38, paddingTop: 14 },
  naamHeading: {
    alignItems: "center",
    backgroundColor: "rgba(201, 200, 200, 0.55)",
    borderColor: "rgba(255,255,255,0.9)",
    borderCurve: "continuous",
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 16,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 19,
    shadowColor: "#1C1917",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  naamHeadingCopy: { flex: 1 },
  naamEyebrow: {
    color: "#9A5A18",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  naamTitle: {
    color: "#1C1917",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 41,
    marginTop: 3,
    paddingTop: 10,
  },
  naamHint: {
    color: "#78716C",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  naamAccent: {
    backgroundColor: "#D89737",
    bottom: 16,
    left: 0,
    position: "absolute",
    top: 16,
    width: 3,
  },
  editNameButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,240,219,0.72)",
    borderColor: "rgba(255,255,255,0.92)",
    borderCurve: "continuous",
    borderRadius: 15,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    marginLeft: 14,
    width: 44,
  },
  malaCards: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  malaStatCard: {
    backgroundColor: "rgba(201, 200, 200, 0.5)",
    borderColor: "rgba(255,255,255,0.94)",
    borderCurve: "continuous",
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
    padding: 14,
    shadowColor: "#1C1917",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  malaStatLabel: {
    color: "#78716C",
    fontSize: 12,
    fontWeight: "700",
  },
  malaStatValueRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 5,
    marginTop: 7,
  },
  malaStatValue: { color: "#1C1917", fontSize: 27, fontWeight: "900" },
  malaStatUnit: { color: "#57534E", fontSize: 11, fontWeight: "700" },
  malaStatCount: {
    color: "#A8A29E",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 14,
  },
  goalText: { color: "#78716C", fontSize: 10, fontWeight: "700" },
  goalTrack: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 4,
    height: 5,
    marginHorizontal: 18,
    marginTop: 7,
    overflow: "hidden",
  },
  goalProgress: {
    backgroundColor: "#D97706",
    borderRadius: 4,
    height: "100%",
  },
  tapFieldShell: {
    borderCurve: "continuous",
    borderRadius: 28,
    marginHorizontal: 16,
    marginTop: 14,
    shadowColor: "#12342F",
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
  },
  tapField: {
    alignItems: "center",
    backgroundColor: "#12342F",
    borderColor: "rgba(255,255,255,0.72)",
    borderCurve: "continuous",
    borderRadius: 28,
    borderWidth: 1,
    height: 310,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  tapFieldGlow: {
    alignSelf: "center",
    backgroundColor: "rgba(251,191,36,0.10)",
    borderRadius: 130,
    height: 260,
    position: "absolute",
    top: "16%",
    width: 260,
  },
  tapFieldEdge: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "rgba(255,255,255,0.14)",
    borderCurve: "continuous",
    borderRadius: 28,
    borderWidth: 1,
  },
  liveCount: {
    alignItems: "baseline",
    flexDirection: "row",
    left: 20,
    position: "absolute",
    top: 17,
  },
  liveCountValue: {
    color: "#161515",
    fontSize: 29,
    fontWeight: "900",
  },
  liveCountTarget: {
    color: "rgba(58, 55, 55, 0.9)",
    fontSize: 12,
    fontWeight: "700",
  },
  tapPrompt: { alignItems: "center", paddingHorizontal: 24 },
  handStage: {
    alignItems: "center",
    height: 88,
    justifyContent: "center",
    width: 88,
  },
  handPulse: {
    backgroundColor: "rgba(251,191,36,0.18)",
    borderColor: "rgba(251,191,36,0.38)",
    borderRadius: 44,
    borderWidth: 1,
    height: 88,
    position: "absolute",
    width: 88,
  },
  handCircle: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.3)",
    borderCurve: "continuous",
    borderRadius: 22,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  tapTitle: {
    color: "#161515",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 13,
  },
  tapDescription: {
    color: "rgba(77, 75, 75, 0.7)",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  floatingNaam: {
    backgroundColor: "#D97706",
    borderColor: "rgba(255,255,255,0.64)",
    borderRadius: 999,
    borderWidth: 1,
    bottom: 28,
    maxWidth: "86%",
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 13,
    position: "absolute",
    shadowColor: "#7C2D12",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    zIndex: 4,
  },
  floatingNaamText: { color: "#f6f3f1", fontSize: 17, fontWeight: "900" },
  autoBadge: {
    alignItems: "center",
    backgroundColor: "#ECFDF3",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: "absolute",
    right: 10,
    top: 10,
  },
  autoBadgeText: { color: "#166534", fontSize: 10, fontWeight: "800" },
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
    backgroundColor: "rgba(255,255,255,0.58)",
    borderColor: "rgba(255,255,255,0.9)",
    borderCurve: "continuous",
    borderRadius: 15,
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
  sectionEyebrow: { color: "#C2410C", fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  pageTitle: { color: "#292524", fontSize: 28, fontWeight: "900", marginTop: 5 },
  pageDescription: { color: "#78716C", fontSize: 14, lineHeight: 21, marginTop: 6 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 18 },
  metric: {
    backgroundColor: "rgba(255,255,255,0.56)",
    borderColor: "rgba(255,255,255,0.9)",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    shadowColor: "#1C1917",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    width: "48%",
  },
  metricValue: { color: "#292524", fontSize: 24, fontWeight: "900" },
  metricLabel: { color: "#78716C", fontSize: 12, fontWeight: "700", marginTop: 5 },
  chartSection: {
    backgroundColor: "rgba(255,255,255,0.56)",
    borderColor: "rgba(255,255,255,0.9)",
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 18,
    padding: 18,
    shadowColor: "#1C1917",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  sectionTitle: { color: "#292524", fontSize: 17, fontWeight: "900" },
  chart: { alignItems: "flex-end", flexDirection: "row", gap: 8, height: 180, marginTop: 18 },
  chartColumn: { alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end" },
  chartValue: { color: "#78716C", fontSize: 9, marginBottom: 4 },
  chartTrack: { backgroundColor: "#F2EDE6", borderRadius: 5, flex: 1, justifyContent: "flex-end", overflow: "hidden", width: 18 },
  chartBar: { backgroundColor: "#C2410C", borderRadius: 5, minHeight: 2, width: "100%" },
  chartLabel: { color: "#78716C", fontSize: 11, fontWeight: "700", marginTop: 6 },
  reflectionBand: {
    borderCurve: "continuous",
    borderRadius: 24,
    height: 290,
    marginHorizontal: 18,
    marginTop: 22,
    overflow: "hidden",
    position: "relative",
  },
  reflectionImage: { height: "100%", width: "100%" },
  reflectionOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(28,25,23,0.48)" },
  reflectionCopy: { bottom: 22, left: 20, position: "absolute", right: 20 },
  reflectionTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", lineHeight: 30 },
  reflectionText: { color: "#F5F5F4", fontSize: 14, lineHeight: 21, marginTop: 7 },
  primaryAction: {
    alignItems: "center",
    backgroundColor: "#292524",
    borderCurve: "continuous",
    borderRadius: 16,
    flexDirection: "row",
    gap: 9,
    marginHorizontal: 18,
    marginTop: 18,
    minHeight: 52,
    paddingHorizontal: 16,
    shadowColor: "#1C1917",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  primaryActionText: { color: "#FFFFFF", flex: 1, fontSize: 15, fontWeight: "800" },
  outlineAction: {
    alignItems: "center",
    borderColor: "#E7D7BE",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginHorizontal: 18,
    marginTop: 10,
    minHeight: 50,
  },
  outlineActionText: { color: "#9A3412", fontSize: 14, fontWeight: "800" },
  settingSection: {
    backgroundColor: "rgba(255,255,255,0.56)",
    borderColor: "rgba(255,255,255,0.9)",
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 18,
    marginTop: 22,
    padding: 18,
    shadowColor: "#1C1917",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  settingLabel: { color: "#292524", fontSize: 15, fontWeight: "800" },
  targetControl: { flexDirection: "row", gap: 8, marginTop: 12 },
  targetOption: {
    alignItems: "center",
    backgroundColor: "#F5F5F4",
    borderCurve: "continuous",
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
    backgroundColor: "rgba(255,255,255,0.56)",
    borderColor: "rgba(255,255,255,0.9)",
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 12,
    padding: 18,
    shadowColor: "#1C1917",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  settingIcon: { alignItems: "center", backgroundColor: "#FFF1DF", borderRadius: 12, height: 44, justifyContent: "center", width: 44 },
  settingCopy: { flex: 1, marginLeft: 12 },
  settingTitle: { color: "#292524", fontSize: 15, fontWeight: "800" },
  settingDescription: { color: "#78716C", fontSize: 12, lineHeight: 18, marginTop: 2 },
  dangerAction: {
    alignItems: "center",
    backgroundColor: "#FFF1F0",
    borderCurve: "continuous",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    margin: 18,
    minHeight: 50,
  },
  dangerActionText: { color: "#B42318", fontSize: 14, fontWeight: "800" },
  bottomBar: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderTopColor: "rgba(255,255,255,0.92)",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingTop: 7,
    position: "relative",
  },
  tabIndicator: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    paddingHorizontal: 10,
    position: "absolute",
    top: 7,
  },
  tabIndicatorPill: {
    backgroundColor: "rgba(255,225,183,0.7)",
    borderCurve: "continuous",
    borderRadius: 14,
    height: 34,
    width: "78%",
  },
  tabButton: { alignItems: "center", flex: 1, minHeight: 52 },
  tabIcon: { alignItems: "center", height: 30, justifyContent: "center", width: 40 },
  tabLabel: { color: "#78716C", fontSize: 10, fontWeight: "700", marginTop: 2 },
  activeTabLabel: { color: "#C2410C", fontWeight: "900" },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28, 25, 23, 0.42)",
  },
  sheet: {
    backgroundColor: "rgba(255,252,248,0.86)",
    borderColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderCurve: "continuous",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "82%",
    overflow: "hidden",
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#D6D3D1",
    borderRadius: 2,
    height: 4,
    marginBottom: 18,
    width: 42,
  },
  sheetTitle: { color: "#1C1917", fontSize: 23, fontWeight: "900" },
  sheetDescription: {
    color: "#78716C",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  sheetSettingRow: {
    alignItems: "center",
    borderBottomColor: "#E7E5E4",
    borderBottomWidth: 1,
    flexDirection: "row",
    marginTop: 18,
    paddingBottom: 16,
  },
  sheetSettingIcon: {
    alignItems: "center",
    backgroundColor: "#FFF1DF",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  sheetSettingCopy: { flex: 1, marginLeft: 11 },
  sheetSettingTitle: { color: "#292524", fontSize: 15, fontWeight: "800" },
  sheetSettingText: { color: "#78716C", fontSize: 11, marginTop: 2 },
  intervalSection: { marginTop: 16 },
  intervalLabel: { color: "#57534E", fontSize: 12, fontWeight: "800" },
  intervalOptions: { flexDirection: "row", gap: 8, marginTop: 9 },
  intervalButton: {
    alignItems: "center",
    backgroundColor: "#F5F5F4",
    borderColor: "#E7E5E4",
    borderCurve: "continuous",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  activeIntervalButton: { backgroundColor: "#166534", borderColor: "#166534" },
  intervalButtonText: { color: "#57534E", fontSize: 13, fontWeight: "800" },
  activeIntervalButtonText: { color: "#FFFFFF" },
  targetStepper: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 26,
  },
  stepperButton: {
    alignItems: "center",
    backgroundColor: "#F5F5F4",
    borderColor: "#E7E5E4",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  targetValueCopy: { alignItems: "center", minWidth: 128 },
  targetValue: { color: "#1C1917", fontSize: 46, fontWeight: "900" },
  targetValueLabel: { color: "#78716C", fontSize: 12, fontWeight: "700" },
  targetSummary: {
    color: "#9A3412",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 14,
    textAlign: "center",
  },
  sheetPrimaryButton: {
    alignItems: "center",
    backgroundColor: "#292524",
    borderCurve: "continuous",
    borderRadius: 14,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 52,
  },
  sheetPrimaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  nameInputRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  nameInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D6D3D1",
    borderCurve: "continuous",
    borderRadius: 11,
    borderWidth: 1,
    color: "#292524",
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 13,
  },
  saveNameButton: {
    alignItems: "center",
    backgroundColor: "#C2410C",
    borderCurve: "continuous",
    borderRadius: 11,
    justifyContent: "center",
    minWidth: 68,
    paddingHorizontal: 14,
  },
  saveNameButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nameListScroll: { marginTop: 12, maxHeight: 280 },
  nameList: { gap: 7 },
  nameRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E5E4",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 10,
  },
  nameSelectArea: { alignItems: "center", flex: 1, flexDirection: "row" },
  nameCheck: {
    alignItems: "center",
    borderColor: "#D6D3D1",
    borderRadius: 10,
    borderWidth: 1,
    height: 21,
    justifyContent: "center",
    width: 21,
  },
  activeNameCheck: { backgroundColor: "#C2410C", borderColor: "#C2410C" },
  nameRowText: {
    color: "#292524",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 10,
  },
  nameAction: { alignItems: "center", height: 40, justifyContent: "center", width: 38 },
});