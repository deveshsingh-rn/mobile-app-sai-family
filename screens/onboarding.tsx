/**
 * Sai Family — Onboarding (retention redesign)
 * ────────────────────────────────────────────────────────────
 * 3 slides, not 4:
 *   1. Welcome         → emotional hook, single "Begin" CTA, no skip
 *   2. Personalize     → interactive multi-select, the retention lever
 *   3. Ready           → payoff — shows the user their curated experience
 *
 * onDone accepts optional interests[] so the parent can persist
 * selections for feed ranking / notification prefs.
 * ────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  HandHeart,
  HeartHandshake,
  Sparkles,
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
  green: "#15803D",
};

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

  return (
    <Animated.View
      style={[styles.slide, styles.welcomeSlide, { width }, animatedStyle]}
    >
      <ImageBackground
        imageStyle={styles.welcomeBackgroundImage}
        resizeMode='stretch'
        source={image}
        style={styles.welcomeBackground}
      >
        <LinearGradient
          colors={[
            "rgba(28, 18, 6, 0.12)",
            "rgba(40, 22, 7, 0.34)",
            "rgba(30, 16, 5, 0.86)",
          ]}
          locations={[0, 0.5, 1]}
          style={styles.welcomeOverlay}
        >
          <View style={styles.welcomeTopBrand}>
            <View style={styles.welcomeKicker}>
              <Sparkles color="#FFE7A3" size={12} strokeWidth={2.4} />
              <Text style={styles.kickerText}>OM SAI RAM</Text>
            </View>
            {/* <Text style={styles.welcomeBrandName}>Sai Ki Family</Text> */}
          </View>

          <View style={styles.welcomeBody}>
            <View/>
           
            <View  />
            <View>
             <Text style={styles.welcomeTitle}>Sai Ki Family</Text>
            <Text style={styles.welcomeSubtitle}>
              Welcome Home.{"\n"}
              The Global Family of Sai Devotees
            </Text>
            </View>
             <View  />
          </View>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 2 — Personalize (retention lever)
   ═══════════════════════════════════════════════════════════ */
function PersonalizeSlide({
  image,
  index,
  onToggle,
  progress,
  selected,
  width,
}: {
  image: ImageSourcePropType;
  index: number;
  onToggle: (id: InterestId) => void;
  progress: SharedValue<number>;
  selected: InterestId[];
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
              <Image resizeMode="contain" source={image} style={styles.smallImage} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.slideEyebrow}>PERSONALIZE</Text>
            <Text style={styles.slideTitle}>How can we serve{"\n"}your journey?</Text>
          </View>
        </View>

        <Text style={styles.slideText}>
          Pick what matters to you. We'll shape your feed, notifications, and
          events around it.
        </Text>

        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>CHOOSE ANY</Text>
          <View
            style={[
              styles.counterChip,
              selected.length > 0 && styles.counterChipActive,
            ]}
          >
            <Text
              style={[
                styles.counterChipText,
                selected.length > 0 && styles.counterChipTextActive,
              ]}
            >
              {selected.length} selected
            </Text>
          </View>
        </View>

        <View style={styles.interestGrid}>
          {INTERESTS.map((interest) => {
            const isSel = selected.includes(interest.id);
            const Icon = interest.Icon;
            return (
              <Pressable
                key={interest.id}
                onPress={() => onToggle(interest.id)}
                style={({ pressed }) => [
                  styles.interestCard,
                  isSel && styles.interestCardSelected,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View
                  style={[
                    styles.interestIcon,
                    isSel && { backgroundColor: C.saffron },
                  ]}
                >
                  <Icon
                    color={isSel ? "#FFFFFF" : C.saffron}
                    size={17}
                    strokeWidth={2}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.interestTitle,
                      isSel && { color: C.saffronText },
                    ]}
                  >
                    {interest.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.interestSubtitle}>
                    {interest.subtitle}
                  </Text>
                </View>
                {isSel ? (
                  <View style={styles.interestCheck}>
                    <Check color="#FFFFFF" size={11} strokeWidth={2.5} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 3 — Ready (payoff)
   ═══════════════════════════════════════════════════════════ */
function ReadySlide({
  image,
  index,
  progress,
  selected,
  width,
}: {
  image: ImageSourcePropType;
  index: number;
  progress: SharedValue<number>;
  selected: InterestId[];
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

  const selectedItems = INTERESTS.filter((i) => selected.includes(i.id));
  const preview = selectedItems.slice(0, 3);
  const extraCount = selectedItems.length - preview.length;

  return (
    <Animated.View style={[styles.slide, { width }, animatedStyle]}>
      <View style={styles.readyBody}>
        <View style={styles.readyImageStack}>
          <View style={styles.readyImageRing}>
            <View style={styles.readyImageWell}>
              <Image resizeMode="contain" source={image} style={styles.readyImage} />
            </View>
          </View>
          <View style={styles.readyCheckBadge}>
            <Check color="#FFFFFF" size={16} strokeWidth={2.5} />
          </View>
        </View>

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={styles.readyEyebrow}>READY TO BEGIN</Text>
          <Text style={styles.readyTitle}>Your Sai Family{"\n"}is ready</Text>
        </View>

        {selectedItems.length > 0 ? (
          <>
            <Text style={styles.previewLabel}>
              YOUR PERSONALIZED EXPERIENCE
            </Text>
            {preview.map((item) => {
              const Icon = item.Icon;
              return (
                <View key={item.id} style={styles.previewCard}>
                  <View style={styles.previewIcon}>
                    <Icon color={C.saffron} size={15} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewTitle}>{item.title}</Text>
                    <Text style={styles.previewSubtitle}>
                      Curated for you daily
                    </Text>
                  </View>
                  <CheckCircle2 color={C.green} size={16} strokeWidth={2.2} />
                </View>
              );
            })}
            {extraCount > 0 ? (
              <Text style={styles.extraCount}>+ {extraCount} more</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.readyFallback}>
            Create your account to unlock daily blessings, sacred events, and
            your devotee community.
          </Text>
        )}
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
  const [selected, setSelected] = useState<InterestId[]>([]);
  const progress = useSharedValue(0);

  const image = require("../assets/images/saibaba1.png");
  const image2 = require("../assets/images/saijii.jpg");

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === 2;
  const isPersonalize = activeIndex === 1;
  const primaryDisabled = isPersonalize && selected.length === 0;

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.value * width }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${((progress.value + 1) / 3) * 100}%`,
  }));

  const moveTo = (index: number) => {
    setActiveIndex(index);
    progress.value = withTiming(index, { duration: 420 });
  };

  const toggleInterest = (id: InterestId) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const handleBack = () => {
    if (!isFirst) moveTo(activeIndex - 1);
  };

  const handleNext = () => {
    if (primaryDisabled) return;
    if (isLast) {
      onDone(selected.length > 0 ? selected : undefined);
      return;
    }
    moveTo(activeIndex + 1);
  };

  const handleSkip = () => {
    onDone(selected.length > 0 ? selected : undefined);
  };

  const primaryLabel = isFirst
    ? "Begin"
    : isPersonalize
    ? selected.length > 0
      ? `Continue with ${selected.length} selection${selected.length > 1 ? "s" : ""}`
      : "Select at least one to continue"
    : "Get Started";

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
            <Text style={styles.stepCount}>{activeIndex + 1} / 3</Text>
          </>
        ) : (
          <>
            <Text style={styles.headerBrand}>SAI FAMILY</Text>
            <View style={styles.headerRight}>
              <Text style={styles.stepCount}>{activeIndex + 1} / 3</Text>
              <Pressable onPress={handleSkip} hitSlop={12}>
                <Text style={styles.skip}>Skip</Text>
              </Pressable>
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
        style={[styles.slider, { width: width * 3 }, sliderStyle]}
      >
        <WelcomeSlide image={image2} index={0} progress={progress} width={width} />
        <PersonalizeSlide
          image={image}
          index={1}
          onToggle={toggleInterest}
          progress={progress}
          selected={selected}
          width={width}
        />
        <ReadySlide
          image={image}
          index={2}
          progress={progress}
          selected={selected}
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
            disabled={primaryDisabled}
            onPress={handleNext}
            style={({ pressed }) => [
              styles.primaryButton,
              primaryDisabled && styles.primaryDisabled,
              pressed && !primaryDisabled && styles.buttonPressed,
            ]}
          >
            <Text
              style={[
                styles.primaryText,
                primaryDisabled && styles.primaryTextDisabled,
              ]}
            >
              {primaryLabel}
            </Text>
            {!primaryDisabled ? (
              <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.2} />
            ) : null}
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
  skip: { color: C.inkSecondary, fontSize: 13, fontWeight: "600" },

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
  welcomeBackground: {
    flex: 1,
  },
  welcomeBackgroundImage: {
    transform: [{ scale: 1 }],
  },
  welcomeOverlay: {
    flex: 1,
  },
  welcomeTopBrand: {
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingTop: 6,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
  },
  welcomeBody: {
    alignItems: "center",
    flex: 1,
    justifyContent:'space-around',
    paddingBottom: 14,
    paddingHorizontal: 26,
  },
  imageStack: {
    alignItems: "center",
    height: 220,
    justifyContent: "center",
    marginBottom: 24,
    width: 220,
  },
  imageHalo: {
    borderRadius: 999,
    height: 220,
    opacity: 0.6,
    position: "absolute",
    width: 220,
  },
  saffronRing: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 100,
    borderWidth: 1.5,
    height: 172,
    justifyContent: "center",
    width: 172,
  },
  innerDashedRing: {
    borderColor: C.saffron,
    borderRadius: 100,
    borderStyle: "dashed",
    borderWidth: 0.5,
    bottom: 8,
    left: 8,
    opacity: 0.5,
    position: "absolute",
    right: 8,
    top: 8,
  },
  imageWell: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    height: 154,
    justifyContent: "center",
    overflow: "hidden",
    width: 154,
  },
  welcomeImage: { height: 148, width: 148 },
  welcomeKicker: {
    alignItems: "center",
    backgroundColor: "rgba(255, 240, 184, 0.16)",
    borderColor: "rgba(255, 231, 163, 0.5)",
    borderRadius: 100,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  kickerText: {
    color: "#FFE7A3",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.6,
  },
  welcomeBrandName: {
    color: "#FFF0B8",
    fontFamily: "Georgia",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
    textShadowColor: "rgba(0, 0, 0, 0.32)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 5,
  },
  welcomeTitle: {
    color: "#FFE3A1",
    fontFamily: "Georgia",
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 49,
    textShadowColor: "rgba(0, 0, 0, 0.32)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 6,
    textAlign: "center",marginBottom: 12
  },
  welcomeGoldenLine: {
    backgroundColor: "rgba(255, 218, 128, 0.78)",
    borderRadius: 100,
    height: 2,
    marginTop: 12,
    width: 74,
  },
  welcomeSubtitle: {
    color: "#FFF3C4",
    fontSize: 26,
    fontWeight: "600",
    lineHeight: 29,
    marginTop: 26,
    maxWidth: 330,
    textShadowColor: "rgba(0, 0, 0, 0.28)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 4,
    textAlign: "center",
  },

  /* Slide 2 */
  personalizeBody: { flex: 1, paddingTop: 4 },
  personalizeHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingBottom: 14,
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
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 27,
    marginTop: 2,
  },
  slideText: {
    color: C.inkSecondary,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
    marginBottom: 16,
  },
  counterRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
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
  interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  interestCard: {
    alignItems: "center",
    backgroundColor: C.surface,
    borderColor: C.separator,
    borderRadius: 14,
    borderWidth: 1.5,
    flexBasis: "48%",
    flexDirection: "row",
    flexGrow: 1,
    gap: 11,
    padding: 11,
    position: "relative",
  },
  interestCardSelected: { backgroundColor: C.saffronBg, borderColor: C.saffron },
  interestIcon: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  interestTitle: {
    color: C.ink,
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  interestSubtitle: {
    color: C.inkSecondary,
    fontSize: 10.5,
    fontWeight: "400",
    marginTop: 1,
  },
  interestCheck: {
    alignItems: "center",
    backgroundColor: C.saffron,
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: -6,
    top: -6,
    width: 22,
  },

  /* Slide 3 */
  readyBody: { flex: 1, paddingTop: 6 },
  readyImageStack: {
    alignSelf: "center",
    height: 120,
    marginBottom: 18,
    position: "relative",
    width: 120,
  },
  readyImageRing: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 100,
    borderWidth: 1.5,
    height: 108,
    justifyContent: "center",
    width: 108,
  },
  readyImageWell: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    height: 92,
    justifyContent: "center",
    overflow: "hidden",
    width: 92,
  },
  readyImage: { height: 88, width: 88 },
  readyCheckBadge: {
    alignItems: "center",
    backgroundColor: C.green,
    borderColor: C.bg,
    borderRadius: 100,
    borderWidth: 3,
    bottom: 2,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 2,
    width: 34,
  },
  readyEyebrow: {
    color: C.green,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  readyTitle: {
    color: C.ink,
    fontFamily: "Georgia",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 32,
    marginTop: 6,
    textAlign: "center",
  },
  previewLabel: {
    color: C.inkSecondary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  previewCard: {
    alignItems: "center",
    backgroundColor: C.surface,
    borderColor: C.separator,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    padding: 12,
  },
  previewIcon: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderRadius: 8,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  previewTitle: { color: C.ink, fontSize: 13, fontWeight: "600" },
  previewSubtitle: {
    color: C.inkSecondary,
    fontSize: 11.5,
    fontWeight: "400",
    marginTop: 1,
  },
  extraCount: {
    color: C.inkSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
  readyFallback: {
    color: C.inkSecondary,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22,
    paddingHorizontal: 12,
    textAlign: "center",
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
  primaryDisabled: { backgroundColor: C.separator },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  primaryTextDisabled: { color: C.inkTertiary },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
});
