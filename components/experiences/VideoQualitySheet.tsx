import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Gauge, Sparkles } from "lucide-react-native";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";

export type VideoQualityChoice = "standard" | "hd";

const OPTIONS: {
  value: VideoQualityChoice;
  title: string;
  resolution: string;
  description: string;
  badge?: string;
  Icon: typeof Gauge;
}[] = [
  {
    badge: "Recommended",
    description: "Fast on mobile data. Clear on every phone.",
    Icon: Gauge,
    resolution: "720p",
    title: "Standard",
    value: "standard",
  },
  {
    description: "More detail, bigger file. Best on Wi-Fi.",
    Icon: Sparkles,
    resolution: "1080p",
    title: "HD",
    value: "hd",
  },
];

type Props = {
  visible: boolean;
  initial?: VideoQualityChoice;
  onChoose: (quality: VideoQualityChoice) => void;
  onClose: () => void;
};

/**
 * Bottom sheet that asks Standard or HD before the video picker opens. Solid cream background
 * (no blur) so the text stays readable on every phone.
 */
export function VideoQualitySheet({ visible, initial = "standard", onChoose, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<VideoQualityChoice>(initial);

  useEffect(() => {
    if (visible) setSelected(initial);
  }, [initial, visible]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.handle} />
          <Text accessibilityRole="header" style={styles.title}>
            Choose video quality
          </Text>
          <Text style={styles.subtitle}>You can trim the video in the next step. Up to 3 minutes and 150 MB.</Text>

          <View accessibilityRole="radiogroup" style={styles.options}>
            {OPTIONS.map(({ badge, description, Icon, resolution, title, value }) => {
              const active = selected === value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  key={value}
                  onPress={() => setSelected(value)}
                  style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.pressed]}
                >
                  <View style={[styles.optionIcon, active && styles.optionIconActive]}>
                    <Icon color={active ? "#FFFFFF" : "#C2410C"} size={20} strokeWidth={2.4} />
                  </View>
                  <View style={styles.optionCopy}>
                    <View style={styles.optionTitleRow}>
                      <Text style={styles.optionTitle}>{title}</Text>
                      <Text style={styles.optionResolution}>{resolution}</Text>
                      {badge ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.optionDescription}>{description}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <Check color="#FFFFFF" size={14} strokeWidth={3} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => onChoose(selected)}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <LinearGradient colors={["#F97316", "#C2410C"]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.primaryFill}>
              <Text style={styles.primaryText}>Choose video</Text>
            </LinearGradient>
          </Pressable>

          <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.secondary}>
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(28, 25, 23, 0.55)" },
  badge: { backgroundColor: "#FFEDD5", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: "#9A3412", fontSize: 11, fontWeight: "800" },
  handle: { alignSelf: "center", backgroundColor: EXPERIENCE_THEME.border, borderRadius: 3, height: 5, marginBottom: 14, width: 44 },
  option: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  optionActive: { backgroundColor: "#FFF4E8", borderColor: "#C2410C" },
  optionCopy: { flex: 1 },
  optionDescription: { color: EXPERIENCE_THEME.paragraph, fontSize: 13, fontWeight: "600", lineHeight: 18, marginTop: 3 },
  optionIcon: { alignItems: "center", backgroundColor: "#FFEDD5", borderRadius: 12, height: 42, justifyContent: "center", width: 42 },
  optionIconActive: { backgroundColor: "#C2410C" },
  optionResolution: { color: "#9A3412", fontSize: 13, fontWeight: "700" },
  optionTitle: { color: EXPERIENCE_THEME.heading, fontSize: 16, fontWeight: "900" },
  optionTitleRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  options: { gap: 10, marginTop: 18 },
  pressed: { opacity: 0.8 },
  primary: { borderRadius: 14, marginTop: 20, overflow: "hidden" },
  primaryFill: { alignItems: "center", paddingVertical: 15 },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  radio: {
    alignItems: "center",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  radioActive: { backgroundColor: "#C2410C", borderColor: "#C2410C" },
  root: { flex: 1, justifyContent: "flex-end" },
  secondary: { alignItems: "center", paddingVertical: 12 },
  secondaryText: { color: "#9A3412", fontSize: 15, fontWeight: "800" },
  sheet: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  subtitle: { color: EXPERIENCE_THEME.paragraph, fontSize: 14, fontWeight: "600", lineHeight: 20, marginTop: 6 },
  title: { color: EXPERIENCE_THEME.heading, fontSize: 20, fontWeight: "900" },
});
