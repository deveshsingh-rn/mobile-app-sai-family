import React, { useRef, useState } from "react";
import { type GestureResponderEvent, StyleSheet, Text, View } from "react-native";

import { formatPlaybackTime, seekTimeFromTouch } from "@/utils/reels";

type Props = {
  bufferedPosition: number;
  currentTime: number;
  duration: number;
  onScrubChange?: (scrubbing: boolean) => void;
  onSeek: (seconds: number) => void;
};

/** Thin progress bar with a buffered track; touch or drag anywhere on it to seek. */
export function ReelSeekBar({ bufferedPosition, currentTime, duration, onScrubChange, onSeek }: Props) {
  const width = useRef(0);
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const shownTime = scrubTime ?? currentTime;
  const progress = duration > 0 ? Math.min(1, shownTime / duration) : 0;
  const buffered = duration > 0 ? Math.min(1, bufferedPosition / duration) : 0;

  const timeAt = (event: GestureResponderEvent) => seekTimeFromTouch(event.nativeEvent.locationX, width.current, duration);

  return (
    <View style={styles.wrap}>
      <View
        accessibilityLabel={`Video position ${formatPlaybackTime(shownTime)} of ${formatPlaybackTime(duration)}`}
        accessibilityRole="adjustable"
        hitSlop={{ bottom: 14, top: 14 }}
        onLayout={(event) => {
          width.current = event.nativeEvent.layout.width;
        }}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          onScrubChange?.(true);
          setScrubTime(timeAt(event));
        }}
        onResponderMove={(event) => setScrubTime(timeAt(event))}
        onResponderRelease={(event) => {
          onSeek(timeAt(event));
          setScrubTime(null);
          onScrubChange?.(false);
        }}
        onResponderTerminate={() => {
          setScrubTime(null);
          onScrubChange?.(false);
        }}
        onStartShouldSetResponder={() => duration > 0}
        style={styles.track}
      >
        <View style={[styles.buffered, { width: `${buffered * 100}%` }]} />
        <View style={[styles.played, { width: `${progress * 100}%` }]} />
        <View style={[styles.thumb, scrubTime !== null && styles.thumbActive, { left: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.time}>
        {formatPlaybackTime(shownTime)} / {formatPlaybackTime(duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buffered: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 2,
  },
  played: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F59E0B",
    borderRadius: 2,
  },
  thumb: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    height: 12,
    marginLeft: -6,
    position: "absolute",
    top: -4,
    width: 12,
  },
  thumbActive: {
    borderRadius: 9,
    height: 18,
    marginLeft: -9,
    top: -7,
    width: 18,
  },
  time: {
    color: "#FFFFFF",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
    marginTop: 8,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 4,
  },
  track: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    height: 4,
    width: "100%",
  },
  wrap: {
    paddingHorizontal: 16,
  },
});
