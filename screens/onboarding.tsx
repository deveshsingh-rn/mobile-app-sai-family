/**
 * Sai Family — Onboarding (retention redesign)
 * ────────────────────────────────────────────────────────────
 * 2 slides:
 *   1. Welcome         → emotional hook, single "Begin" CTA, no skip
 *   2. Personalize     → shows the core app pillars already included
 *
 * onDone accepts optional interests[] so the parent can persist
 * selections for feed ranking / notification prefs.
 * ────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
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
  HandHeart,
  HeartHandshake,
  Star,
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

/* ─── Interests (drive personalization) ──────────────────── */
type InterestId =
  | "blessings"
  | "events"
  | "sangha"
  | "teachings"
  | "seva"
  | "directory";

type Interest = {
  id: InterestId;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{
    color?: string;
    size?: number;
    strokeWidth?: number;
  }>;
};

const INTERESTS: Interest[] = [
  { id: "blessings", title: "Daily blessings", subtitle: "Prayers & darshan", Icon: Star },
  { id: "events", title: "Sacred events", subtitle: "Bhajans & satsangs", Icon: CalendarDays },
  { id: "sangha", title: "Community", subtitle: "Devotee bonds", Icon: Users },
  { id: "teachings", title: "Baba's wisdom", subtitle: "Teachings & quotes", Icon: BookOpen },
  { id: "seva", title: "Seva & service", subtitle: "Give back", Icon: HandHeart },
  { id: "directory", title: "Devotee services", subtitle: "Trusted businesses", Icon: Building2 },
];

type OnboardingScreenProps = {
  /** Called on completion. Receives selected interests (may be empty). */
  onDone: (interests?: InterestId[]) => void;
};

/* ═══════════════════════════════════════════════════════════
   SLIDE 1 — Welcome (emotional hook)
   ═══════════════════════════════════════════════════════════ */
function WelcomeSlide({
  image,
  index,
  progress,
  width,
}: {
  image: ImageSourcePropType;
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

        {/* <Text style={styles.onboardingSplashBrand}>SAI FAMILY</Text>
        <Text style={styles.onboardingSplashOm}>ॐ</Text> */}
        <Text style={styles.onboardingSplashTitle}>SAI FAMILY</Text>
        <Text style={styles.onboardingSplashSubtitle}>Om Sai Ram</Text>

        <View
          style={[
            styles.onboardingImageWrapper,
            {
              height: width * 1.2 * 0.9625 + 28,
              width: width * .84 + 28,
            },
          ]}
        >
          <View
            style={[
              styles.onboardingGlowRing,
              {
                height: width * 1.2 * 0.9625 + 26,
                width: width * 0.84 + 26,
              },
            ]}
          />
          <View
            style={[
              styles.onboardingImageHalo,
              {
                height: width * 1.2 * 0.9625 + 12,
                width: width * 0.74 + 12,
              },
            ]}
          />
          <Image
            resizeMode="stretch"
            source={image}
            style={[
              styles.onboardingSaiImage,
              {
                height: width * 1.2 * 0.9625,
                width: width * 0.74,
              },
            ]}
          />
        </View>

       
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 2 — Personalize (retention lever)
   ═══════════════════════════════════════════════════════════ */
function PersonalizeSlide({
  image,
  index,
  progress,
  width,
}: {
  image: ImageSourcePropType;
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
      <View style={styles.personalizeBody}>
        <View style={styles.personalizeHeader}>
          <View style={styles.smallImageRing}>
            <View style={styles.smallImageWell}>
              <Image resizeMode="stretch" source={image} style={styles.smallImage} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.slideEyebrow}>PERSONALIZE</Text>
            <Text style={styles.slideTitle}>How can we serve{"\n"}your journey?</Text>
          </View>
        </View>

        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>INCLUDED FOR YOU</Text>
          <View style={[styles.counterChip, styles.counterChipActive]}>
            <Text style={[styles.counterChipText, styles.counterChipTextActive]}>
              6 pillars ready
            </Text>
          </View>
        </View>

        <View style={styles.interestGrid}>
          {INTERESTS.map((interest) => {
            const Icon = interest.Icon;
            return (
              <View
                key={interest.id}
                style={[
                  styles.interestCard,
                  styles.interestCardSelected,
                ]}
              >
                <View style={[styles.interestIcon, styles.interestIconActive]}>
                  <Icon
                    color="#FFFFFF"
                    size={22}
                    strokeWidth={2}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={2}
                    style={[styles.interestTitle, styles.interestTitleActive]}
                  >
                    {interest.title}
                  </Text>
                  <Text numberOfLines={2} style={styles.interestSubtitle}>
                    {interest.subtitle}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════ */
export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useSharedValue(0);

  const image = require("../assets/images/saijii.jpg");
  const image2 = require("../assets/images/saijii.jpg");
  const allInterests = INTERESTS.map((interest) => interest.id);

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
      onDone(allInterests);
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
            <Text style={styles.headerBrand}>SAI FAMILY</Text>
            <View style={styles.headerRight}>
              <Text style={styles.stepCount}>{activeIndex + 1} / 2</Text>
            </View>
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
        <WelcomeSlide image={image2} index={0} progress={progress} width={width} />
        <PersonalizeSlide
          image={image}
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
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 18,
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
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  onboardingSplashSubtitle: {
    color: "#E39611",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 3,
    marginBottom: 24,
    textTransform: "uppercase",
  },
  onboardingImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  onboardingGlowRing: {
    borderColor: "#E3B34F",
    borderRadius: 40,
    borderWidth: 1,
    position: "absolute",
    shadowColor: "#D59A25",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  onboardingImageHalo: {
    backgroundColor: "#FFFDF7",
    borderRadius: 34,
    position: "absolute",
  },
  onboardingSaiImage: {
    borderColor: "#F0C865",
    borderRadius: 28,
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
  personalizeBody: {
    flex: 1,
    paddingTop: 2,
  },
  personalizeHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingBottom: 12,
  },
  smallImageRing: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 100,
    borderWidth: 1.5,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  smallImageWell: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    height: 46,
    justifyContent: "center",
    overflow: "hidden",
    width: 46,
  },
  smallImage: { height: 44, width: 44 },
  slideEyebrow: {
    color: C.saffronText,
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  slideTitle: {
    color: C.ink,
    fontFamily: "Georgia",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 29,
    marginTop: 2,
  },
  counterRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  counterLabel: {
    color: C.inkSecondary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  counterChip: {
    borderColor: C.separator,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  counterChipActive: {
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
  },
  counterChipText: { color: C.inkTertiary, fontSize: 11, fontWeight: "600" },
  counterChipTextActive: { color: C.saffronText },
  interestGrid: {
    flex: 1,
    gap: 9,
    paddingBottom: 2,
  },
  interestCard: {
    alignItems: "center",
    backgroundColor: C.surface,
    borderColor: C.separator,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 14,
    minHeight: 67,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "relative",
  },
  interestCardSelected: { backgroundColor: C.saffronBg, borderColor: C.saffron },
  interestIcon: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderRadius: 13,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  interestIconActive: {
    backgroundColor: C.saffron,
  },
  interestTitle: {
    color: C.ink,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.1,
    lineHeight: 21,
  },
  interestTitleActive: {
    color: C.saffronText,
  },
  interestSubtitle: {
    color: C.inkSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2,
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
