import { ChevronRight, ChevronsRight } from "lucide-react-native";
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

const THUMB_SIZE = 72;

export function SwipeNaamCounter({ disabled, label, onCount }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isCompletingRef = useRef(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const maxTravel = Math.max(0, trackWidth - THUMB_SIZE - 16);

  const reset = useCallback(() => {
    Animated.spring(translateX, {
      damping: 20,
      stiffness: 190,
      toValue: 0,
      useNativeDriver: true,
    }).start(() => setIsSwiping(false));
  }, [translateX]);

  const completeSwipe = useCallback(() => {
    if (isCompletingRef.current) return;

    isCompletingRef.current = true;
    Animated.timing(translateX, {
      duration: 140,
      toValue: maxTravel,
      useNativeDriver: true,
    }).start(() => {
      onCount();
      Animated.spring(translateX, {
        damping: 18,
        delay: 110,
        stiffness: 170,
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        isCompletingRef.current = false;
        setIsSwiping(false);
      });
    });
  }, [maxTravel, onCount, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !disabled &&
          !isCompletingRef.current &&
          gesture.dx > 4 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 0.8,
        onPanResponderGrant: () => setIsSwiping(true),
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(Math.min(maxTravel, Math.max(0, gesture.dx)));
        },
        onPanResponderRelease: (_, gesture) => {
          const passedDistance = gesture.dx >= Math.min(86, maxTravel * 0.38);
          const quickIntentionalSwipe = gesture.dx > 34 && gesture.vx > 0.5;

          if (maxTravel > 0 && (passedDistance || quickIntentionalSwipe)) {
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
      <View pointerEvents="none" style={styles.copy}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.76}
          numberOfLines={2}
          style={styles.naam}
        >
          {label}
        </Text>
        <Text style={styles.instruction}>
          {disabled ? "Daily goal complete" : "Swipe right to count one Naam"}
        </Text>
      </View>
      <ChevronsRight
        color={disabled ? "#9BA49F" : "#789083"}
        pointerEvents="none"
        size={25}
        style={styles.endIcon}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.thumb, { transform: [{ translateX }] }]}
      >
        <ChevronRight color="#FFFFFF" size={32} strokeWidth={2.5} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: "rgba(255,255,255,0.9)",
    borderCurve: "continuous",
    borderRadius: 28,
    borderWidth: 1,
    height: 104,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  activeTrack: { backgroundColor: "rgba(255,255,255,0.9)", borderColor: "#D4E2DA" },
  disabled: { opacity: 0.72 },
  copy: { left: 92, position: "absolute", right: 50 },
  naam: {
    color: "#29463D",
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 25,
    textAlign: "center",
  },
  instruction: {
    color: "#65726C",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "center",
  },
  endIcon: { position: "absolute", right: 14 },
  thumb: {
    alignItems: "center",
    backgroundColor: "#557568",
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    height: THUMB_SIZE,
    justifyContent: "center",
    left: 8,
    position: "absolute",
    shadowColor: "#29463D",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: THUMB_SIZE,
  },
});
