import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SAI_BABA_WELCOME_IMAGE =
  require("../assets/images/babasai.png");

type SaiBabaSplashScreenProps = {
  onFinish?: () => void;
};

// ── Main Splash Screen ───────────────────────────────────────────────────────
export default function SaiBabaSplashScreen({ onFinish }: SaiBabaSplashScreenProps) {
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // auto-dismiss after the welcome moment
    if (onFinish) {
      const t = setTimeout(onFinish, 3500);
      return () => {
        clearTimeout(t);
      };
    }

    return undefined;
  }, [onFinish, contentOpacity, imageScale]);

  return (<SaiBabaSplashScreenContent contentOpacity={contentOpacity} imageScale={imageScale} />);
}

type SaiBabaSplashScreenContentProps = {
  contentOpacity: Animated.Value;
  imageScale: Animated.Value;
};

function SaiBabaSplashScreenContent({ contentOpacity, imageScale }: SaiBabaSplashScreenContentProps) {
  return (
    <SafeAreaView style={styles.splashWelcomeRoot}>
      <Animated.View style={[styles.splashWelcomeHeader, { opacity: contentOpacity }]}>
        <View style={styles.splashWelcomeKicker}>
          <Text style={styles.splashWelcomeKickerText}>OM SAI RAM</Text>
        </View>
        <Text style={styles.splashWelcomeTitle}>Sai Ki Family</Text>
      </Animated.View>
      <Animated.View style={[styles.splashWelcomeFooter, { opacity: contentOpacity }]}>
        <Text style={styles.splashWelcomeSubtitle}>Welcome Home.</Text>
        <Text style={styles.splashWelcomeTagline}>
          The Global Family of Sai Devotees
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.splashWelcomeImageWrapper,
          {
            opacity: contentOpacity,
            transform: [{ scale: imageScale }],
          },
        ]}
      >
        <Image
          accessibilityRole="image"
          accessibilityLabel="Sai Baba"
          resizeMode="contain"
          source={SAI_BABA_WELCOME_IMAGE}
          style={styles.splashWelcomeImage}
        />
      </Animated.View>

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splashWelcomeRoot: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  splashWelcomeHeader: {
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 28,
  },
  splashWelcomeKicker: {
    alignItems: "center",
    backgroundColor: "#FFF1DF",
    borderColor: "#FDE3C4",
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  splashWelcomeKickerText: {
    color: "#9A3412",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.6,
  },
  splashWelcomeTitle: {
    color: "#9A3412",
    fontFamily: "Georgia",
    fontSize: 40,
    fontWeight: "700",
    lineHeight: 47,
    marginTop: 16,
    textAlign: "center",
  },
  splashWelcomeImageWrapper: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 24,
    width: "100%",
    // borderWidth: 1,
    // borderColor: "red",
  },
  splashWelcomeImage: {
    height: "100%",
    width: "100%",
  },
  splashWelcomeFooter: {
    alignItems: "center",
    // paddingBottom: 36,
    paddingHorizontal: 26,
  },
  splashWelcomeSubtitle: {
    color: "#9A3412",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  splashWelcomeTagline: {
    color: "#9A3412",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 330,
    textAlign: "center",
  },
});
