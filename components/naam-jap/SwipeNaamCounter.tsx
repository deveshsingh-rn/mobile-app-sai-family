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
          {disabled ? "Daily goal complete" : "Swipe right to count"}
        </Text>
      </View>
      <View pointerEvents="none" style={styles.endButton}>
        <ChevronsRight
          color={disabled ? "#9BA49F" : "#557568"}
          size={25}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: "#DDE5E0",
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: 1,
    height: 88,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  activeTrack: { backgroundColor: "#FFFFFF", borderColor: "#AFC5BA" },
  disabled: { opacity: 0.72 },
  copy: { left: 20, position: "absolute", right: 72, zIndex: 2 },
  naam: {
    color: "#29463D",
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 24,
    textAlign: "left",
  },
  instruction: {
    color: "#747D78",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "left",
  },
  endButton: {
    alignItems: "center",
    backgroundColor: "#EDF3EF",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    right: 10,
    width: 48,
    zIndex: 2,
  },
  swipeGlow: {
    backgroundColor: "rgba(85,117,104,0.16)",
    borderColor: "rgba(85,117,104,0.22)",
    borderRadius: 18,
    borderWidth: 1,
    height: 76,
    left: 6,
    position: "absolute",
    width: 58,
  },
});
