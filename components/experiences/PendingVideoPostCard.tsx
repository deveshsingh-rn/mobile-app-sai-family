import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { RotateCw, X } from "lucide-react-native";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import {
  cancelPendingVideoPost,
  retryPendingVideoPost,
  usePendingVideoPost,
} from "@/services/pending-video-post";
import { loadVideoPoster, type VideoPoster } from "@/services/video-thumbnails";
import { formatBytes, formatEta, uploadStats } from "@/utils/chunk-upload";
import { cardAspectRatio } from "@/utils/media-layout";

type Props = { authorName?: string | null; avatarUrl?: string | null };

/**
 * The devotee's own video post while it uploads: shown at the top of their feed straight after
 * Publish, with the percentage. Nobody else sees the post until it reaches 100%.
 */
export function PendingVideoPostCard({ authorName, avatarUrl }: Props) {
  const post = usePendingVideoPost();
  const [poster, setPoster] = useState<VideoPoster | null>(null);
  const [now, setNow] = useState(Date.now());
  const uri = post?.video.uri;

  useEffect(() => {
    setPoster(null);
    if (!uri) return;
    let active = true;
    void loadVideoPoster(uri).then((result) => {
      if (active) setPoster(result);
    });
    return () => {
      active = false;
    };
  }, [uri]);

  // Keep "time left" moving between part completions.
  const uploading = post?.status === "uploading";
  useEffect(() => {
    if (!uploading) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [uploading]);

  if (!post) return null;

  const stats = uploadStats(post.sentBytes, post.totalBytes, now - post.startedAt);
  const percent = post.status === "publishing" ? 100 : Math.min(99, Math.round(stats.fraction * 100));
  const failed = post.status === "failed";
  const name = authorName || "You";

  const confirmCancel = () =>
    Alert.alert(failed ? "Discard this video?" : "Cancel upload?", "Your video post will not be published.", [
      { style: "cancel", text: "Keep" },
      { onPress: cancelPendingVideoPost, style: "destructive", text: failed ? "Discard" : "Cancel upload" },
    ]);

  return (
    <View accessibilityLiveRegion="polite" style={styles.card}>
      <View style={styles.header}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <Text style={[styles.status, failed && styles.statusFailed]}>
            {failed ? "Not uploaded" : post.status === "publishing" ? "Publishing…" : "Uploading · only you can see this"}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={failed ? "Discard video" : "Cancel upload"}
          accessibilityRole="button"
          hitSlop={10}
          onPress={confirmCancel}
          style={styles.close}
        >
          <X color={EXPERIENCE_THEME.heading} size={18} />
        </Pressable>
      </View>

      {post.content ? (
        <Text numberOfLines={3} style={styles.content}>
          {post.content}
        </Text>
      ) : null}

      <View style={[styles.media, { aspectRatio: cardAspectRatio(poster?.width, poster?.height) }]}>
        {poster ? <Image contentFit="contain" source={poster.thumbnail} style={StyleSheet.absoluteFill} /> : null}
        <View style={styles.overlay}>
          {failed ? (
            <>
              <Text style={styles.failedTitle}>Upload failed</Text>
              <Text style={styles.failedText}>{post.error}</Text>
              <Pressable accessibilityRole="button" onPress={retryPendingVideoPost} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
                <RotateCw color="#FFFFFF" size={16} />
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </>
          ) : (
            <>
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
                {post.status === "publishing"
                  ? "Finishing your video…"
                  : `${formatBytes(post.sentBytes)} of ${formatBytes(post.totalBytes)}${
                      stats.remainingSeconds !== null ? ` · ${formatEta(stats.remainingSeconds)} left` : ""
                    }`}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { borderRadius: 20, height: 40, width: 40 },
  avatarFallback: { alignItems: "center", backgroundColor: "#FED7AA", justifyContent: "center" },
  avatarText: { color: EXPERIENCE_THEME.heading, fontSize: 16, fontWeight: "900" },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FED7AA",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    marginHorizontal: 12,
    padding: 14,
  },
  close: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  content: { color: EXPERIENCE_THEME.paragraph, fontSize: 15, fontWeight: "600", lineHeight: 22, marginTop: 10 },
  detail: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginTop: 10, textAlign: "center" },
  failedText: { color: "#F3F4F6", fontSize: 13, fontWeight: "600", lineHeight: 18, marginTop: 6, textAlign: "center" },
  failedTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  fill: { backgroundColor: "#F59E0B", borderRadius: 4, height: "100%" },
  header: { alignItems: "center", flexDirection: "row", gap: 10 },
  headerCopy: { flex: 1 },
  media: {
    backgroundColor: "#1F1A17",
    borderRadius: 14,
    marginTop: 10,
    overflow: "hidden",
    width: "100%",
  },
  name: { color: EXPERIENCE_THEME.heading, fontSize: 15, fontWeight: "800" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  percent: { color: "#FFFFFF", fontSize: 44, fontVariant: ["tabular-nums"], fontWeight: "900" },
  pressed: { opacity: 0.75 },
  retry: {
    alignItems: "center",
    backgroundColor: "#C2410C",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  status: { color: "#8A7461", fontSize: 12, fontWeight: "700", marginTop: 2 },
  statusFailed: { color: "#B91C1C" },
  track: { backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, height: 8, marginTop: 10, overflow: "hidden", width: "80%" },
});
