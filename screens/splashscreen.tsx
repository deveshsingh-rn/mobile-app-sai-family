import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  ImageBackground,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const SAI_BABA_WELCOME_IMAGE =
  require("../assets/images/saijii.jpg");

type SaiBabaSplashScreenProps = {
  onFinish?: () => void;
};

// ── Main Splash Screen ───────────────────────────────────────────────────────
export default function SaiBabaSplashScreen({ onFinish }: SaiBabaSplashScreenProps) {
  // Title fade-in
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(3)).current;

  useEffect(() => {
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
    ]).start();

    // auto-dismiss after the welcome moment
    if (onFinish) {
      const t = setTimeout(onFinish, 2000);
      return () => {
        clearTimeout(t);
      };
    }

    return undefined;
  }, [onFinish, titleOpacity, titleY]);

  return (<SaiBabaSplashScreenContent titleOpacity={titleOpacity} titleY={titleY} />);
}

type SaiBabaSplashScreenContentProps = {
  titleOpacity: Animated.Value;
  titleY: Animated.Value;
};

function SaiBabaSplashScreenContent({ titleOpacity, titleY }: SaiBabaSplashScreenContentProps) {
  return (  
    <ImageBackground
      imageStyle={styles.splashWelcomeImage}
      resizeMode="stretch"
      source={SAI_BABA_WELCOME_IMAGE}
      style={styles.splashWelcomeRoot}
    >
      <LinearGradient
        colors={[
          "rgba(100, 56, 4, 0.1)",
          "rgba(172, 93, 28, 0.04)",
          "rgba(30, 16, 5, 0.09)",
        ]}
        locations={[0, 0.52, 1]}
        style={styles.splashWelcomeOverlay}
      >
        <View style={styles.splashWelcomeTopBrand}>
          <View style={styles.splashWelcomeKicker}>
            <Text style={styles.splashWelcomeKickerText}>OM SAI RAM</Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.splashWelcomeContent,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
            },
          ]}
        >
          <Text style={styles.splashWelcomeTitle}>Sai Ki Family</Text>
          <Text style={styles.splashWelcomeSubtitle}>
            Welcome Home.{"\n"}
            The Global Family of Sai Devotees
          </Text>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  splashWelcomeRoot: {
    flex: 1,
  },
  splashWelcomeImage: {
    transform: [{ scale: 1 }],
  },
  splashWelcomeOverlay: {
    flex: 1,
  },
  splashWelcomeTopBrand: {
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingTop: 56,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
  },
  splashWelcomeKicker: {
    alignItems: "center",
    backgroundColor: "rgba(255, 240, 184, 0.16)",
    borderColor: "rgba(255, 231, 163, 0.5)",
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  splashWelcomeKickerText: {
    color: "#FFE7A3",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.6,
  },
  splashWelcomeContent: {
    paddingTop: 120,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  splashWelcomeTitle: {
    color: "#FFE3A1",
    fontFamily: "Georgia",
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 49,
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.32)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 6,
  },
  splashWelcomeSubtitle: {
    color: "#FFF3C4",
    fontSize: 26,
    fontWeight: "600",
    lineHeight: 29,
    marginTop: 26,
    maxWidth: 330,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.28)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 4,
  },
});
