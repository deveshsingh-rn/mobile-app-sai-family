import { ChevronsRight } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  disabled?: boolean;
  label: string;
  onCount: () => void;
};

export function SwipeNaamCounter({ disabled, label, onCount }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isCompletingRef = useRef(false);
  const countedThisGestureRef = useRef(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const maxTravel = Math.max(0, trackWidth - 64);

  const reset = useCallback(() => {
    Animated.spring(translateX, {
      damping: 20,
      stiffness: 190,
      toValue: 0,
      useNativeDriver: true,
    }).start(() => setIsSwiping(false));
  }, [translateX]);

  const completeSwipe = useCallback(() => {
    if (isCompletingRef.current || countedThisGestureRef.current) return;

    isCompletingRef.current = true;
    countedThisGestureRef.current = true;
    onCount();
    translateX.stopAnimation();
    Animated.sequence([
      Animated.timing(translateX, {
        duration: 45,
        toValue: maxTravel,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        duration: 45,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
        isCompletingRef.current = false;
        setIsSwiping(false);
    });
  }, [maxTravel, onCount, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !disabled &&
          !isCompletingRef.current &&
          gesture.dx > 5 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          countedThisGestureRef.current = false;
          setIsSwiping(true);
        },
        onPanResponderMove: (_, gesture) => {
          if (isCompletingRef.current) return;

          translateX.setValue(Math.min(maxTravel, Math.max(0, gesture.dx)));

          if (gesture.dx >= 14 || (gesture.dx >= 7 && gesture.vx > 0.3)) {
            completeSwipe();
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (countedThisGestureRef.current || isCompletingRef.current) return;

          if (maxTravel > 0 && gesture.dx >= 10) {
            completeSwipe();
          } else {
            reset();
          }
        },
        onPanResponderTerminate: () => {
          if (!countedThisGestureRef.current) reset();
        },
      }),
    [completeSwipe, disabled, maxTravel, reset, translateX]
  );

  return (
    <View
      accessibilityActions={[{ label: `Count ${label}`, name: "activate" }]}
      accessibilityHint="Swipe a little from left to right"
      accessibilityLabel={`Swipe to count ${label}`}
      accessibilityRole="adjustable"
      accessibilityState={{ disabled }}
      {...panResponder.panHandlers}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "activate" && !disabled) onCount();
      }}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[
        styles.track,
        isSwiping && styles.activeTrack,
        disabled && styles.disabled,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.swipeGlow, { transform: [{ translateX }] }]}
      />
      <View pointerEvents="none" style={styles.copy}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={2}
          style={styles.naam}
        >
          {label}
        </Text>
        <Text style={styles.instruction}>
          {disabled ? "Daily goal complete" : "Swipe Right to Count"}
        </Text>
      </View>
      <View pointerEvents="none" style={styles.endButton}>
        <ChevronsRight
          color={disabled ? "#C8A58F" : "#9A3412"}
          size={25}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: 1,
    height: 88,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  activeTrack: { backgroundColor: "#FFF8F1", borderColor: "#FDBA74" },
  disabled: { opacity: 0.72 },
  copy: { left: 20, position: "absolute", right: 72, zIndex: 2 },
  naam: {
    color: "#9A3412",
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 24,
    textAlign: "left",
  },
  instruction: {
    color: "#A65B35",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "left",
  },
  endButton: {
    alignItems: "center",
    backgroundColor: "#FFE4C7",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    right: 10,
    width: 48,
    zIndex: 2,
  },
  swipeGlow: {
    backgroundColor: "rgba(249,115,22,0.12)",
    borderColor: "rgba(154,52,18,0.18)",
    borderRadius: 18,
    borderWidth: 1,
    height: 76,
    left: 6,
    position: "absolute",
    width: 58,
  },
});
