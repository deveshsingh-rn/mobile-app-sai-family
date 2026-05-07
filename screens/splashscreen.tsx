import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
} from "react-native";

const { width, height } = Dimensions.get("window");

// ── Flower Petal Component ──────────────────────────────────────────────────
const FLOWER_EMOJIS = ["✦", "🔅","✧", "✺","🔸","🔆"];

type FallingFlowerProps = {
  delay: number;
  startX: number;
  emoji: string;
  size: number;
};

type SparkleProps = {
  x: number;
  y: number;
  delay: number;
};

type SaiBabaSplashScreenProps = {
  onFinish?: () => void;
};

function FallingFlower({ delay, startX, emoji, size }: FallingFlowerProps) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sway = Math.random() * 60 - 30; // –30 to +30 px horizontal drift
    const duration = 3500 + Math.random() * 2000;

    const loop = () => {
      // reset
      translateY.setValue(-60);
      translateX.setValue(0);
      rotate.setValue(0);
      opacity.setValue(0);

      Animated.parallel([
        // fade in quickly, fade out near bottom
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration - 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // fall down – only to lower ~30% of screen (feet area)
        Animated.timing(translateY, {
          toValue: height * 0.35,
          duration,
          useNativeDriver: true,
        }),
        // gentle sway
        Animated.timing(translateX, {
          toValue: sway,
          duration,
          useNativeDriver: true,
        }),
        // spin
        Animated.timing(rotate, {
          toValue: 3,
          duration,
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };

    const t = setTimeout(loop, delay);
    return () => clearTimeout(t);
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 3],
    outputRange: ["0deg", "1080deg"],
  });

  return (
    <Animated.Text
      style={[
        styles.flower,
        {
          left: startX,
          fontSize: size,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate: spin },
          ],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

// ── Sparkle dot ─────────────────────────────────────────────────────────────
function Sparkle({ x, y, delay }: SparkleProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      scale.setValue(0);
      op.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(op, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(op, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1500 + Math.random() * 2000),
      ]).start(() => loop());
    };
    loop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { left: x, top: y, opacity: op, transform: [{ scale }] },
      ]}
    />
  );
}

// ── Glow ring around image ───────────────────────────────────────────────────
function GlowRing() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.glowRing, { transform: [{ scale: pulse }] }]}
    />
  );
}

// ── Main Splash Screen ───────────────────────────────────────────────────────
export default function SaiBabaSplashScreen({ onFinish }: SaiBabaSplashScreenProps) {
  // Title fade-in
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.6)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // image entrance
      Animated.parallel([
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      // title entrance
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // auto-dismiss after 4 seconds
    if (onFinish) {
      const t = setTimeout(onFinish, 450000);
      return () => clearTimeout(t);
    }
  }, []);

  // Generate flowers
  const flowers = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        delay: i * 420 + Math.random() * 500,
        startX: Math.random() * (width - 40),
        emoji: FLOWER_EMOJIS[i % FLOWER_EMOJIS.length],
        size: 10 + Math.random() * 8,
      })),
    []
  );

  // Generate sparkles
  const sparkles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: 30 + Math.random() * (width - 60),
        y: height * 0.15 + Math.random() * height * 0.6,
        delay: i * 420,
      })),
    []
  );

  return (
    <View style={styles.container}>
      {/* ── Radial gradient background (simulated with layered views) ── */}
      <View style={styles.bgOuter} />
      <View style={styles.bgMid} />
      <View style={styles.bgInner} />

      {/* ── Sparkles ── */}
      {sparkles.map((s) => (
        <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} />
      ))}

      {/* ── Falling flowers (start above image, land at feet) ── */}
      {flowers.map((f) => (
        <FallingFlower
          key={f.id}
          delay={f.delay}
          startX={f.startX}
          emoji={f.emoji}
          size={f.size}
        />
      ))}

      <Text style={styles.brand}>SAI FAMILY</Text>
      <Text style={styles.omTop}>ॐ</Text>

      {/* ── Title ── */}
      <Animated.Text
        style={[
          styles.title,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] },
        ]}
      >
        Sai Baba
      </Animated.Text>

      <Animated.Text
        style={[styles.subtitle, { opacity: subtitleOpacity }]}
      >
        Om Sai Ram
      </Animated.Text>

      {/* ── Glow ring + Image ── */}
      <View style={styles.imageWrapper}>
        <GlowRing />
        <View style={styles.imageHalo} />
        <Animated.Image
          source={require("../assets/images/saibaba.png")}
          style={[
            styles.saiBabaImage,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerOm}>ॐ</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* ── Bottom blessing ── */}
      <Animated.Text
        style={[styles.blessing, { opacity: subtitleOpacity }]}
      >
        Sabka Malik Ek
      </Animated.Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const IMG_SIZE = width * 0.62;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Simulated radial glow bg
  bgOuter: {
    position: "absolute",
    width: width * 2,
    height: width * 2,
    borderRadius: width,
    backgroundColor: "#f7dd89",
    top: -width * 0.95,
    left: -width / 2,
  },
  bgMid: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: "#facd51",
    top: height * 0.66,
    left: -width * 0.1,
  },
  bgInner: {
    position: "absolute",
    width: width * 0.92,
    height: width * 0.92,
    borderRadius: width * 0.46,
    backgroundColor: "#fff3cf",
    top: height / 2 - width * 0.46,
    left: width * 0.04,
  },

  brand: {
    color: "#8a5a13",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 14,
    textTransform: "uppercase",
  },

  // Om
  omTop: {
    fontSize: 34,
    color: "#bd7a12",
    fontWeight: "bold",
    marginBottom: 8,
  },

  // Title
  title: {
    fontSize: 34,
    color: "#5d3b0a",
    fontFamily: "serif",
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#e39611",
    fontWeight: "600",
    letterSpacing: 3,
    marginBottom: 24,
    textTransform: "uppercase",
  },

  // Image
  imageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: IMG_SIZE + 30,
    height: IMG_SIZE + 30,
  },
  glowRing: {
    position: "absolute",
    width: IMG_SIZE + 28,
    height: IMG_SIZE + 28,
    borderRadius: (IMG_SIZE + 28) / 2,
    borderWidth: 1,
    borderColor: "#e3b34f",
    shadowColor: "#d59a25",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  imageHalo: {
    position: "absolute",
    width: IMG_SIZE + 8,
    height: IMG_SIZE + 8,
    borderRadius: (IMG_SIZE + 8) / 2,
    backgroundColor: "#fffdf7",
  },
  saiBabaImage: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    borderRadius: IMG_SIZE / 2,
    borderWidth: 2,
    borderColor: "#d9a441",
  },

  divider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  dividerLine: {
    width: 44,
    height: 1,
    backgroundColor: "#d8ad55",
  },
  dividerOm: {
    color: "#9a6a1a",
    fontSize: 15,
    fontWeight: "700",
  },

  // Bottom
  blessing: {
    marginTop: 14,
    fontSize: 13,
    color: "#6f4a12",
    fontWeight: "600",
    letterSpacing: 2.5,
  },

  // Falling flowers
  flower: {
    position: "absolute",
    top: 0,
    zIndex: 10,
    color: "#c9932e",
  },

  // Sparkle dot
  sparkle: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#d7a23b",
    shadowColor: "#f4d37d",
    shadowRadius: 4,
    shadowOpacity: 0.6,
    elevation: 3,
  },
});
