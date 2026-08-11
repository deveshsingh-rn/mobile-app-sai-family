import { ChevronRight } from "lucide-react-native";
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

const THUMB_WIDTH = 74;

export function SwipeNaamCounter({ disabled, label, onCount }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const maxTravel = Math.max(0, trackWidth - THUMB_WIDTH - 8);

  const reset = useCallback(() => {
    Animated.spring(translateX, {
      damping: 18,
      stiffness: 220,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  const completeSwipe = useCallback(() => {
    Animated.timing(translateX, {
      duration: 120,
      toValue: maxTravel,
      useNativeDriver: true,
    }).start(() => {
      onCount();
      translateX.setValue(0);
    });
  }, [maxTravel, onCount, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !disabled &&
          gesture.dx > 7 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(Math.min(maxTravel, Math.max(0, gesture.dx)));
        },
        onPanResponderRelease: (_, gesture) => {
          if (maxTravel > 0 && gesture.dx >= maxTravel * 0.72) {
            completeSwipe();
          } else {
            reset();
          }
        },
        onPanResponderTerminate: reset,
      }),
    [completeSwipe, disabled, maxTravel, reset, translateX]
  );

  return (
    <View
      accessibilityActions={[{ label: `Count ${label}`, name: "activate" }]}
      accessibilityHint="Swipe the Naam from left to right"
      accessibilityLabel={`Swipe to count ${label}`}
      accessibilityRole="adjustable"
      accessibilityState={{ disabled }}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "activate" && !disabled) onCount();
      }}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[styles.track, disabled && styles.disabled]}
    >
      <Text numberOfLines={1} style={styles.instruction}>
        {disabled ? "Daily goal complete" : `Swipe ${label} to count`}
      </Text>
      <ChevronRight color="#789083" size={18} style={styles.endIcon} />
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.thumb, { transform: [{ translateX }] }]}
      >
        <Text numberOfLines={1} style={styles.thumbText}>
          {label}
        </Text>
        <ChevronRight color="#FFFFFF" size={16} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    overflow: "hidden",
    paddingLeft: 86,
    paddingRight: 34,
    width: "100%",
  },
  disabled: { opacity: 0.72 },
  instruction: { color: "#53625B", fontSize: 12, fontWeight: "700", textAlign: "center" },
  endIcon: { position: "absolute", right: 12 },
  thumb: {
    alignItems: "center",
    backgroundColor: "#557568",
    borderRadius: 20,
    flexDirection: "row",
    gap: 3,
    height: 48,
    justifyContent: "center",
    left: 4,
    paddingHorizontal: 10,
    position: "absolute",
    width: THUMB_WIDTH,
  },
  thumbText: { color: "#FFFFFF", flexShrink: 1, fontSize: 11, fontWeight: "900" },
});
