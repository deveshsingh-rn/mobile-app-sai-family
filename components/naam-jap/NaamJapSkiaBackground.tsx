import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useMemo } from "react";
import {
  StyleSheet,
  TurboModuleRegistry,
  View,
  useWindowDimensions,
} from "react-native";

type SkiaPackage = typeof import("@shopify/react-native-skia");

let cachedSkia: SkiaPackage | null | undefined;

function getSkiaPackage(): SkiaPackage | null {
  if (cachedSkia !== undefined) {
    return cachedSkia;
  }

  const hasInstalledBindings =
    Boolean((globalThis as { SkiaApi?: unknown }).SkiaApi) ||
    Boolean(TurboModuleRegistry.get("RNSkiaModule"));

  if (!hasInstalledBindings) {
    cachedSkia = null;
    return cachedSkia;
  }

  try {
    // Defer native initialization so older dev clients can render the fallback.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedSkia = require("@shopify/react-native-skia") as SkiaPackage;
  } catch {
    cachedSkia = null;
  }

  return cachedSkia;
}

export function NaamJapSkiaBackground() {
  const { height, width } = useWindowDimensions();
  const skia = getSkiaPackage();
  const paths = useMemo(
    () => ({
      cool: `M ${-width * 0.25} ${height * 0.72} C ${width * 0.2} ${
        height * 0.5
      }, ${width * 0.72} ${height * 0.96}, ${width * 1.28} ${height * 0.68}`,
      contour: `M ${-width * 0.1} ${height * 0.4} C ${width * 0.26} ${
        height * 0.28
      }, ${width * 0.7} ${height * 0.57}, ${width * 1.12} ${height * 0.34}`,
      warm: `M ${-width * 0.35} ${height * 0.22} C ${width * 0.14} ${
        height * 0.04
      }, ${width * 0.62} ${height * 0.39}, ${width * 1.3} ${height * 0.12}`,
    }),
    [height, width]
  );

  if (!skia) {
    return <NaamJapGradientFallback />;
  }

  const {
    BlurMask,
    Canvas,
    Fill,
    LinearGradient,
    Path,
    vec,
  } = skia;

  return (
    <MotiView
      animate={{ opacity: 0.98 }}
      from={{ opacity: 0.82 }}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      transition={{
        duration: 4200,
        loop: true,
        repeatReverse: true,
        type: "timing",
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Fill>
          <LinearGradient
            colors={["#FFF9F0", "#EEF5F1", "#F5F0F8"]}
            end={vec(width, height)}
            start={vec(0, 0)}
          />
        </Fill>
        <Path
          color="#F4A33A"
          opacity={0.14}
          path={paths.warm}
          strokeCap="round"
          strokeWidth={150}
          style="stroke"
        >
          <BlurMask blur={54} style="normal" />
        </Path>
        <Path
          color="#3F7C6D"
          opacity={0.12}
          path={paths.cool}
          strokeCap="round"
          strokeWidth={180}
          style="stroke"
        >
          <BlurMask blur={62} style="normal" />
        </Path>
        <Path
          color="rgba(255,255,255,0.5)"
          path={paths.contour}
          strokeCap="round"
          strokeWidth={1.2}
          style="stroke"
        />
        <Path
          color="rgba(125,101,148,0.13)"
          path={paths.cool}
          strokeCap="round"
          strokeWidth={1}
          style="stroke"
        />
      </Canvas>
    </MotiView>
  );
}

function NaamJapGradientFallback() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ExpoLinearGradient
        colors={["#FFF9F0", "#EEF5F1", "#F5F0F8"]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <MotiView
        animate={{ opacity: 0.2, translateX: 22 }}
        from={{ opacity: 0.08, translateX: -12 }}
        style={[styles.fallbackBand, styles.warmBand]}
        transition={{
          duration: 4300,
          loop: true,
          repeatReverse: true,
          type: "timing",
        }}
      />
      <MotiView
        animate={{ opacity: 0.16, translateX: -18 }}
        from={{ opacity: 0.06, translateX: 14 }}
        style={[styles.fallbackBand, styles.coolBand]}
        transition={{
          duration: 5100,
          loop: true,
          repeatReverse: true,
          type: "timing",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackBand: {
    borderRadius: 100,
    height: 150,
    position: "absolute",
    width: "125%",
  },
  warmBand: {
    backgroundColor: "#F4A33A",
    left: "-20%",
    top: 90,
    transform: [{ rotate: "-12deg" }],
  },
  coolBand: {
    backgroundColor: "#3F7C6D",
    bottom: 80,
    left: "-5%",
    transform: [{ rotate: "10deg" }],
  },
});
