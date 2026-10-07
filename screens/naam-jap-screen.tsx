import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Check,
  Clock3,
  Edit3,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, {
  useCallback,
  useEffect,
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
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PillarGlassDock } from "@/components/CustomTabBar";
import { NaamJapSkiaBackground } from "@/components/naam-jap/NaamJapSkiaBackground";
import { PressableScale } from "@/components/naam-jap/PressableScale";
import { SwipeNaamCounter } from "@/components/naam-jap/SwipeNaamCounter";
import {
  createDefaultNaamJapData,
  getLocalDateKey,
  loadNaamJapData,
  type NaamJapData,
  type NaamJapName,
  normalizeForToday,
  saveNaamJapData,
} from "@/services/naam-jap-storage";
import {
  getMinimumMalaGoal,
  getNaamJapMetrics,
  incrementNaamJapData,
  MAX_MALA_GOAL,
  NAAM_PER_MALA,
  undoNaamJapData,
} from "@/utils/naam-jap-calculations";

type NaamJapSheet = "more" | "names" | "target" | null;
type FloatingNaamItem = { id: string; left: number; label: string };

const SAI_IMAGE = require("@/assets/images/saijii.jpg");
export default function NaamJapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<NaamJapData>(createDefaultNaamJapData);
  const [hydrated, setHydrated] = useState(false);
  const [activeSheet, setActiveSheet] = useState<NaamJapSheet>(null);
  const [floatingNaams, setFloatingNaams] = useState<FloatingNaamItem[]>([]);
  const [nameDraft, setNameDraft] = useState("");
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [goalCelebrationVisible, setGoalCelebrationVisible] = useState(false);
  const [isAppActive, setIsAppActive] = useState(
    AppState.currentState === "active"
  );
  const dataRef = useRef(data);
  const hydratedRef = useRef(false);
  const celebratedGoalRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    void loadNaamJapData().then((stored) => {
      if (mounted) {
        const storedGoal = getNaamJapMetrics(stored).sessionGoalCount;
        dataRef.current = stored;
        hydratedRef.current = true;
        celebratedGoalRef.current =
          stored.sessionCount >= storedGoal ? storedGoal : null;
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
      setIsAppActive(nextState === "active");

      if (nextState === "active" && hydratedRef.current) {
        setData((current) => normalizeForToday(current));
      } else if (nextState !== "active" && hydratedRef.current) {
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

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const interval = setInterval(() => {
      setData((current) =>
        current.date === getLocalDateKey() ? current : normalizeForToday(current)
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [hydrated]);

  const metrics = getNaamJapMetrics(data);
  const selectedName =
    data.jaapNames.find((item) => item.id === data.selectedNameId) ||
    data.jaapNames[0];
  const targetNaamCount = metrics.sessionGoalCount;
  const targetProgress = metrics.sessionProgress;
  const goalReached = metrics.goalReached;

  useEffect(() => {
    if (!hydrated) return;

    if (data.sessionCount < targetNaamCount) {
      celebratedGoalRef.current = null;
      return;
    }

    if (
      data.sessionCount === targetNaamCount &&
      celebratedGoalRef.current !== targetNaamCount
    ) {
      celebratedGoalRef.current = targetNaamCount;
      setGoalCelebrationVisible(true);
    }
  }, [data.sessionCount, hydrated, targetNaamCount]);

  const increment = useCallback(() => {
    setData((current) => {
      const next = incrementNaamJapData(current);
      if (next === current) return current;

      if (current.hapticsEnabled) {
        const completedTarget =
          next.sessionCount % NAAM_PER_MALA === 0 ||
          getNaamJapMetrics(next).goalReached;
        void (completedTarget
          ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      }

      dataRef.current = next;
      return next;
    });
  }, []);

  const countNaam = useCallback(() => {
    if (
      dataRef.current.sessionCount >=
      getNaamJapMetrics(dataRef.current).sessionGoalCount
    ) {
      return;
    }

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
    if (
      !data.autoCountSeconds ||
      !isAppActive ||
      activeSheet !== null ||
      goalReached
    ) {
      return;
    }

    const interval = setInterval(countNaam, data.autoCountSeconds * 1000);

    return () => clearInterval(interval);
  }, [
    activeSheet,
    countNaam,
    data.autoCountSeconds,
    goalReached,
    isAppActive,
  ]);

  const closeSheet = () => {
    setActiveSheet(null);
    setEditingNameId(null);
    setNameDraft("");
  };

  const saveName = () => {
    const label = nameDraft.trim();

    if (!label) {
      return true;
    }

    const duplicate = data.jaapNames.some(
      (item) =>
        item.id !== editingNameId &&
        item.label.localeCompare(label, undefined, { sensitivity: "accent" }) ===
          0
    );

    if (duplicate) {
      Alert.alert(
        "Naam already saved",
        "Choose it from the list or enter another Naam."
      );
      return false;
    }

    if (!editingNameId && data.jaapNames.length >= 30) {
      Alert.alert("Naam list is full", "You can keep up to 30 saved Naam.");
      return false;
    }

    setData((current) => {
      if (editingNameId) {
        return {
          ...current,
          jaapNames: current.jaapNames.map((item) =>
            item.id === editingNameId ? { ...item, label } : item
          ),
          selectedNameId: editingNameId,
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
    return true;
  };

  const completeNameSelection = () => {
    if (saveName()) {
      closeSheet();
    }
  };

  const editName = (name: NaamJapName) => {
    setEditingNameId(name.id);
    setNameDraft(name.label);
  };

  const cancelEditName = () => {
    setEditingNameId(null);
    setNameDraft("");
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
      const next = undoNaamJapData(current);
      if (next === current) return current;

      void Haptics.selectionAsync();
      dataRef.current = next;
      return next;
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
            setData((current) => {
              const next = { ...current, sessionCount: 0 };
              dataRef.current = next;
              return next;
            }),
          style: "destructive",
          text: "Reset session",
        },
      ]
    );
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
        {/* <PressableScale
          accessibilityLabel="Close Naam Jap"
          accessibilityRole="button"
          hitSlop={6}
          onPress={goBack}
          style={styles.headerButton}
        >
          <ArrowLeft color="#292524" size={24} />
        </PressableScale> */}
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
        contentContainerStyle={[styles.content, styles.homeContent]}
        showsVerticalScrollIndicator={false}
        style={styles.pageScroll}
      >
        <>
            <MotiView
              animate={{ opacity: 1, translateY: 0 }}
              from={{ opacity: 0, translateY: 12 }}
              transition={{ delay: 30, duration: 420, type: "timing" }}
            >
               <View style={styles.headerMessage}>
        <Text style={styles.headerMessageLead}>
          Naam Jaap is your Spiritual Bank Balance.
        </Text>
        <Text style={styles.headerMessageText}>
          Keep Building it Every Day, Encash it in times of Need. Complete One Mala & Unlock Sai Blessings.
        </Text>
      </View>
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
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.4}
                    numberOfLines={1}
                    style={styles.naamTitle}
                  >
                    {selectedName?.label || "Sai Ram"}
                  </Text>
                  <Text style={styles.naamHint}>Tap to Choose or Create a Naam</Text>
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
                label="Today’s Naam Jap"
                malas={metrics.completedTodayMalas}
              />
              <MalaStatCard
                count={data.totalCount}
                label="Lifetime Naam Jap"
                malas={metrics.completedLifetimeMalas}
              />
             
            </MotiView>

            

            <MotiView
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              from={{ opacity: 0, scale: 0.975, translateY: 18 }}
              style={styles.tapFieldShell}
              transition={{ delay: 210, duration: 480, type: "timing" }}
            >
              <Pressable
                accessibilityHint="Tap the selected Naam to count once"
                accessibilityLabel={`Tap to count ${selectedName?.label || "Sai Ram"}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: goalReached }}
                disabled={goalReached}
                onPress={countNaam}
                style={({ pressed }) => [
                  styles.tapField,
                  pressed && !goalReached && styles.tapFieldPressed,
                  goalReached && styles.tapFieldDisabled,
                ]}
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
                <LiveCounter round={metrics.currentMalaCount} />
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
                <SelectedNaamFocus
                  label={selectedName?.label || "Sai Ram"}
                  progress={targetProgress}
                  sessionCount={data.sessionCount}
                  sessionGoalCount={targetNaamCount}
                  targetMalas={data.targetMalas}
                />
                {data.autoCountSeconds ? (
                  <View style={styles.autoBadge}>
                    <Clock3 color="#166534" size={14} />
                    <Text style={styles.autoBadgeText}>
                      {goalReached
                        ? "Auto paused at goal"
                        : `Auto every ${data.autoCountSeconds}s`}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </MotiView>

            <View style={styles.secondaryActions}>
              <SmallAction disabled={data.sessionCount === 0} Icon={Undo2} label="Undo" onPress={undoLast} />
              <SmallAction disabled={data.sessionCount === 0} Icon={RotateCcw} label="Reset" onPress={resetSession} />
            </View>
        </>
      </ScrollView>

      <BlurView
        intensity={88}
        style={[
          styles.fixedSwipeDock,
          { bottom: 74 + Math.max(insets.bottom, 8) },
        ]}
        tint="light"
      >
        <SwipeNaamCounter
          disabled={goalReached}
          label={selectedName?.label || "Sai Ram"}
          onCount={countNaam}
        />
      </BlurView>

      <View
        style={[
          styles.bottomDock,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        <PillarGlassDock
          activeRouteName="naam-jap"
          onNavigate={(routeName) => {
            const destinations: Record<string, string> = {
              directory: "/(tabs)/directory",
              events: "/(tabs)/events",
              experiences: "/(tabs)/experiences",
            };
            const destination = destinations[routeName];

            if (destination) {
              router.replace(destination as never);
            }
          }}
        />
      </View>

      <NaamJapBottomSheet
        activeSheet={activeSheet}
        cancelEditName={cancelEditName}
        closeSheet={closeSheet}
        data={data}
        deleteName={deleteName}
        editName={editName}
        editingNameId={editingNameId}
        nameDraft={nameDraft}
        completeNameSelection={completeNameSelection}
        selectedName={selectedName}
        setData={setData}
        setNameDraft={setNameDraft}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setGoalCelebrationVisible(false)}
        transparent
        visible={goalCelebrationVisible}
      >
        <View style={styles.celebrationBackdrop}>
          <MotiView
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            from={{ opacity: 0, scale: 0.92, translateY: 24 }}
            style={styles.celebrationCard}
            transition={{ damping: 16, stiffness: 150, type: "spring" }}
          >
            <LinearGradient
              colors={["#FFFDF7", "#F4F8F5", "#FFF7E8"]}
              style={StyleSheet.absoluteFill}
            />
            <MotiView
              animate={{ opacity: [0.45, 1, 0.45], scale: [0.92, 1.08, 0.92] }}
              style={styles.celebrationSparkle}
              transition={{ duration: 1800, loop: true, type: "timing" }}
            >
              <Sparkles color="#C07A2A" size={28} />
            </MotiView>
            <Image
              resizeMode="contain"
              source={SAI_IMAGE}
              style={styles.celebrationImage}
            />
            <Text style={styles.celebrationEyebrow}>
              {targetNaamCount.toLocaleString("en-IN")} NAAM COMPLETED
            </Text>
            <Text style={styles.celebrationTitle}>Sai’s blessings are with you</Text>
            <Text style={styles.celebrationMessage}>
              My child, you have remembered Me {targetNaamCount.toLocaleString("en-IN")} times.{"\n"}
              May My blessings always be with you.{"\n"}
              Keep My Naam in your heart, and walk with faith.
            </Text>
            <PressableScale
              onPress={() => setGoalCelebrationVisible(false)}
              scaleTo={0.97}
              style={styles.celebrationButton}
            >
              <Text style={styles.celebrationButtonText}>Receive blessings</Text>
            </PressableScale>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
}

function LiveCounter({ round }: { round: number }) {
  return (
    <MotiView
      key={round}
      animate={{ opacity: 1, scale: 1 }}
      from={{ opacity: 0.6, scale: 1.18 }}
      style={styles.liveCount}
      transition={{ damping: 12, stiffness: 220, type: "spring" }}
    >
      <Text style={styles.liveCountValue}>{round}</Text>
      <Text style={styles.liveCountTarget}> / {NAAM_PER_MALA}</Text>
    </MotiView>
  );
}

function SelectedNaamFocus({
  label,
  progress,
  sessionCount,
  sessionGoalCount,
  targetMalas,
}: {
  label: string;
  progress: number;
  sessionCount: number;
  sessionGoalCount: number;
  targetMalas: number;
}) {
  const percentage = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <View pointerEvents="none" style={styles.selectedNaamFocus}>
      <MotiView
        animate={{ opacity: [0.88, 1, 0.88], scale: [0.985, 1, 0.985] }}
        from={{ opacity: 0, scale: 0.94 }}
        key={label}
        style={styles.selectedNaamTextWrap}
        transition={{ duration: 2600, loop: true, type: "timing" }}
      >
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.16}
          numberOfLines={1}
          style={styles.selectedNaamText}
        >
          {label}
        </Text>
      </MotiView>

      <Text style={styles.selectedNaamInstruction}>
        Tap here, or swipe right/up below
      </Text>
      <View style={styles.selectedNaamProgressTrack}>
        <MotiView
          animate={{ width: `${percentage}%` }}
          style={styles.selectedNaamProgressFill}
          transition={{ damping: 18, stiffness: 120, type: "spring" }}
        />
      </View>
      <Text style={styles.selectedNaamProgressText}>
        {sessionCount.toLocaleString("en-IN")} / {sessionGoalCount.toLocaleString("en-IN")} Naam · {targetMalas.toLocaleString("en-IN")} Mala goal
      </Text>
    </View>
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
        <Text style={styles.malaStatUnit}>
          {malas === 1 ? "Mala" : "Malas"}
        </Text>
      </View>
      <Text style={styles.malaStatCount}>
        {count.toLocaleString("en-IN")} Naam
      </Text>
    </BlurView>
  );
}

function NaamJapBottomSheet({
  activeSheet,
  cancelEditName,
  closeSheet,
  completeNameSelection,
  data,
  deleteName,
  editName,
  editingNameId,
  nameDraft,
  selectedName,
  setData,
  setNameDraft,
}: {
  activeSheet: NaamJapSheet;
  cancelEditName: () => void;
  closeSheet: () => void;
  completeNameSelection: () => void;
  data: NaamJapData;
  deleteName: (name: NaamJapName) => void;
  editName: (name: NaamJapName) => void;
  editingNameId: string | null;
  nameDraft: string;
  selectedName?: NaamJapName;
  setData: React.Dispatch<React.SetStateAction<NaamJapData>>;
  setNameDraft: React.Dispatch<React.SetStateAction<string>>;
}) {
  const insets = useSafeAreaInsets();

  const stepTargetMalas = useCallback(
    (step: number) => {
      setData((current) => {
        const minimumGoal = getMinimumMalaGoal(current.sessionCount);

        return {
          ...current,
          targetMalas: Math.min(
            MAX_MALA_GOAL,
            Math.max(minimumGoal, current.targetMalas + step)
          ),
        };
      });
    },
    [setData]
  );

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
          containerStyle={StyleSheet.absoluteFill}
          onPress={closeSheet}
          scaleTo={1}
          style={styles.modalBackdrop}
        />
        <BlurView
          intensity={92}
          tint="light"
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom + 12, 28) },
          ]}
        >
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
                          containerStyle={styles.intervalButtonContainer}
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
              <Text style={styles.sheetTitle}>Set your Mala Goal</Text>
              <Text style={styles.sheetDescription}>
                One Mala contains {NAAM_PER_MALA} Naam. Choose a comfortable Goal for this session.
              </Text>
              <View style={styles.targetStepper}>
                <PressableScale
                  accessibilityLabel="Reduce mala goal"
                  disabled={data.targetMalas <= getMinimumMalaGoal(data.sessionCount)}
                  onPress={() => stepTargetMalas(-1)}
                  scaleTo={0.88}
                  style={[
                    styles.stepperButton,
                    data.targetMalas <= getMinimumMalaGoal(data.sessionCount) && styles.disabled,
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
                  <Text style={styles.targetValueLabel}>Malas</Text>
                </View>
                <PressableScale
                  accessibilityLabel="Increase mala goal"
                  disabled={data.targetMalas >= MAX_MALA_GOAL}
                  onPress={() => stepTargetMalas(1)}
                  scaleTo={0.88}
                  style={[
                    styles.stepperButton,
                    data.targetMalas >= MAX_MALA_GOAL && styles.disabled,
                  ]}
                >
                  <Plus color="#292524" size={25} />
                </PressableScale>
              </View>
              <Text style={styles.targetSummary}>
                {(data.targetMalas * NAAM_PER_MALA).toLocaleString("en-IN")} Total Naam
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
              {editingNameId ? (
                <View style={styles.editingBanner}>
                  <Text style={styles.editingBannerText}>Editing Naam</Text>
                  <PressableScale
                    accessibilityLabel="Cancel editing"
                    accessibilityRole="button"
                    hitSlop={6}
                    onPress={cancelEditName}
                    scaleTo={0.9}
                  >
                    <Text style={styles.editingBannerCancel}>Cancel</Text>
                  </PressableScale>
                </View>
              ) : null}
              <View style={styles.nameInputRow}>
                <TextInput
                  accessibilityLabel="Naam"
                  maxLength={40}
                  onChangeText={setNameDraft}
                  onSubmitEditing={completeNameSelection}
                  placeholder="Add a Naam"
                  placeholderTextColor="#A8A29E"
                  returnKeyType="done"
                  style={styles.nameInput}
                  value={nameDraft}
                />
              </View>
              <ScrollView
                contentContainerStyle={styles.nameList}
                keyboardShouldPersistTaps="handled"
                style={styles.nameListScroll}
              >
                {data.jaapNames.map((name) => {
                  const selected = selectedName?.id === name.id;
                  const editing = editingNameId === name.id;
                  return (
                    <View
                      key={name.id}
                      style={[styles.nameRow, editing && styles.editingNameRow]}
                    >
                      <PressableScale
                        containerStyle={styles.nameSelectContainer}
                        onPress={() => {
                          setData((current) => ({
                            ...current,
                            selectedNameId: name.id,
                          }));
                          cancelEditName();
                        }}
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
                onPress={completeNameSelection}
                scaleTo={0.97}
                style={styles.sheetPrimaryButton}
              >
                <Text style={styles.sheetPrimaryButtonText}>
                  {nameDraft.trim() ? "Save and use this Naam" : "Done"}
                </Text>
              </PressableScale>
            </>
          ) : null}
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
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
      <Icon color="#9A3412" size={17} />
      <Text style={styles.smallActionText}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8FAF8", flex: 1 },
  loadingScreen: {
    alignItems: "center",
    backgroundColor: "#F8FAF8",
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderBottomColor: "rgba(220,225,222,0.9)",
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
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "rgba(216,222,218,0.92)",
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
  headerMessage: {
    backgroundColor: "#FFF4E8",
    borderBottomColor: "#FED7AA",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  headerMessageLead: {
    color: "#9A3412",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 21,
    textAlign: "center",
  },
  headerMessageText: {
    color: "#A65B35",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 3,
    textAlign: "center",
  },
  pageScroll: { flex: 1 },
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
  homeContent: { paddingBottom: 220 },
  naamHeading: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
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
    shadowOpacity: 0.045,
    shadowRadius: 14,
  },
  naamHeadingCopy: { flex: 1 },
  naamEyebrow: {
    color: "#9A3412",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  naamTitle: {
    color: "#9A3412",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 41,
    marginTop: 3,
    paddingTop: 10,
  },
  naamHint: {
    color: "#A65B35",
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
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderCurve: "continuous",
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
    padding: 14,
    shadowColor: "#1C1917",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  malaStatLabel: {
    color: "#9A3412",
    fontSize: 13,
    fontWeight: "700",
  },
  malaStatValueRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 5,
    marginTop: 7,
  },
  malaStatValue: { color: "#9A3412", fontSize: 27, fontWeight: "900" },
  malaStatUnit: { color: "#A65B35", fontSize: 11, fontWeight: "700" },
  malaStatCount: {
    color: "#B96A40",
    fontSize: 11,
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
  goalCompleteText: { color: "#47705E", fontWeight: "900" },
  goalTrack: {
    backgroundColor: "rgba(215,222,218,0.72)",
    borderRadius: 4,
    height: 5,
    marginHorizontal: 18,
    marginTop: 7,
    overflow: "hidden",
  },
  goalProgress: {
    backgroundColor: "#668375",
    borderRadius: 4,
    height: "100%",
  },
  tapFieldShell: {
    borderCurve: "continuous",
    borderRadius: 28,
    marginHorizontal: 16,
    marginTop: 14,
    shadowColor: "#29463D",
    shadowOffset: { height: 9, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  tapField: {
    alignItems: "center",
    backgroundColor: "#12342F",
    borderColor: "rgba(255,255,255,0.72)",
    borderCurve: "continuous",
    borderRadius: 28,
    borderWidth: 1,
    height: 410,
    justifyContent: "space-between",
    overflow: "hidden",
    paddingBottom: 16,
    paddingTop: 42,
    position: "relative",
    width: "100%",
  },
  tapFieldPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  tapFieldDisabled: { opacity: 0.82 },
  tapFieldGlow: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
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
  selectedNaamFocus: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingHorizontal: 14,
    width: "100%",
  },
  selectedNaamTextWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 230,
    width: "100%",
  },
  selectedNaamText: {
    color: "#7C2D12",
    fontSize: 82,
    fontWeight: "900",
    lineHeight: 90,
    textAlign: "center",
  },
  selectedNaamInstruction: {
    color: "#7C5540",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  selectedNaamProgressTrack: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 999,
    height: 6,
    marginTop: 14,
    overflow: "hidden",
    width: 176,
  },
  selectedNaamProgressFill: {
    backgroundColor: "#9A3412",
    borderRadius: 999,
    height: "100%",
  },
  selectedNaamProgressText: {
    color: "#8B6753",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 7,
    textAlign: "center",
  },
  floatingNaam: {
    backgroundColor: "#536F63",
    borderColor: "rgba(255,255,255,0.64)",
    borderRadius: 999,
    borderWidth: 1,
    bottom: 26,
    maxWidth: "86%",
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 13,
    position: "absolute",
    shadowColor: "#29463D",
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
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderCurve: "continuous",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  smallActionText: { color: "#9A3412", fontSize: 13, fontWeight: "700" },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  celebrationBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(28,25,23,0.58)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  celebrationCard: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.92)",
    borderCurve: "continuous",
    borderRadius: 28,
    borderWidth: 1,
    maxWidth: 420,
    overflow: "hidden",
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    shadowColor: "#1C1917",
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    width: "100%",
  },
  celebrationSparkle: { position: "absolute", right: 22, top: 20, zIndex: 2 },
  celebrationImage: { height: 260, width: 150 },
  celebrationEyebrow: {
    color: "#9A5A18",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  celebrationTitle: {
    color: "#292524",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 7,
    textAlign: "center",
  },
  celebrationMessage: {
    color: "#57534E",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center",
  },
  celebrationButton: {
    alignItems: "center",
    backgroundColor: "#557568",
    borderCurve: "continuous",
    borderRadius: 15,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 50,
    width: "100%",
  },
  celebrationButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  bottomDock: {
    alignItems: "center",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 20,
  },
  fixedSwipeDock: {
    backgroundColor: "rgba(248,250,248,0.94)",
    borderTopColor: "rgba(215,224,218,0.92)",
    borderTopWidth: StyleSheet.hairlineWidth,
    left: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "absolute",
    right: 0,
    shadowColor: "#1C3029",
    shadowOffset: { height: -5, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    zIndex: 12,
  },
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
    fontWeight: "800",
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
  intervalButtonContainer: { flex: 1 },
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
  editingBanner: {
    alignItems: "center",
    backgroundColor: "#FFF1DF",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  editingBannerText: { color: "#9A3412", fontSize: 12, fontWeight: "800" },
  editingBannerCancel: { color: "#9A3412", fontSize: 12, fontWeight: "900" },
  nameInputRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  nameInput: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "#D5DDD8",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    color: "#292524",
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 13,
  },
  saveNameButton: {
    alignItems: "center",
    backgroundColor: "#557568",
    borderCurve: "continuous",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    shadowColor: "#29463D",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    width: 48,
  },
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
  editingNameRow: { borderColor: "#D97706", borderWidth: 1.5 },
  nameSelectArea: { alignItems: "center", flex: 1, flexDirection: "row" },
  nameSelectContainer: { flex: 1 },
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
