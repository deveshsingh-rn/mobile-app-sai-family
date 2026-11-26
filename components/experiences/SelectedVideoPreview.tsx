import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Clock3, HardDrive, Play, SlidersHorizontal, Wifi } from "lucide-react-native";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import { loadVideoPoster, type VideoPoster } from "@/services/video-thumbnails";
import { estimateUploadSeconds, formatBytes, formatEta, formatVideoDuration } from "@/utils/chunk-upload";
import { cardAspectRatio } from "@/utils/media-layout";
import type { VideoQualityChoice } from "./VideoQualitySheet";

/** Typical uplink speeds used for the "time to upload" estimate (assumptions, not measured). */
const MOBILE_DATA_MBPS = 5;

type Props = {
  uri: string;
  durationMs?: number | null;
  sizeBytes?: number;
  quality?: VideoQualityChoice;
  onChangeQuality: () => void;
};

/**
 * The picked video on the post screen: its real first frame (in its own shape), the length on the
 * frame, and three facts the devotee needs before posting — length, size and upload time.
 */
export function SelectedVideoPreview({ uri, durationMs, sizeBytes, quality, onChangeQuality }: Props) {
  const [poster, setPoster] = useState<VideoPoster | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setPoster(null);
    setLoading(true);
    void loadVideoPoster(uri).then((result) => {
      if (!active) return;
      setPoster(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [uri]);

  const duration = formatVideoDuration(durationMs);
  const qualityLabel = quality === "hd" ? "HD · 1080p" : "Standard · 720p";

  return (
    <View>
      <View style={[styles.frame, { aspectRatio: cardAspectRatio(poster?.width, poster?.height) }]}>
        {poster ? <Image contentFit="contain" source={poster.thumbnail} style={StyleSheet.absoluteFill} /> : null}
        {loading ? <ActivityIndicator color="#FED7AA" style={StyleSheet.absoluteFill} /> : null}

        <View style={styles.play}>
          <Play color="#FFFFFF" fill="#FFFFFF" size={22} />
        </View>

        <View style={[styles.chip, styles.chipTopLeft]}>
          <Text style={styles.chipText}>{qualityLabel}</Text>
        </View>
        {durationMs ? (
          <View style={[styles.chip, styles.chipBottomLeft]}>
            <Text style={styles.chipText}>{duration}</Text>
          </View>
        ) : null}
      </View>

      {sizeBytes ? (
        <View style={styles.facts}>
          <View style={styles.factRow}>
            <Fact icon={<Clock3 color="#C2410C" size={15} strokeWidth={2.4} />} label="Length" value={duration} />
            <Fact icon={<HardDrive color="#C2410C" size={15} strokeWidth={2.4} />} label="Size" value={formatBytes(sizeBytes)} />
            <Fact
              icon={<Wifi color="#C2410C" size={15} strokeWidth={2.4} />}
              label="On 4G"
              value={formatEta(estimateUploadSeconds(sizeBytes, MOBILE_DATA_MBPS)).replace("about ", "~")}
            />
          </View>
          <Pressable
            accessibilityHint="Choose Standard or HD and pick the video again"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onChangeQuality}
            style={({ pressed }) => [styles.change, pressed && styles.pressed]}
          >
            <SlidersHorizontal color="#9A3412" size={15} strokeWidth={2.4} />
            <Text style={styles.changeText}>Change quality</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={styles.fact}>
      {icon}
      <Text numberOfLines={1} style={styles.factValue}>
        {value}
      </Text>
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  change: { alignItems: "center", alignSelf: "center", flexDirection: "row", gap: 6, marginTop: 12, paddingVertical: 4 },
  changeText: { color: "#9A3412", fontSize: 14, fontWeight: "800" },
  chip: { backgroundColor: "rgba(28, 25, 23, 0.72)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, position: "absolute" },
  chipBottomLeft: { bottom: 12, left: 12 },
  chipText: { color: "#FFFFFF", fontSize: 12, fontVariant: ["tabular-nums"], fontWeight: "800" },
  chipTopLeft: { left: 12, top: 12 },
  fact: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    paddingVertical: 10,
  },
  factLabel: { color: "#8A7461", fontSize: 11, fontWeight: "700" },
  factRow: { flexDirection: "row", gap: 8 },
  factValue: { color: EXPERIENCE_THEME.heading, fontSize: 15, fontVariant: ["tabular-nums"], fontWeight: "900" },
  facts: { padding: 12 },
  frame: { backgroundColor: "#1C1917", overflow: "hidden", width: "100%" },
  play: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(194, 65, 12, 0.85)",
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 30,
    borderWidth: 2,
    height: 60,
    justifyContent: "center",
    marginTop: -30,
    paddingLeft: 3,
    position: "absolute",
    top: "50%",
    width: 60,
  },
  pressed: { opacity: 0.7 },
});
