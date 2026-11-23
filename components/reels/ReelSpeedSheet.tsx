import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import { PLAYBACK_RATES } from "@/utils/reels";

type Props = {
  current: number;
  onClose: () => void;
  onPick: (rate: number) => void;
  visible: boolean;
};

/** Playback speed picker (same on iOS and Android; Android alerts allow only 3 buttons). */
export function ReelSpeedSheet({ current, onClose, onPick, visible }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Close playback speed" onPress={onClose} style={styles.backdrop} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.title}>Playback speed</Text>
        <View style={styles.row}>
          {PLAYBACK_RATES.map((rate) => {
            const selected = rate === current;
            return (
              <Pressable
                accessibilityLabel={`${rate} times speed`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={rate}
                onPress={() => {
                  onPick(rate);
                  onClose();
                }}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{rate === 1 ? "Normal" : `${rate}x`}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  chip: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 84,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipSelected: { backgroundColor: "#C2410C", borderColor: "#C2410C" },
  chipText: { color: EXPERIENCE_THEME.heading, fontSize: 15, fontWeight: "800" },
  chipTextSelected: { color: "#FFFFFF" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 14 },
  sheet: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 18,
    position: "absolute",
    right: 0,
  },
  title: { color: EXPERIENCE_THEME.heading, fontSize: 18, fontWeight: "900", textAlign: "center" },
});
