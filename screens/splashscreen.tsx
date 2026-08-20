import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Image,
} from "react-native";

const SAI_BABA_WELCOME_IMAGE =
  require("../assets/images/saijii.jpg");

type SaiBabaSplashScreenProps = {
  onFinish?: () => void;
};

// ── Main Splash Screen ───────────────────────────────────────────────────────
export default function SaiBabaSplashScreen({ onFinish }: SaiBabaSplashScreenProps) {
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(imageOpacity, {
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
  }, [onFinish, imageOpacity, imageScale]);

  return (<SaiBabaSplashScreenContent imageOpacity={imageOpacity} imageScale={imageScale} />);
}

type SaiBabaSplashScreenContentProps = {
  imageOpacity: Animated.Value;
  imageScale: Animated.Value;
};

function SaiBabaSplashScreenContent({ imageOpacity, imageScale }: SaiBabaSplashScreenContentProps) {
  return (
    <View style={styles.splashWelcomeRoot}>
      <Animated.View
        style={[
          styles.splashWelcomeImageWrapper,
          {
            opacity: imageOpacity,
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
    </View>
  );
}

const styles = StyleSheet.create({
  splashWelcomeRoot: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "center",
  },
  splashWelcomeImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    width: "100%",
  },
  splashWelcomeImage: {
    height: undefined,
    width: "100%",
    aspectRatio: 1,
  },
});
