import { useState } from "react";
import { ImageSourcePropType, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
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
    title: "Welcome to Sai Family",
    description: "A peaceful space for devotion, connection, and daily inspiration.",
  },
  {
    image: require("../assets/images/splash-icon.png"),
    title: "Daily Blessings",
    description: "Begin each day with Sai thoughts, prayers, and uplifting moments.",
  },
  {
    image: require("../assets/images/icon.png"),
    title: "Family Connection",
    description: "Stay close to your community with simple, meaningful updates.",
  },
  {
    image: require("../assets/images/saibaba.png"),
    title: "Start Your Journey",
    description: "Create your account and continue with faith, calm, and clarity.",
  },
];

type OnboardingScreenProps = {
  onDone: () => void;
};

type SlideProps = {
  description: string;
  image: ImageSourcePropType;
  index: number;
  progress: SharedValue<number>;
  title: string;
  width: number;
};

function OnboardingSlide({ description, image, index, progress, title, width }: SlideProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = progress.value - index;

    return {
      opacity: interpolate(distance, [-1, 0, 1], [0.25, 1, 0.25], Extrapolation.CLAMP),
      transform: [
        {
          translateX: interpolate(distance, [-1, 0, 1], [width * 0.18, 0, -width * 0.18], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(distance, [-1, 0, 1], [0.94, 1, 0.94], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.slide, { width }, animatedStyle]}>
      <View style={styles.imageFrame}>
        <Animated.Image source={image} style={styles.slideImage} resizeMode="contain" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Animated.View>
  );
}

type IndicatorDotProps = {
  index: number;
  progress: SharedValue<number>;
};

function IndicatorDot({ index, progress }: IndicatorDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const active = interpolate(progress.value, [index - 1, index, index + 1], [0, 1, 0], Extrapolation.CLAMP);

    return {
      opacity: interpolate(active, [0, 1], [0.35, 1]),
      width: interpolate(active, [0, 1], [8, 28]),
      backgroundColor: active > 0.5 ? "#a86f12" : "#d9bd7a",
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useSharedValue(0);
  const isLastSlide = activeIndex === SLIDES.length - 1;

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.value * width }],
  }));

  const handleNext = () => {
    const nextIndex = Math.min(activeIndex + 1, SLIDES.length - 1);

    if (nextIndex === activeIndex) {
      onDone();
      return;
    }

    setActiveIndex(nextIndex);
    progress.value = withTiming(nextIndex, { duration: 420 });
  };

  const handleSkip = () => {
    onDone();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <View style={styles.header}>
        <Text style={styles.brand}>SAI FAMILY</Text>
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.slider, { width: width * SLIDES.length }, sliderStyle]}>
        {SLIDES.map((slide, index) => (
          <OnboardingSlide
            key={slide.title}
            description={slide.description}
            image={slide.image}
            index={index}
            progress={progress}
            title={slide.title}
            width={width}
          />
        ))}
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.indicator}>
          {SLIDES.map((slide, index) => (
            <IndicatorDot key={slide.title} index={index} progress={progress} />
          ))}
        </View>

        <Pressable style={({ pressed }) => [styles.nextButton, pressed && styles.buttonPressed]} onPress={handleNext}>
          <Text style={styles.nextText}>{isLastSlide ? "Get Started" : "Next"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf0",
    overflow: "hidden",
  },
  topGlow: {
    position: "absolute",
    top: -140,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#ffe7a3",
  },
  bottomGlow: {
    position: "absolute",
    right: -120,
    bottom: -150,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#fff0c2",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  brand: {
    color: "#6d4810",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 3,
  },
  skip: {
    color: "#9a6a1a",
    fontSize: 14,
    fontWeight: "700",
  },
  slider: {
    flex: 1,
    flexDirection: "row",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  imageFrame: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#e5c878",
    borderRadius: 160,
    borderWidth: 1,
    height: 260,
    justifyContent: "center",
    marginBottom: 34,
    shadowColor: "#c8942f",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    width: 260,
    elevation: 7,
  },
  slideImage: {
    height: 218,
    width: 218,
  },
  title: {
    color: "#4e3309",
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: 0.2,
    lineHeight: 36,
    textAlign: "center",
  },
  description: {
    color: "#79571b",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    marginTop: 14,
    maxWidth: 320,
    textAlign: "center",
  },
  footer: {
    paddingBottom: 42,
    paddingHorizontal: 24,
  },
  indicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 26,
  },
  dot: {
    borderRadius: 4,
    height: 8,
  },
  nextButton: {
    alignItems: "center",
    backgroundColor: "#8e5d10",
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
    shadowColor: "#8e5d10",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  nextText: {
    color: "#fffaf0",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});
