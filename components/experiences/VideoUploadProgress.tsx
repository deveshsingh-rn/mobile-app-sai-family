import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import { formatBytes, formatEta, uploadStats } from "@/utils/chunk-upload";

type Props = {
  elapsedMs: number;
  onCancel: () => void;
  partCount: number;
  partsDone: number;
  sentBytes: number;
  totalBytes: number;
  visible: boolean;
};

/** Blocking progress sheet while a video uploads in parts. */
export function VideoUploadProgress({ elapsedMs, onCancel, partCount, partsDone, sentBytes, totalBytes, visible }: Props) {
  const stats = uploadStats(sentBytes, totalBytes, elapsedMs);
  const percent = Math.round(stats.fraction * 100);
  const finishing = partCount > 0 && partsDone >= partCount;

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View accessibilityLiveRegion="polite" style={styles.card}>
          <Text style={styles.title}>{finishing ? "Finishing your video…" : "Uploading your video"}</Text>
          <Text style={styles.percent}>{percent}%</Text>

          <View
            accessibilityLabel={`Upload progress ${percent} percent`}
            accessibilityRole="progressbar"
            accessibilityValue={{ max: 100, min: 0, now: percent }}
            style={styles.track}
          >
            <View style={[styles.fill, { width: `${percent}%` }]} />
          </View>

          <Text style={styles.detail}>
            {formatBytes(sentBytes)} of {formatBytes(totalBytes)}
            {partCount > 1 ? ` · part ${Math.min(partsDone + 1, partCount)} of ${partCount}` : ""}
          </Text>
          <Text style={styles.detail}>
            {finishing
              ? "Joining the parts"
              : stats.remainingSeconds !== null
                ? `${stats.megabitsPerSecond.toFixed(1)} Mbps · ${formatEta(stats.remainingSeconds)} left`
                : "Starting…"}
          </Text>

          <Text style={styles.hint}>Keep the app open until the upload finishes.</Text>

          {!finishing ? (
            <Pressable accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>Cancel upload</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(45, 28, 15, 0.55)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  cancel: {
    alignItems: "center",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
    minHeight: 46,
    justifyContent: "center",
  },
  cancelText: { color: "#9A3412", fontSize: 15, fontWeight: "800" },
  card: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    width: "100%",
  },
  detail: { color: EXPERIENCE_THEME.paragraph, fontSize: 14, fontWeight: "600", marginTop: 6, textAlign: "center" },
  fill: { backgroundColor: "#C2410C", borderRadius: 5, height: "100%" },
  hint: { color: "#8A7461", fontSize: 12, fontWeight: "600", marginTop: 12, textAlign: "center" },
  percent: { color: "#C2410C", fontSize: 40, fontVariant: ["tabular-nums"], fontWeight: "900", marginVertical: 6, textAlign: "center" },
  pressed: { opacity: 0.7 },
  title: { color: EXPERIENCE_THEME.heading, fontSize: 18, fontWeight: "900", textAlign: "center" },
  track: { backgroundColor: "#FED7AA", borderRadius: 5, height: 10, overflow: "hidden" },
});
