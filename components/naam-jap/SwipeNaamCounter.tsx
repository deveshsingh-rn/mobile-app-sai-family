import { MoveUpRight } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getNaamJapSwipeDirection } from "@/utils/naam-jap-gesture";

type Props = {
  disabled?: boolean;
  label: string;
  onCount: () => void;
};

export function SwipeNaamCounter({ disabled, label, onCount }: Props) {
  const translation = useRef(new Animated.ValueXY()).current;
  const isCompletingRef = useRef(false);
  const countedThisGestureRef = useRef(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const maxTravel = Math.max(0, trackWidth - 64);

  const reset = useCallback(() => {
    Animated.spring(translation, {
      damping: 20,
      stiffness: 190,
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start(() => setIsSwiping(false));
  }, [translation]);

  const completeSwipe = useCallback((direction: "right" | "up") => {
    if (isCompletingRef.current || countedThisGestureRef.current) return;

    isCompletingRef.current = true;
    countedThisGestureRef.current = true;
    onCount();
    translation.stopAnimation();
    Animated.sequence([
      Animated.timing(translation, {
        duration: 40,
        toValue:
          direction === "right"
            ? { x: maxTravel, y: 0 }
            : { x: 0, y: -48 },
        useNativeDriver: true,
      }),
      Animated.timing(translation, {
        duration: 40,
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }),
    ]).start(() => {
        isCompletingRef.current = false;
        setIsSwiping(false);
    });
  }, [maxTravel, onCount, translation]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
          const movingRight =
            gesture.dx > 5 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
          const movingUp =
            gesture.dy < -5 && Math.abs(gesture.dy) > Math.abs(gesture.dx);

          return !disabled && !isCompletingRef.current && (movingRight || movingUp);
        },
        onPanResponderGrant: () => {
          countedThisGestureRef.current = false;
          setIsSwiping(true);
        },
        onPanResponderMove: (_, gesture) => {
          if (isCompletingRef.current) return;

          const movingUp = Math.abs(gesture.dy) > Math.abs(gesture.dx);
          translation.setValue(
            movingUp
              ? { x: 0, y: Math.max(-48, Math.min(0, gesture.dy)) }
              : { x: Math.min(maxTravel, Math.max(0, gesture.dx)), y: 0 }
          );

          const direction = getNaamJapSwipeDirection(gesture);
          if (direction) completeSwipe(direction);
        },
        onPanResponderRelease: (_, gesture) => {
          if (countedThisGestureRef.current || isCompletingRef.current) return;

          const direction = getNaamJapSwipeDirection(gesture, true);
          if (direction && (direction === "up" || maxTravel > 0)) {
            completeSwipe(direction);
          } else reset();
        },
        onPanResponderTerminate: () => {
          if (!countedThisGestureRef.current) reset();
        },
      }),
    [completeSwipe, disabled, maxTravel, reset, translation]
  );

  return (
    <View
      accessibilityActions={[{ label: `Count ${label}`, name: "activate" }]}
      accessibilityHint="Swipe a little to the right or upward"
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
        style={[styles.swipeGlow, { transform: translation.getTranslateTransform() }]}
      />
      <View pointerEvents="none" style={styles.copy}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          numberOfLines={1}
          style={styles.naam}
        >
          {label}
        </Text>
        <Text style={styles.instruction}>
          {disabled ? "Daily goal complete" : "Swipe right or up to count"}
        </Text>
      </View>
      <View pointerEvents="none" style={styles.endButton}>
        <MoveUpRight
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
