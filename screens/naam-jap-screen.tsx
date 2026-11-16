import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Check,
  ChevronRight,
  Clock3,
  Edit3,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Undo2,
  Volume2,
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

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
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
  getNaamJapMetrics,
  incrementNaamJapData,
  MAX_MALA_GOAL,
  NAAM_PER_MALA,
  undoNaamJapData,
  AUTO_COUNT_OPTIONS,
} from "@/utils/naam-jap-calculations";
import {
  getNaamBreakdown,
  recordNaamCount,
  undoNaamCount,
} from "@/utils/naam-jap-per-name";
import {
  createNaamVoicePlayer,
  deleteNaamVoiceFile,
  ensureNaamVoiceFile,
  hasNaamVoiceFile,
  type NaamVoicePlayer,
} from "@/services/naam-voice";

type NaamJapSheet = "breakdown" | "names" | "target" | null;
type BreakdownPeriod = "today" | "lifetime";
type VoiceStatus = "off" | "preparing" | "ready";
type NaamVoiceFileStatus = "preparing" | "ready" | "failed";
const VOICE_LABEL_SEPARATOR = "\u0001";
type FloatingNaamItem = { id: string; left: number; label: string };

const SAI_IMAGE = require("@/assets/images/saijii.jpg");

// Project palette (constants/experience-theme.ts + existing saffron accents). No green in Naam Jap.
const SAI = {
  background: EXPERIENCE_THEME.background, // #FFF8EC cream
  border: EXPERIENCE_THEME.border, // #F1D9B5
  heading: EXPERIENCE_THEME.heading, // #7C2D12 deep saffron-brown
  paragraph: EXPERIENCE_THEME.paragraph, // #4B4037
  saffron: "#C2410C",
  saffronDeep: "#9A3412",
  marigold: "#F59E0B",
  peach: "#FED7AA",
  cardTint: "#FFF4E8",
  earlier: "#D9C2A3",
  muted: "#8A7461",
} as const;
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
  const [breakdownPeriod, setBreakdownPeriod] = useState<BreakdownPeriod>("today");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("off");
  const voiceUriRef = useRef<string | null>(null);
  // Baba-voice clip per saved Naam: generated as soon as a Naam is added, saved on the phone.
  const [naamVoiceStatus, setNaamVoiceStatus] = useState<Record<string, NaamVoiceFileStatus>>({});
  const [naamVoiceRetryTick, setNaamVoiceRetryTick] = useState(0);
  const failedVoiceLabelsRef = useRef(new Set<string>());
  const voicePlayerRef = useRef<NaamVoicePlayer | null>(null);
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

  useEffect(() => {
    if (!hydrated) return;

    if (data.sessionCount < targetNaamCount) {
      celebratedGoalRef.current = null;
      return;
    }

    if (
      data.sessionCount >= targetNaamCount &&
      celebratedGoalRef.current !== targetNaamCount
    ) {
      celebratedGoalRef.current = targetNaamCount;
      setGoalCelebrationVisible(true);
    }
  }, [data.sessionCount, hydrated, targetNaamCount]);

  const increment = useCallback(() => {
    setData((current) => {
      const counted = incrementNaamJapData(current);
      if (counted === current) return current;
      const countedName =
        current.jaapNames.find((item) => item.id === current.selectedNameId) ||
        current.jaapNames[0];
      const next = countedName
        ? {
            ...counted,
            ...recordNaamCount(current.perName, current.undoStack, countedName),
          }
        : counted;

      if (current.hapticsEnabled) {
        const nextMetrics = getNaamJapMetrics(next);
        const completedTarget =
          next.sessionCount % NAAM_PER_MALA === 0 ||
          next.sessionCount === nextMetrics.sessionGoalCount;
        void (completedTarget
          ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      }

      dataRef.current = next;
      return next;
    });
  }, []);

  // `speak` is only set by the automatic counter. Tap/swipe call countNaam directly (React passes
  // an event object as the first argument, so the flag is never read from the call site).
  const recordCount = useCallback((speak: boolean) => {
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

    if (speak && voiceUriRef.current) {
      // Skips silently if Baba is still speaking the previous count.
      voicePlayerRef.current?.play(voiceUriRef.current);
    }
  }, [increment]);

  /** Tap / swipe: speaks only when the "Sai Baba's Voice" switch is on. */
  const countNaam = useCallback(() => {
    recordCount(dataRef.current.voiceEnabled);
  }, [recordCount]);

  /** Automatic counter: always speaks the Naam (Devesh, 2026-11-16). */
  const autoCountNaam = useCallback(() => {
    recordCount(true);
  }, [recordCount]);

  useEffect(() => {
    if (
      !data.autoCountSeconds ||
      !isAppActive ||
      activeSheet !== null
    ) {
      return;
    }

    const interval = setInterval(autoCountNaam, data.autoCountSeconds * 1000);

    return () => clearInterval(interval);
  }, [
    activeSheet,
    autoCountNaam,
    data.autoCountSeconds,
    isAppActive,
  ]);

  // Every saved Naam gets its Baba-voice clip prepared in the background (once, then offline),
  // so it is ready the moment the devotee turns voice on or starts the automatic counter.
  const namesVoiceKey = data.jaapNames
    .map((item) => item.label)
    .join(VOICE_LABEL_SEPARATOR);
  useEffect(() => {
    if (!hydrated || !namesVoiceKey) return;
    let cancelled = false;
    const labels = namesVoiceKey.split(VOICE_LABEL_SEPARATOR);

    void (async () => {
      // One at a time: gentle on the network and on the per-user daily voice limit.
      for (const label of labels) {
        if (cancelled) return;
        if (failedVoiceLabelsRef.current.has(label)) continue;
        if (await hasNaamVoiceFile(label)) {
          if (!cancelled) {
            setNaamVoiceStatus((current) =>
              current[label] === "ready" ? current : { ...current, [label]: "ready" }
            );
          }
          continue;
        }
        if (cancelled) return;
        setNaamVoiceStatus((current) => ({ ...current, [label]: "preparing" }));
        try {
          await ensureNaamVoiceFile(label);
          if (!cancelled) {
            setNaamVoiceStatus((current) => ({ ...current, [label]: "ready" }));
          }
        } catch {
          failedVoiceLabelsRef.current.add(label);
          if (!cancelled) {
            setNaamVoiceStatus((current) => ({ ...current, [label]: "failed" }));
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, namesVoiceKey, naamVoiceRetryTick]);

  const retryNaamVoice = useCallback((label: string) => {
    failedVoiceLabelsRef.current.delete(label);
    setNaamVoiceStatus((current) => ({ ...current, [label]: "preparing" }));
    setNaamVoiceRetryTick((tick) => tick + 1);
  }, []);

  const forgetNaamVoice = (label: string, remainingLabels: string[]) => {
    if (remainingLabels.includes(label)) return;
    failedVoiceLabelsRef.current.delete(label);
    setNaamVoiceStatus((current) => {
      const next = { ...current };
      delete next[label];
      return next;
    });
    void deleteNaamVoiceFile(label);
  };

  // Sai Baba's voice: prepare the selected Naam's clip (downloaded once, then offline).
  const selectedVoiceLabel = selectedName?.label || "Sai Ram";
  // The clip is needed when the voice switch is on (tap/swipe) or the automatic counter runs.
  const needsVoice = data.voiceEnabled || Boolean(data.autoCountSeconds);
  useEffect(() => {
    if (!hydrated || !needsVoice || !isAppActive) {
      voicePlayerRef.current?.release();
      if (!needsVoice) {
        voiceUriRef.current = null;
        setVoiceStatus("off");
      }
      return;
    }

    let cancelled = false;
    voiceUriRef.current = null;
    setVoiceStatus("preparing");

    void (async () => {
      try {
        const [uri, player] = await Promise.all([
          ensureNaamVoiceFile(selectedVoiceLabel),
          voicePlayerRef.current
            ? Promise.resolve(voicePlayerRef.current)
            : createNaamVoicePlayer(),
        ]);
        if (cancelled) return;
        voicePlayerRef.current = player;
        voiceUriRef.current = uri;
        setVoiceStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setVoiceStatus("off");
        // The automatic counter keeps counting silently; only the tap/swipe voice switch turns off.
        setData((current) => ({ ...current, voiceEnabled: false }));
        Alert.alert(
          "Sai Baba's voice",
          error instanceof Error
            ? error.message
            : "Baba's voice could not be prepared. Please try again."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAppActive, needsVoice, selectedVoiceLabel]);

  useEffect(() => () => voicePlayerRef.current?.release(), []);

  const openBreakdown = (period: BreakdownPeriod) => {
    setBreakdownPeriod(period);
    setActiveSheet("breakdown");
  };

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

    const previousLabel = editingNameId
      ? data.jaapNames.find((item) => item.id === editingNameId)?.label
      : undefined;
    if (previousLabel && previousLabel !== label) {
      forgetNaamVoice(
        previousLabel,
        data.jaapNames
          .filter((item) => item.id !== editingNameId)
          .map((item) => item.label)
      );
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
        onPress: () => {
          forgetNaamVoice(
            name.label,
            data.jaapNames
              .filter((item) => item.id !== name.id)
              .map((item) => item.label)
          );
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
          });
        },
        style: "destructive",
        text: "Delete",
      },
    ]);
  };

  const undoLast = () => {
    setData((current) => {
      const undone = undoNaamJapData(current);
      if (undone === current) return current;
      const next = {
        ...undone,
        ...undoNaamCount(current.perName, current.undoStack),
      };

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
               {/* <View style={styles.headerMessage}>
        <Text style={styles.headerMessageLead}>
          Naam Jaap is your Spiritual Bank Balance.
        </Text>
        <Text style={styles.headerMessageText}>
          Keep Building it Every Day, Encash it in times of Need. Complete One Mala & Unlock Sai Blessings.
        </Text>
      </View> */}
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
                  colors={["rgba(255,255,255,0.62)", "rgba(255,240,219,0.22)"]}
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
              transition={{ delay: 80, duration: 440, type: "timing" }}
            >
              <SetGoalSection
                autoCountSeconds={data.autoCountSeconds}
                onAutoCountChange={(seconds) =>
                  setData((current) => ({ ...current, autoCountSeconds: seconds }))
                }
                onEditGoal={() => setActiveSheet("target")}
                onVoiceChange={(enabled) =>
                  setData((current) => ({ ...current, voiceEnabled: enabled }))
                }
                targetMalas={data.targetMalas}
                voiceEnabled={data.voiceEnabled}
                voiceStatus={voiceStatus}
              />
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
                onPress={() => openBreakdown("today")}
              />
              <MalaStatCard
                count={data.totalCount}
                label="Lifetime Naam Jap"
                malas={metrics.completedLifetimeMalas}
                onPress={() => openBreakdown("lifetime")}
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
                onPress={countNaam}
                style={({ pressed }) => [
                  styles.tapField,
                  pressed && styles.tapFieldPressed,
                ]}
              >
                <LinearGradient
                  colors={["#FFF8EC", "#FFEFD6", "#FDE2C4"]}
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
                    <Clock3 color={SAI.saffronDeep} size={14} />
                    <Text style={styles.autoBadgeText}>
                      Auto every {data.autoCountSeconds}s
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
          label={selectedName?.label || "Sai Ram"}
          onCount={countNaam}
        />
      </BlurView>


      <NaamJapBottomSheet
        activeSheet={activeSheet}
        breakdownPeriod={breakdownPeriod}
        cancelEditName={cancelEditName}
        closeSheet={closeSheet}
        data={data}
        deleteName={deleteName}
        editName={editName}
        editingNameId={editingNameId}
        nameDraft={nameDraft}
        naamVoiceStatus={naamVoiceStatus}
        retryNaamVoice={retryNaamVoice}
        completeNameSelection={completeNameSelection}
        selectedName={selectedName}
        setBreakdownPeriod={setBreakdownPeriod}
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
              colors={["#FFFDF7", "#FFF4E8", "#FFF7E8"]}
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
              <Text style={styles.celebrationButtonText}>Received Blessings</Text>
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
        Tap here, Or Swipe Right/Up Below
      </Text>
      <View style={styles.selectedNaamProgressTrack}>
        <MotiView
          animate={{ width: `${percentage}%` }}
          style={styles.selectedNaamProgressFill}
          transition={{ damping: 18, stiffness: 120, type: "spring" }}
        />
      </View>
      <Text style={styles.selectedNaamProgressText}>
        {sessionCount >= sessionGoalCount
          ? `Goal Complete · ${sessionCount.toLocaleString("en-IN")} Naam And Continuing`
          : `${sessionCount.toLocaleString("en-IN")} / ${sessionGoalCount.toLocaleString("en-IN")} Naam · ${targetMalas.toLocaleString("en-IN")} Mala goal`}
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
  onPress,
}: {
  count: number;
  label: string;
  malas: number;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityHint="Shows how many times you chanted each Naam"
      accessibilityLabel={`${label}: ${count} Naam. Tap to see each Naam`}
      accessibilityRole="button"
      containerStyle={styles.malaStatCardPressable}
      onPress={onPress}
      scaleTo={0.97}
    >
      <BlurView intensity={70} tint="light" style={styles.malaStatCard}>
        <View style={styles.malaStatLabelRow}>
          <Text style={styles.malaStatLabel}>{label}</Text>
          <ChevronRight color="#B45309" size={16} strokeWidth={2.6} />
        </View>
        <View style={styles.malaStatValueRow}>
          <Text style={styles.malaStatValue}>{malas.toLocaleString("en-IN")}</Text>
          <Text style={styles.malaStatUnit}>
            {malas === 1 ? "Mala" : "Malas"}
          </Text>
        </View>
        <Text style={styles.malaStatCount}>
          {count.toLocaleString("en-IN")} Naam
        </Text>
        <Text style={styles.malaStatHint}>Tap to see each Naam</Text>
      </BlurView>
    </PressableScale>
  );
}

function SetGoalSection({
  autoCountSeconds,
  onAutoCountChange,
  onEditGoal,
  onVoiceChange,
  targetMalas,
  voiceEnabled,
  voiceStatus,
}: {
  autoCountSeconds: number | null;
  onAutoCountChange: (seconds: number | null) => void;
  onEditGoal: () => void;
  onVoiceChange: (enabled: boolean) => void;
  targetMalas: number;
  voiceEnabled: boolean;
  voiceStatus: VoiceStatus;
}) {
  const voiceText =
    voiceStatus === "preparing"
      ? "Preparing Baba’s voice…"
      : "Hear the Naam in Sai Baba’s voice on every tap";

  return (
    <BlurView intensity={70} tint="light" style={styles.goalSection}>
      <Text style={styles.goalSectionTitle}>Set your goal</Text>

      <PressableScale
        accessibilityHint="Change your mala goal"
        accessibilityLabel={`Mala goal: ${targetMalas} ${targetMalas === 1 ? "Mala" : "Malas"}`}
        accessibilityRole="button"
        onPress={onEditGoal}
        scaleTo={0.98}
        style={styles.goalSettingRow}
      >
        <View style={styles.sheetSettingIcon}>
          <Target color="#9A3412" size={21} />
        </View>
        <View style={styles.sheetSettingCopy}>
          <Text style={styles.sheetSettingTitle}>
            {targetMalas.toLocaleString("en-IN")} {targetMalas === 1 ? "Mala" : "Malas"}
          </Text>
          <Text style={styles.sheetSettingText}>
            {(targetMalas * NAAM_PER_MALA).toLocaleString("en-IN")} Naam this session
          </Text>
        </View>
        <ChevronRight color="#9A3412" size={20} />
      </PressableScale>

      <View style={styles.goalSettingRow}>
        <View style={styles.sheetSettingIcon}>
          <Clock3 color="#9A3412" size={21} />
        </View>
        <View style={styles.sheetSettingCopy}>
          <Text style={styles.sheetSettingTitle}>Automatic Counter</Text>
          <Text style={styles.sheetSettingText}>
            {autoCountSeconds
              ? `Baba speaks the Naam every ${autoCountSeconds} sec`
              : "Counts and speaks the Naam at your chosen interval"}
          </Text>
        </View>
        <Switch
          accessibilityLabel="Automatic counter"
          onValueChange={(enabled) =>
            onAutoCountChange(enabled ? autoCountSeconds || AUTO_COUNT_OPTIONS[0] : null)
          }
          ios_backgroundColor={SAI.border}
          thumbColor="#FFFFFF"
          trackColor={{ false: SAI.border, true: SAI.saffron }}
          value={Boolean(autoCountSeconds)}
        />
      </View>
      {autoCountSeconds ? (
        <View style={styles.goalIntervalOptions}>
          {AUTO_COUNT_OPTIONS.map((seconds) => {
            const active = autoCountSeconds === seconds;
            return (
              <PressableScale
                accessibilityLabel={`Count every ${seconds} seconds`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                containerStyle={styles.intervalButtonContainer}
                key={seconds}
                onPress={() => onAutoCountChange(seconds)}
                scaleTo={0.94}
                style={[styles.intervalButton, active && styles.activeIntervalButton]}
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
      ) : null}

      <View style={[styles.goalSettingRow, styles.goalSettingRowLast]}>
        <View style={styles.sheetSettingIcon}>
          <Volume2 color="#9A3412" size={21} />
        </View>
        <View style={styles.sheetSettingCopy}>
          <Text style={styles.sheetSettingTitle}>Sai Baba’s Voice</Text>
          <Text style={styles.sheetSettingText}>{voiceText}</Text>
        </View>
        {voiceStatus === "preparing" ? (
          <ActivityIndicator color="#9A3412" style={styles.goalVoiceSpinner} />
        ) : null}
        <Switch
          accessibilityLabel="Sai Baba's voice"
          onValueChange={onVoiceChange}
          ios_backgroundColor={SAI.border}
          thumbColor="#FFFFFF"
          trackColor={{ false: SAI.border, true: SAI.saffron }}
          value={voiceEnabled}
        />
      </View>
    </BlurView>
  );
}

function NaamBreakdown({
  data,
  period,
  setPeriod,
}: {
  data: NaamJapData;
  period: BreakdownPeriod;
  setPeriod: (period: BreakdownPeriod) => void;
}) {
  const rows = getNaamBreakdown(data, period, NAAM_PER_MALA);
  const max = Math.max(1, ...rows.map((row) => row.count));
  const total = period === "today" ? data.todayCount : data.totalCount;
  const totalMalas = Math.floor(total / NAAM_PER_MALA);

  return (
    <View style={styles.breakdownPanel}>
      <Text style={styles.breakdownTitle}>Your Naam Jap</Text>
      <Text style={styles.breakdownSubtitle}>
        How many times you chanted each Naam
      </Text>

      <View style={styles.breakdownTabs}>
        {(["today", "lifetime"] as const).map((tab) => {
          const active = tab === period;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={tab}
              onPress={() => setPeriod(tab)}
              style={[styles.breakdownTab, active && styles.breakdownTabActive]}
            >
              <Text
                style={[
                  styles.breakdownTabText,
                  active && styles.breakdownTabTextActive,
                ]}
              >
                {tab === "today" ? "Today" : "Lifetime"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.breakdownSummary}>
        <View style={styles.breakdownSummaryItem}>
          <Text style={styles.breakdownSummaryValue}>
            {total.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.breakdownSummaryLabel}>Naam</Text>
        </View>
        <View style={styles.breakdownSummaryDivider} />
        <View style={styles.breakdownSummaryItem}>
          <Text style={styles.breakdownSummaryValue}>
            {totalMalas.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.breakdownSummaryLabel}>
            {totalMalas === 1 ? "Mala" : "Malas"}
          </Text>
        </View>
      </View>

      {rows.length ? (
        <ScrollView
          contentContainerStyle={styles.breakdownListContent}
          showsVerticalScrollIndicator={false}
          style={styles.breakdownList}
        >
          {rows.map((row, index) => {
            const percent = total > 0 ? Math.round((row.count / total) * 100) : 0;
            return (
              <View
                accessibilityLabel={`${row.label}: ${row.count} times, ${percent} percent`}
                key={row.id}
                style={styles.breakdownRow}
              >
                <View style={styles.breakdownRowHeader}>
                  <View
                    style={[
                      styles.breakdownRank,
                      row.earlier && styles.breakdownRankEarlier,
                    ]}
                  >
                    <Text
                      style={[
                        styles.breakdownRankText,
                        row.earlier && styles.breakdownRankTextEarlier,
                      ]}
                    >
                      {row.earlier ? "•" : index + 1}
                    </Text>
                  </View>
                  <View style={styles.breakdownLabelBlock}>
                    <Text numberOfLines={1} style={styles.breakdownLabel}>
                      {row.label}
                    </Text>
                    <Text style={styles.breakdownMeta}>
                      {row.earlier
                        ? "Chanted before Naam-wise counting"
                        : row.removed
                          ? "Removed from your list"
                          : `${row.malas.toLocaleString("en-IN")} ${row.malas === 1 ? "Mala" : "Malas"}`}
                    </Text>
                  </View>
                  <View style={styles.breakdownCountBlock}>
                    <Text style={styles.breakdownCount}>
                      {row.count.toLocaleString("en-IN")}
                    </Text>
                    <Text style={styles.breakdownPercent}>{percent}%</Text>
                  </View>
                </View>
                <View style={styles.breakdownTrack}>
                  {row.earlier ? (
                    <View
                      style={[
                        styles.breakdownBar,
                        styles.breakdownBarEarlier,
                        { width: `${Math.max(4, (row.count / max) * 100)}%` },
                      ]}
                    />
                  ) : (
                    <LinearGradient
                      colors={[SAI.marigold, SAI.saffron]}
                      end={{ x: 1, y: 0 }}
                      start={{ x: 0, y: 0 }}
                      style={[
                        styles.breakdownBar,
                        { width: `${Math.max(4, (row.count / max) * 100)}%` },
                      ]}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.breakdownEmptyCard}>
          <Sparkles color={SAI.saffron} size={26} />
          <Text style={styles.breakdownEmpty}>
            {period === "today"
              ? "No Naam chanted yet today.\nTap or swipe to begin 🙏"
              : "Your Naam Jap will appear here as you chant 🙏"}
          </Text>
        </View>
      )}
    </View>
  );
}

function NaamJapBottomSheet({
  activeSheet,
  breakdownPeriod,
  cancelEditName,
  closeSheet,
  completeNameSelection,
  data,
  deleteName,
  editName,
  editingNameId,
  nameDraft,
  naamVoiceStatus,
  retryNaamVoice,
  selectedName,
  setBreakdownPeriod,
  setData,
  setNameDraft,
}: {
  activeSheet: NaamJapSheet;
  breakdownPeriod: BreakdownPeriod;
  cancelEditName: () => void;
  closeSheet: () => void;
  completeNameSelection: () => void;
  data: NaamJapData;
  deleteName: (name: NaamJapName) => void;
  editName: (name: NaamJapName) => void;
  editingNameId: string | null;
  nameDraft: string;
  naamVoiceStatus: Record<string, NaamVoiceFileStatus>;
  retryNaamVoice: (label: string) => void;
  selectedName?: NaamJapName;
  setBreakdownPeriod: (period: BreakdownPeriod) => void;
  setData: React.Dispatch<React.SetStateAction<NaamJapData>>;
  setNameDraft: React.Dispatch<React.SetStateAction<string>>;
}) {
  const insets = useSafeAreaInsets();

  const stepTargetMalas = useCallback(
    (step: number) => {
      setData((current) => {
        return {
          ...current,
          targetMalas: Math.min(
            MAX_MALA_GOAL,
            Math.max(1, current.targetMalas + step)
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
            styles.sheetSolid,
            { paddingBottom: Math.max(insets.bottom + 12, 28) },
          ]}
        >
          <View style={styles.sheetHandle} />

          {activeSheet === "breakdown" ? (
            <NaamBreakdown
              data={data}
              period={breakdownPeriod}
              setPeriod={setBreakdownPeriod}
            />
          ) : null}

          {activeSheet === "target" ? (
            <>
              <Text style={styles.sheetTitle}>Set your Mala Goal</Text>
              <Text style={styles.sheetDescription}>
                One Mala Contains {NAAM_PER_MALA} Naam. Choose a Comfortable Goal For This Session.
              </Text>
              <View style={styles.targetStepper}>
                <PressableScale
                  accessibilityLabel="Reduce mala goal"
                  disabled={data.targetMalas <= 1}
                  onPress={() => stepTargetMalas(-1)}
                  scaleTo={0.88}
                  style={[
                    styles.stepperButton,
                    data.targetMalas <= 1 && styles.disabled,
                  ]}
                >
                  <Minus color={SAI.saffronDeep} size={25} />
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
                  <Plus color={SAI.saffronDeep} size={25} />
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
                <Text style={styles.sheetPrimaryButtonText}>Save Goal</Text>
              </PressableScale>
            </>
          ) : null}

          {activeSheet === "names" ? (
            <>
              <Text style={styles.sheetTitle}>Choose your Naam</Text>
              <Text style={styles.sheetDescription}>
                Select, Add, Rename, or Remove The Naam Used for Your Jaap.
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
                  placeholderTextColor={SAI.muted}
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
                      style={[
                        styles.nameRow,
                        selected && styles.selectedNameRow,
                        editing && styles.editingNameRow,
                      ]}
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
                      <NaamVoiceBadge
                        label={name.label}
                        onRetry={retryNaamVoice}
                        status={naamVoiceStatus[name.label]}
                      />
                      <PressableScale
                        accessibilityLabel={`Edit ${name.label}`}
                        hitSlop={6}
                        onPress={() => editName(name)}
                        scaleTo={0.85}
                        style={styles.nameAction}
                      >
                        <Pencil color={SAI.saffronDeep} size={18} />
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
                  {nameDraft.trim() ? "Save and Use This Naam" : "Done"}
                </Text>
              </PressableScale>
            </>
          ) : null}
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function NaamVoiceBadge({
  label,
  onRetry,
  status,
}: {
  label: string;
  onRetry: (label: string) => void;
  status?: NaamVoiceFileStatus;
}) {
  if (status === "preparing") {
    return (
      <View
        accessibilityLabel={`Preparing Sai Baba's voice for ${label}`}
        style={styles.nameVoiceBadge}
      >
        <ActivityIndicator color={SAI.saffron} size="small" />
      </View>
    );
  }

  if (status === "failed") {
    return (
      <PressableScale
        accessibilityHint="Tries again to prepare Sai Baba's voice for this Naam"
        accessibilityLabel={`Voice not ready for ${label}. Retry`}
        accessibilityRole="button"
        hitSlop={6}
        onPress={() => onRetry(label)}
        scaleTo={0.85}
        style={styles.nameVoiceBadge}
      >
        <RotateCcw color={SAI.saffronDeep} size={17} />
      </PressableScale>
    );
  }

  if (status === "ready") {
    return (
      <View
        accessibilityLabel={`Sai Baba's voice ready for ${label}`}
        style={styles.nameVoiceBadge}
      >
        <Volume2 color={SAI.saffron} size={18} />
      </View>
    );
  }

  return <View style={styles.nameVoiceBadge} />;
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
  screen: { backgroundColor: "#FFF8EC", flex: 1 },
  loadingScreen: {
    alignItems: "center",
    backgroundColor: "#FFF8EC",
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderBottomColor: "rgba(241,217,181,0.9)",
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
    borderColor: "rgba(241,217,181,0.92)",
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
    color: "#B45309",
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
  malaStatCardPressable: { flex: 1 },
  malaStatLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  malaStatHint: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
  },
  goalSection: {
    backgroundColor: "#FFF8F0",
    borderColor: "#FED7AA",
    borderCurve: "continuous",
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 14,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  goalSectionTitle: { color: "#1C1917", fontSize: 18, fontWeight: "900" },
  goalSettingRow: {
    alignItems: "center",
    borderBottomColor: "#F1E4D3",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 12,
  },
  goalSettingRowLast: { borderBottomWidth: 0 },
  goalIntervalOptions: { flexDirection: "row", gap: 8, paddingVertical: 10 },
  goalVoiceSpinner: { marginRight: 8 },
  breakdownPanel: { marginTop: 4 },
  breakdownTitle: { color: SAI.heading, fontSize: 24, fontWeight: "900" },
  breakdownSubtitle: {
    color: SAI.paragraph,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  breakdownTabs: {
    backgroundColor: SAI.cardTint,
    borderColor: SAI.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 16,
    padding: 4,
  },
  breakdownTab: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 10,
  },
  breakdownTabActive: { backgroundColor: SAI.saffron },
  breakdownTabText: { color: SAI.saffronDeep, fontSize: 15, fontWeight: "800" },
  breakdownTabTextActive: { color: "#FFFFFF" },
  breakdownSummary: {
    alignItems: "center",
    backgroundColor: SAI.background,
    borderColor: SAI.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    paddingVertical: 14,
  },
  breakdownSummaryItem: { alignItems: "center", flex: 1 },
  breakdownSummaryValue: { color: SAI.heading, fontSize: 26, fontWeight: "900" },
  breakdownSummaryLabel: {
    color: SAI.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase",
  },
  breakdownSummaryDivider: { backgroundColor: SAI.border, height: 36, width: 1 },
  breakdownList: { marginTop: 12, maxHeight: 380 },
  breakdownListContent: { gap: 10, paddingBottom: 6 },
  breakdownRow: {
    backgroundColor: "#FFFFFF",
    borderColor: SAI.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  breakdownRowHeader: { alignItems: "center", flexDirection: "row" },
  breakdownRank: {
    alignItems: "center",
    backgroundColor: SAI.cardTint,
    borderColor: SAI.peach,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  breakdownRankEarlier: { backgroundColor: SAI.background, borderColor: SAI.border },
  breakdownRankText: { color: SAI.saffronDeep, fontSize: 14, fontWeight: "900" },
  breakdownRankTextEarlier: { color: SAI.muted },
  breakdownLabelBlock: { flex: 1, marginHorizontal: 12 },
  breakdownLabel: { color: SAI.heading, fontSize: 17, fontWeight: "900" },
  breakdownMeta: {
    color: SAI.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  breakdownCountBlock: { alignItems: "flex-end" },
  breakdownCount: { color: SAI.saffron, fontSize: 20, fontWeight: "900" },
  breakdownPercent: {
    color: SAI.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 1,
  },
  breakdownTrack: {
    backgroundColor: SAI.background,
    borderColor: SAI.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 14,
    marginTop: 12,
    overflow: "hidden",
  },
  breakdownBar: { borderRadius: 8, height: "100%" },
  breakdownBarEarlier: { backgroundColor: SAI.earlier },
  breakdownEmptyCard: {
    alignItems: "center",
    backgroundColor: SAI.background,
    borderColor: SAI.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 28,
  },
  breakdownEmpty: {
    color: SAI.paragraph,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
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
  goalCompleteText: { color: "#9A3412", fontWeight: "900" },
  goalTrack: {
    backgroundColor: "rgba(241,217,181,0.72)",
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
    shadowColor: "#7C2D12",
    shadowOffset: { height: 9, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  tapField: {
    alignItems: "center",
    backgroundColor: "#FFEFD6",
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
    shadowColor: "#7C2D12",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    zIndex: 4,
  },
  floatingNaamText: { color: "#f6f3f1", fontSize: 17, fontWeight: "900" },
  autoBadge: {
    alignItems: "center",
    backgroundColor: SAI.cardTint,
    borderColor: SAI.peach,
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: "absolute",
    right: 10,
    top: 10,
  },
  autoBadgeText: { color: SAI.saffronDeep, fontSize: 10, fontWeight: "800" },
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
    backgroundColor: "#C2410C",
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
    backgroundColor: "rgba(255,248,236,0.94)",
    borderTopColor: "rgba(241,217,181,0.92)",
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
  sheetSolid: { backgroundColor: SAI.background },
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
    backgroundColor: SAI.border,
    borderRadius: 2,
    height: 4,
    marginBottom: 18,
    width: 42,
  },
  sheetTitle: { color: SAI.heading, fontSize: 23, fontWeight: "900" },
  sheetDescription: {
    color: SAI.paragraph,
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
    backgroundColor: SAI.cardTint,
    borderColor: SAI.peach,
    borderCurve: "continuous",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  activeIntervalButton: { backgroundColor: SAI.saffron, borderColor: SAI.saffron },
  intervalButtonText: { color: SAI.saffronDeep, fontSize: 13, fontWeight: "800" },
  activeIntervalButtonText: { color: "#FFFFFF" },
  targetStepper: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 26,
  },
  stepperButton: {
    alignItems: "center",
    backgroundColor: SAI.cardTint,
    borderColor: SAI.peach,
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  targetValueCopy: { alignItems: "center", minWidth: 128 },
  targetValue: { color: SAI.heading, fontSize: 46, fontWeight: "900" },
  targetValueLabel: { color: SAI.muted, fontSize: 12, fontWeight: "700" },
  targetSummary: {
    color: "#9A3412",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 14,
    textAlign: "center",
  },
  sheetPrimaryButton: {
    alignItems: "center",
    backgroundColor: SAI.saffron,
    borderCurve: "continuous",
    borderRadius: 14,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 52,
  },
  sheetPrimaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  editingBanner: {
    alignItems: "center",
    backgroundColor: SAI.cardTint,
    borderColor: SAI.peach,
    borderWidth: 1,
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
    backgroundColor: "#FFFFFF",
    borderColor: SAI.border,
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    color: SAI.heading,
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 13,
  },
  saveNameButton: {
    alignItems: "center",
    backgroundColor: "#C2410C",
    borderCurve: "continuous",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    shadowColor: "#7C2D12",
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
    borderColor: SAI.border,
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 10,
  },
  editingNameRow: { borderColor: SAI.marigold, borderWidth: 1.5 },
  selectedNameRow: { backgroundColor: SAI.cardTint, borderColor: SAI.saffron, borderWidth: 1.5 },
  nameSelectArea: { alignItems: "center", flex: 1, flexDirection: "row" },
  nameSelectContainer: { flex: 1 },
  nameCheck: {
    alignItems: "center",
    borderColor: SAI.peach,
    borderRadius: 10,
    borderWidth: 1.5,
    height: 21,
    justifyContent: "center",
    width: 21,
  },
  activeNameCheck: { backgroundColor: "#C2410C", borderColor: "#C2410C" },
  nameRowText: {
    color: SAI.heading,
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 10,
  },
  nameAction: { alignItems: "center", height: 40, justifyContent: "center", width: 38 },
  nameVoiceBadge: { alignItems: "center", height: 40, justifyContent: "center", width: 32 },
});
