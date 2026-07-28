/**
 * Sai Family — Onboarding (retention redesign)
 * ────────────────────────────────────────────────────────────
 * 2 slides:
 *   1. Welcome         → emotional hook, single "Begin" CTA, no skip
 *   2. Four pillars    → explains how the Sai family comes together
 *
 * onDone accepts optional pillar ids for future onboarding analytics.
 * ────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { requireOptionalNativeModule } from "expo-modules-core";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  HeartHandshake,
  Users,
} from "lucide-react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/* ─── Theme ──────────────────────────────────────────────── */
const C = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  ink: "#1C1917",
  inkSecondary: "#57534E",
  inkTertiary: "#A8A29E",
  separator: "#EFEAE0",
  saffron: "#C2410C",
  saffronText: "#9A3412",
  saffronBg: "#FFF7ED",
  saffronBorder: "#FED7AA",
  maroon: "#2B1308",
};

const WELCOME_MESSAGE_AUDIO =
  require("../assets/images/welcome-message.mp3");

/* ─── Four product pillars ───────────────────────────────── */
type PillarId =
  | "experiences"
  | "events"
  | "sangha"
  | "directory";

type Pillar = {
  id: PillarId;
  title: string;
  description: string;
  Icon: React.ComponentType<{
    color?: string;
    size?: number;
    strokeWidth?: number;
  }>;
};

const PILLARS: Pillar[] = [
  {
    id: "experiences",
    title: "Experiences",
    description: "Share prayers, miracles, teachings, and moments of faith.",
    Icon: BookOpen,
  },
  {
    id: "events",
    title: "Events",
    description: "Discover bhajans, satsangs, seva, and sacred gatherings.",
    Icon: CalendarDays,
  },
  {
    id: "directory",
    title: "Sai Connect",
    description: "Find trusted services and businesses from fellow devotees.",
    Icon: Building2,
  },
  {
    id: "sangha",
    title: "Local community",
    description: "Build meaningful bonds, join groups, and grow together.",
    Icon: Users,
  },
];

type OnboardingScreenProps = {
  onDone: (pillars?: PillarId[]) => void;
};

/* ═══════════════════════════════════════════════════════════
   SLIDE 1 — Welcome (emotional hook)
   ═══════════════════════════════════════════════════════════ */
function WelcomeSlide({
  height,
  image,
  index,
  progress,
  width,
}: {
  height: number;
  image: ImageSourcePropType;
  index: number;
  progress: SharedValue<number>;
  width: number;
}) {
  const imageHeight = Math.min(height * 0.74, width * 1.56);
  const imageWidth = Math.min(width * 0.94, imageHeight * 0.76);

  const animatedStyle = useAnimatedStyle(() => {
    const distance = progress.value - index;
    return {
      opacity: interpolate(distance, [-1, 0, 1], [0.2, 1, 0.2], Extrapolation.CLAMP),
      transform: [
        {
          translateX: interpolate(
            distance,
            [-1, 0, 1],
            [width * 0.15, 0, -width * 0.15],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(distance, [-1, 0, 1], [0.96, 1, 0.96], Extrapolation.CLAMP),
        },
      ],
    };
  });

  useEffect(() => {
    let player:
      | {
          pause: () => void;
          remove?: () => void;
          seekTo?: (seconds: number) => Promise<void> | void;
          play: () => void;
        }
      | null = null;
    let isMounted = true;

    const playWelcomeMessage = async () => {
      try {
        const nativeAudioModule =
          requireOptionalNativeModule("ExpoAudio");

        if (!nativeAudioModule) {
          console.warn(
            "[OnboardingAudio] ExpoAudio native module is unavailable. Rebuild the app to enable onboarding audio."
          );
          return;
        }

        const { createAudioPlayer } = await import("expo-audio");

        if (typeof createAudioPlayer !== "function") {
          console.warn(
            "[OnboardingAudio] createAudioPlayer is unavailable in this build."
          );
          return;
        }

        if (!isMounted) {
          return;
        }

        player = createAudioPlayer(WELCOME_MESSAGE_AUDIO);
        await player.seekTo?.(0);
        player.play();
      } catch (error) {
        console.warn(
          "[OnboardingAudio] Welcome message playback failed",
          error
        );
      }
    };

    void playWelcomeMessage();

    return () => {
      isMounted = false;
      player?.pause();
      player?.remove?.();
    };
  }, []);

  return (
    <Animated.View
      style={[styles.slide, styles.welcomeSlide, { width }, animatedStyle]}
    >
      <View style={styles.onboardingSplashBody}>
        <View style={styles.onboardingBgOuter} />
        <View style={styles.onboardingBgMid} />
        <View style={styles.onboardingBgInner} />

        <View
          style={[
            styles.onboardingImageWrapper,
            {
              height: imageHeight + 30,
              width: imageWidth + 30,
            },
          ]}
        >
          <View
            style={[
              styles.onboardingGlowRing,
              {
                height: imageHeight + 26,
                width: imageWidth + 26,
              },
            ]}
          />
          <View
            style={[
              styles.onboardingImageHalo,
              {
                height: imageHeight + 12,
                width: imageWidth + 12,
              },
            ]}
          />
          <Image
            resizeMode="contain"
            source={image}
            style={[
              styles.onboardingSaiImage,
              {
                height: imageHeight,
                width: imageWidth,
              },
            ]}
          />
        </View>

        <View style={styles.onboardingTitleCard}>
          <Text style={styles.onboardingSplashSubtitle}>Om Sai Ram</Text>
          <Text style={styles.onboardingSplashTitle}>Sai Ki Family</Text>
          <Text style={styles.onboardingWelcomeLine}>
            Welcome Home. The Global Family of Sai Devotees.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 2 — Four pillars
   ═══════════════════════════════════════════════════════════ */
function PillarsSlide({
  index,
  progress,
  width,
}: {
  index: number;
  progress: SharedValue<number>;
  width: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = progress.value - index;
    return {
      opacity: interpolate(distance, [-1, 0, 1], [0.2, 1, 0.2], Extrapolation.CLAMP),
      transform: [
        {
          translateX: interpolate(
            distance,
            [-1, 0, 1],
            [width * 0.15, 0, -width * 0.15],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.slide, { width }, animatedStyle]}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.pillarsBody}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pillarsIntro}>
          <Text style={styles.pillarsTitle}>
            Welcome to Sai Ki Family 🙏
          </Text>
          <Text style={styles.pillarsMessage}>
            More than an app—this is a global family of Sai devotees. Every
            feature you see here is built around a simple purpose: to help you
            deepen your connection with Sai Baba, serve others, and grow
            together as one community.
          </Text>
          <Text style={styles.pillarsLead}>
            These are the pillars that bring our family together:
          </Text>
        </View>

        <View style={styles.pillarList}>
          {PILLARS.map((pillar, pillarIndex) => {
            const Icon = pillar.Icon;
            return (
              <View key={pillar.id} style={styles.pillarCard}>
                <View style={styles.pillarNumber}>
                  <Text style={styles.pillarNumberText}>
                    {pillarIndex + 1}
                  </Text>
                </View>
                <View style={styles.pillarIcon}>
                  <Icon
                    color="#FFFFFF"
                    size={21}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.pillarCopy}>
                  <Text style={styles.pillarTitle}>
                    {pillar.title}
                  </Text>
                  <Text style={styles.pillarDescription}>
                    {pillar.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════ */
export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { height, width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useSharedValue(0);

  const image2 = require("../assets/images/saijii.jpg");
  const allPillars = PILLARS.map((pillar) => pillar.id);

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === 1;

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.value * width }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${((progress.value + 1) / 2) * 100}%`,
  }));

  const moveTo = (index: number) => {
    setActiveIndex(index);
    progress.value = withTiming(index, { duration: 420 });
  };

  const handleBack = () => {
    if (!isFirst) moveTo(activeIndex - 1);
  };

  const handleNext = () => {
    if (isLast) {
      onDone(allPillars);
      return;
    }
    moveTo(activeIndex + 1);
  };

  const primaryLabel = isFirst ? "Begin" : "Get Started";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[C.bg, C.saffronBg, C.bg]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Header (contextual) ── */}
      <View style={styles.header}>
        {isFirst ? (
          <>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <HeartHandshake color={C.saffron} size={16} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.brandEyebrow}>Welcome to</Text>
                <Text style={styles.brand}>Sai Family</Text>
              </View>
            </View>
            <Text style={styles.stepCount}>{activeIndex + 1} / 2</Text>
          </>
        ) : (
          <>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <HeartHandshake color={C.saffron} size={16} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.brandEyebrow}>Welcome to</Text>
                <Text style={styles.brand}>Sai Family</Text>
              </View>
            </View>
            <Text style={styles.stepCount}>{activeIndex + 1} / 2</Text>
          </>
        )}
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
      </View>

      {/* ── Slider ── */}
      <Animated.View
        style={[styles.slider, { width: width * 2 }, sliderStyle]}
      >
        <WelcomeSlide
          height={height}
          image={image2}
          index={0}
          progress={progress}
          width={width}
        />
        <PillarsSlide
          index={1}
          progress={progress}
          width={width}
        />
      </Animated.View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {!isFirst ? (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <ArrowLeft color={C.ink} size={18} strokeWidth={2.2} />
            </Pressable>
          ) : null}

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryText}>
              {primaryLabel}
            </Text>
            <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  container: { backgroundColor: C.bg, flex: 1, overflow: "hidden" },

  /* Header */
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 58,
    zIndex: 2,
  },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  brandMark: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 10,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  brandEyebrow: {
    color: C.inkSecondary,
    fontSize: 10.5,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  brand: { color: C.ink, fontSize: 15, fontWeight: "700" },
  headerBrand: {
    color: C.inkSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  headerRight: { alignItems: "center", flexDirection: "row", gap: 14 },
  stepCount: { color: C.inkTertiary, fontSize: 12, fontWeight: "500" },

  /* Progress bar */
  progressWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    zIndex: 2,
  },
  progressTrack: {
    backgroundColor: C.separator,
    borderRadius: 100,
    height: 3,
    overflow: "hidden",
  },
  progressBar: {
    backgroundColor: C.saffron,
    borderRadius: 100,
    height: "100%",
  },

  /* Slider */
  slider: { flex: 1, flexDirection: "row" },
  slide: { justifyContent: "flex-start", paddingHorizontal: 22, paddingTop: 12 },

  /* Slide 1 */
  welcomeSlide: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  onboardingSplashBody: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "flex-start",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingTop: 2,
  },
  onboardingBgOuter: {
    backgroundColor: "#F7DD89",
    borderRadius: 420,
    height: 520,
    left: -120,
    position: "absolute",
    top: -250,
    width: 520,
  },
  onboardingBgMid: {
    backgroundColor: "#FACD51",
    borderRadius: 240,
    bottom: -120,
    height: 360,
    left: -40,
    position: "absolute",
    width: 360,
  },
  onboardingBgInner: {
    backgroundColor: "#FFF3CF",
    borderRadius: 180,
    height: 300,
    position: "absolute",
    width: 300,
  },
  onboardingSplashBrand: {
    color: "#8A5A13",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 14,
  },
  onboardingSplashOm: {
    color: "#BD7A12",
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 8,
  },
  onboardingSplashTitle: {
    color: "#5D3B0A",
    fontFamily: "Georgia",
    fontSize: 31,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 37,
    textAlign: "center",
  },
  onboardingSplashSubtitle: {
    color: "#E39611",
    fontSize: 13.5,
    fontWeight: "800",
    letterSpacing: 2.6,
    marginBottom: 5,
    textAlign: "center",
    textTransform: "uppercase",
  },
  onboardingWelcomeLine: {
    color: "#6F4A12",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 6,
    textAlign: "center",
  },
  onboardingTitleCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 253, 247, 0.92)",
    borderColor: "rgba(227, 179, 79, 0.42)",
    borderRadius: 24,
    borderWidth: 1,
    marginTop: -8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#A16207",
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    width: "94%",
  },
  onboardingImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },
  onboardingGlowRing: {
    borderColor: "#E3B34F",
    borderRadius: 44,
    borderWidth: 1,
    position: "absolute",
    shadowColor: "#D59A25",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  onboardingImageHalo: {
    backgroundColor: "#FFFDF7",
    borderRadius: 38,
    position: "absolute",
  },
  onboardingSaiImage: {
    borderColor: "#F0C865",
    borderRadius: 32,
    borderWidth: 3,
  },
  onboardingDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  onboardingDividerLine: {
    backgroundColor: "#D8AD55",
    height: 1,
    width: 44,
  },
  onboardingDividerOm: {
    color: "#9A6A1A",
    fontSize: 15,
    fontWeight: "700",
  },
  onboardingBlessing: {
    color: "#6F4A12",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 2.5,
    marginTop: 14,
  },
  /* Slide 2 */
  pillarsBody: {
    paddingBottom: 10,
    paddingTop: 4,
  },
  pillarsIntro: {
    marginBottom: 14,
  },
  pillarsTitle: {
    color: C.maroon,
    fontFamily: "Georgia",
    fontSize: 23,
    fontWeight: "700",
    lineHeight: 31,
  },
  pillarsMessage: {
    color: C.inkSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 10,
  },
  pillarsLead: {
    color: C.saffronText,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 12,
  },
  pillarList: {
    gap: 10,
  },
  pillarCard: {
    alignItems: "center",
    backgroundColor: C.surface,
    borderColor: C.saffronBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 78,
    paddingHorizontal: 12,
    paddingVertical: 11,
    position: "relative",
  },
  pillarNumber: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 12,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    marginRight: 10,
    width: 30,
  },
  pillarNumberText: {
    color: C.saffronText,
    fontSize: 14,
    fontWeight: "900",
  },
  pillarIcon: {
    alignItems: "center",
    backgroundColor: C.saffron,
    borderRadius: 13,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44,
  },
  pillarCopy: {
    flex: 1,
    minWidth: 0,
  },
  pillarTitle: {
    color: C.saffronText,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 21,
  },
  pillarDescription: {
    color: C.inkSecondary,
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 3,
  },
  /* Footer */
  footer: {
    borderTopColor: C.separator,
    borderTopWidth: 1,
    paddingBottom: 30,
    paddingHorizontal: 18,
    paddingTop: 14,
    zIndex: 2,
  },
  buttonRow: { flexDirection: "row", gap: 10 },
  backButton: {
    alignItems: "center",
    backgroundColor: C.surface,
    borderColor: C.separator,
    borderRadius: 14,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 56,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: C.maroon,
    borderRadius: 14,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 54,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
});
