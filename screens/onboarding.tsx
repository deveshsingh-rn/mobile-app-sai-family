import { useState } from "react";
import {
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
  HeartHandshake,
  Sparkles,
} from "lucide-react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SLIDES = [
  {
    image: require("../assets/images/saibaba1.png"),
    kicker: "Welcome",
    title: "Sai Family",
    description:
      "A peaceful home for devotion, community, events, and daily Sai inspiration.",
    chips: ["Daily blessings", "Devotee family"],
  },
  {
    image: require("../assets/images/splash-icon.png"),
    kicker: "Experience",
    title: "Share Divine Moments",
    description:
      "Post prayers, miracles, dreams, darshan stories, and blessings with your family.",
    chips: ["Leela feed", "Comments"],
  },
  {
    image: require("../assets/images/icon.png"),
    kicker: "Community",
    title: "Stay Connected",
    description:
      "Discover events, Sangha groups, devotees, and trusted local services in one place.",
    chips: ["Events", "Sangha"],
  },
  {
    image: require("../assets/images/saibaba.png"),
    kicker: "Begin",
    title: "Start Your Journey",
    description:
      "Create your devotee account and carry your Sai Family profile with calm clarity.",
    chips: ["Secure profile", "Push updates"],
  },
];

type OnboardingScreenProps = {
  onDone: () => void;
};

type SlideProps = {
  chips: string[];
  description: string;
  image: ImageSourcePropType;
  index: number;
  kicker: string;
  progress: SharedValue<number>;
  title: string;
  width: number;
};

function OnboardingSlide({
  chips,
  description,
  image,
  index,
  kicker,
  progress,
  title,
  width,
}: SlideProps) {
  const imageSize = Math.min(width * 0.58, 246);

  const animatedStyle = useAnimatedStyle(() => {
    const distance = progress.value - index;

    return {
      opacity: interpolate(
        distance,
        [-1, 0, 1],
        [0.18, 1, 0.18],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateX: interpolate(
            distance,
            [-1, 0, 1],
            [width * 0.16, 0, -width * 0.16],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            distance,
            [-1, 0, 1],
            [0.96, 1, 0.96],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.slide, { width }, animatedStyle]}>
      <View style={styles.artStage}>
        <LinearGradient
          colors={["#FFF7ED", "#F6EFD9"]}
          style={styles.artHalo}
        />
        <View style={styles.imageFrame}>
          <Animated.Image
            resizeMode="contain"
            source={image}
            style={[
              styles.slideImage,
              {
                height: imageSize,
                width: imageSize,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.copyPanel}>
        <View style={styles.kickerRow}>
          <Sparkles color="#F97316" size={15} />
          <Text style={styles.kicker}>{kicker}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.chipRow}>
          {chips.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

type IndicatorDotProps = {
  index: number;
  progress: SharedValue<number>;
};

function IndicatorDot({ index, progress }: IndicatorDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const active = interpolate(
      progress.value,
      [index - 1, index, index + 1],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      backgroundColor: active > 0.5 ? "#F97316" : "#E7D7BE",
      opacity: interpolate(active, [0, 1], [0.7, 1]),
      width: interpolate(active, [0, 1], [8, 28]),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function OnboardingScreen({
  onDone,
}: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useSharedValue(0);
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === SLIDES.length - 1;

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: -progress.value * width,
      },
    ],
  }));

  const moveTo = (index: number) => {
    setActiveIndex(index);
    progress.value = withTiming(index, {
      duration: 420,
    });
  };

  const handleBack = () => {
    if (!isFirstSlide) {
      moveTo(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (isLastSlide) {
      onDone();
      return;
    }

    moveTo(activeIndex + 1);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FAFAF9", "#FFF7ED", "#FAFAF9"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <HeartHandshake color="#1F2937" size={19} />
          </View>
          <View>
            <Text style={styles.brandEyebrow}>Sai Family</Text>
            <Text style={styles.brand}>Devotion App</Text>
          </View>
        </View>

        <Pressable onPress={onDone} hitSlop={12} style={styles.skipButton}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[
          styles.slider,
          {
            width: width * SLIDES.length,
          },
          sliderStyle,
        ]}
      >
        {SLIDES.map((slide, index) => (
          <OnboardingSlide
            key={slide.title}
            chips={slide.chips}
            description={slide.description}
            image={slide.image}
            index={index}
            kicker={slide.kicker}
            progress={progress}
            title={slide.title}
            width={width}
          />
        ))}
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressText}>
              {activeIndex + 1} of {SLIDES.length}
            </Text>
            <View style={styles.indicator}>
              {SLIDES.map((slide, index) => (
                <IndicatorDot
                  key={slide.title}
                  index={index}
                  progress={progress}
                />
              ))}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              disabled={isFirstSlide}
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                isFirstSlide && styles.backButtonDisabled,
                pressed && !isFirstSlide && styles.buttonPressed,
              ]}
            >
              <ArrowLeft
                color={isFirstSlide ? "#D6D3D1" : "#1F2937"}
                size={18}
              />
            </Pressable>

            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.nextText}>
                {isLastSlide ? "Get Started" : "Next"}
              </Text>
              <ArrowRight color="#FFFFFF" size={18} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  artHalo: {
    borderRadius: 999,
    height: 255,
    position: "absolute",
    width: 255,
  },
  artStage: {
    alignItems: "center",
    height: 292,
    justifyContent: "center",
    marginBottom: 12,
    width: "100%",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 12,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: 56,
  },
  backButtonDisabled: {
    backgroundColor: "#FAFAF9",
  },
  brand: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  brandEyebrow: {
    color: "#F97316",
    fontSize: 11,
    fontWeight: "900",
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  chip: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 18,
  },
  chipText: {
    color: "#C2410C",
    fontSize: 12,
    fontWeight: "900",
  },
  container: {
    backgroundColor: "#FAFAF9",
    flex: 1,
    overflow: "hidden",
  },
  copyPanel: {
    alignItems: "center",
    paddingHorizontal: 28,
  },
  description: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 23,
    marginTop: 10,
    maxWidth: 330,
    textAlign: "center",
  },
  dot: {
    borderRadius: 4,
    height: 8,
  },
  footer: {
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 58,
    zIndex: 2,
  },
  imageFrame: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 28,
    borderWidth: 1,
    height: 272,
    justifyContent: "center",
    shadowColor: "#7C2D12",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    width: 272,
    elevation: 4,
  },
  indicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  kicker: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "900",
  },
  kickerRow: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  nextButton: {
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 52,
    justifyContent: "center",
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#7C2D12",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  progressText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "900",
  },
  progressTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skip: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "900",
  },
  skipButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  slide: {
    justifyContent: "center",
    paddingBottom: 12,
    paddingHorizontal: 0,
  },
  slideImage: {
    maxHeight: 235,
    maxWidth: 235,
  },
  slider: {
    flex: 1,
    flexDirection: "row",
  },
  title: {
    color: "#1F2937",
    fontSize: 33,
    fontWeight: "900",
    lineHeight: 39,
    marginTop: 16,
    textAlign: "center",
  },
});
