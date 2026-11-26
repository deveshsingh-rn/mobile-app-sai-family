import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Check, CircleAlert, Lock, RotateCw, X } from "lucide-react-native";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import {
  cancelPendingVideoPost,
  retryPendingVideoPost,
  usePendingVideoPost,
  type PendingVideoPost,
} from "@/services/pending-video-post";
import { loadVideoPoster, type VideoPoster } from "@/services/video-thumbnails";
import { formatBytes, formatEta, uploadStats } from "@/utils/chunk-upload";
import { cardAspectRatio } from "@/utils/media-layout";

type Props = { authorName?: string | null; avatarUrl?: string | null };

const SAFFRON = "#C2410C";
const STEPS = ["Preparing", "Uploading", "Publishing"] as const;

/** Index of the current step: 0 preparing, 1 uploading, 2 publishing, 3 all done. */
function stepIndex(post: PendingVideoPost) {
  if (post.status === "published") return 3;
  if (post.status === "publishing") return 2;
  return post.sentBytes > 0 ? 1 : 0;
}

/**
 * The devotee's own video post while it uploads: shown at the top of their feed straight after
 * Publish. Steps Preparing → Uploading → Publishing, a progress bar with speed and time left, and
 * a short "Your video is live" moment. Nobody else sees the post until it is live.
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

  // Keep "time left" moving between progress events (at most one re-render per second).
  const uploading = post?.status === "uploading";
  useEffect(() => {
    if (!uploading) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [uploading]);

  if (!post) return null;

  const failed = post.status === "failed";
  const live = post.status === "published";
  const step = stepIndex(post);
  const fraction = post.totalBytes > 0 ? Math.min(1, post.sentBytes / post.totalBytes) : 0;
  const percent = step >= 2 ? 100 : Math.min(99, Math.round(fraction * 100));
  // Speed and time left count only this attempt (a resumed upload starts with bytes already stored).
  const attempt = uploadStats(post.sentBytes - post.startedBytes, post.totalBytes - post.startedBytes, now - post.startedAt);
  const name = authorName || "You";

  const confirmCancel = () =>
    Alert.alert(failed ? "Discard this video?" : "Stop uploading?", "Your video post will not be published.", [
      { style: "cancel", text: "Keep" },
      { onPress: cancelPendingVideoPost, style: "destructive", text: failed ? "Discard" : "Stop upload" },
    ]);

  return (
    <View accessibilityLiveRegion="polite" style={[styles.card, live && styles.cardLive]}>
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
          <View style={styles.privacy}>
            {live ? (
              <Text style={styles.privacyLive}>Shared with the Sai Family</Text>
            ) : (
              <>
                <Lock color="#8A7461" size={12} strokeWidth={2.4} />
                <Text style={styles.privacyText}>Only you can see this until it&apos;s live</Text>
              </>
            )}
          </View>
        </View>
        {live ? null : (
          <Pressable
            accessibilityLabel={failed ? "Discard video" : "Stop upload"}
            accessibilityRole="button"
            hitSlop={10}
            onPress={confirmCancel}
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
          >
            <X color={EXPERIENCE_THEME.heading} size={18} />
          </Pressable>
        )}
      </View>

      {post.content ? (
        <Text numberOfLines={3} style={styles.content}>
          {post.content}
        </Text>
      ) : null}

      {failed ? null : <Stepper current={step} />}

      <View style={[styles.media, { aspectRatio: cardAspectRatio(poster?.width, poster?.height) }]}>
        {poster ? <Image contentFit="contain" source={poster.thumbnail} style={StyleSheet.absoluteFill} /> : null}

        <View style={[styles.overlay, live && styles.overlayLive]}>
          {failed ? (
            <>
              <View style={styles.failedIcon}>
                <CircleAlert color="#FED7AA" size={26} strokeWidth={2.4} />
              </View>
              <Text style={styles.overlayTitle}>Upload paused</Text>
              <Text style={styles.overlayText}>
                {post.canResume && percent > 0
                  ? `It will continue from ${percent}%, nothing is lost.`
                  : post.error || "Check your connection and try again."}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={retryPendingVideoPost}
                style={({ pressed }) => [styles.resume, pressed && styles.pressed]}
              >
                <LinearGradient colors={["#F97316", SAFFRON]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.resumeFill}>
                  <RotateCw color="#FFFFFF" size={16} strokeWidth={2.6} />
                  <Text style={styles.resumeText}>{post.canResume ? "Resume upload" : "Try again"}</Text>
                </LinearGradient>
              </Pressable>
              {post.canResume && percent > 0 && post.error ? (
                <Text numberOfLines={2} style={styles.errorDetail}>
                  {post.error}
                </Text>
              ) : null}
            </>
          ) : live ? (
            <>
              <View style={styles.liveIcon}>
                <Check color="#FFFFFF" size={30} strokeWidth={3} />
              </View>
              <Text style={styles.overlayTitle}>Your video is live</Text>
              <Text style={styles.overlayText}>Sai Ram! Everyone can watch it now.</Text>
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
                <LinearGradient
                  colors={["#F59E0B", "#F97316"]}
                  end={{ x: 1, y: 0 }}
                  start={{ x: 0, y: 0 }}
                  style={[styles.fill, { width: `${Math.max(percent, 2)}%` }]}
                />
              </View>
              <Text style={styles.detail}>
                {step === 0
                  ? "Getting your video ready…"
                  : step === 2
                    ? "Almost done, publishing your post…"
                    : `${formatBytes(post.sentBytes)} of ${formatBytes(post.totalBytes)}`}
              </Text>
              {step === 1 && attempt.megabitsPerSecond > 0 ? (
                <Text style={styles.detailSoft}>
                  {attempt.megabitsPerSecond.toFixed(1)} Mbit/s
                  {attempt.remainingSeconds !== null ? ` · ${formatEta(attempt.remainingSeconds)} left` : ""}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </View>

      {uploading && step === 1 ? (
        <Text style={styles.footnote}>You can keep using the app. Keep it open until the upload finishes.</Text>
      ) : null}
    </View>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <View accessibilityLabel={`Step ${Math.min(current + 1, 3)} of 3: ${STEPS[Math.min(current, 2)]}`} style={styles.stepper}>
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <React.Fragment key={label}>
            {index > 0 ? <View style={[styles.stepLine, index <= current && styles.stepLineDone]} /> : null}
            <View style={styles.step}>
              <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]}>
                {done ? <Check color="#FFFFFF" size={11} strokeWidth={3.2} /> : null}
              </View>
              <Text style={[styles.stepLabel, (done || active) && styles.stepLabelOn]}>{label}</Text>
            </View>
          </React.Fragment>
        );
      })}
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
    elevation: 2,
    marginBottom: 12,
    marginHorizontal: 12,
    padding: 14,
    shadowColor: "#7C2D12",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardLive: { borderColor: SAFFRON },
  close: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  content: { color: EXPERIENCE_THEME.paragraph, fontSize: 15, fontWeight: "600", lineHeight: 22, marginTop: 10 },
  detail: { color: "#FFFFFF", fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "800", marginTop: 12, textAlign: "center" },
  detailSoft: { color: "#FED7AA", fontSize: 13, fontVariant: ["tabular-nums"], fontWeight: "700", marginTop: 4, textAlign: "center" },
  errorDetail: { color: "#E7D5C4", fontSize: 11, fontWeight: "600", marginTop: 10, textAlign: "center" },
  failedIcon: {
    alignItems: "center",
    backgroundColor: "rgba(194, 65, 12, 0.35)",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    marginBottom: 10,
    width: 52,
  },
  fill: { borderRadius: 5, height: "100%" },
  footnote: { color: "#8A7461", fontSize: 12, fontWeight: "600", lineHeight: 17, marginTop: 10, textAlign: "center" },
  header: { alignItems: "center", flexDirection: "row", gap: 10 },
  headerCopy: { flex: 1 },
  liveIcon: {
    alignItems: "center",
    backgroundColor: SAFFRON,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 30,
    borderWidth: 2,
    height: 60,
    justifyContent: "center",
    marginBottom: 12,
    width: 60,
  },
  media: {
    backgroundColor: "#1F1A17",
    borderRadius: 14,
    marginTop: 12,
    overflow: "hidden",
    width: "100%",
  },
  name: { color: EXPERIENCE_THEME.heading, fontSize: 15, fontWeight: "800" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(28, 25, 23, 0.62)",
    justifyContent: "center",
    padding: 20,
  },
  overlayLive: { backgroundColor: "rgba(124, 45, 18, 0.55)" },
  overlayText: { color: "#FFF8EC", fontSize: 14, fontWeight: "600", lineHeight: 20, marginTop: 6, textAlign: "center" },
  overlayTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900", textAlign: "center" },
  percent: { color: "#FFFFFF", fontSize: 46, fontVariant: ["tabular-nums"], fontWeight: "900" },
  pressed: { opacity: 0.75 },
  privacy: { alignItems: "center", flexDirection: "row", gap: 4, marginTop: 2 },
  privacyLive: { color: SAFFRON, fontSize: 12, fontWeight: "800" },
  privacyText: { color: "#8A7461", fontSize: 12, fontWeight: "700" },
  resume: { borderRadius: 12, marginTop: 16, overflow: "hidden" },
  resumeFill: { alignItems: "center", flexDirection: "row", gap: 8, paddingHorizontal: 22, paddingVertical: 12 },
  resumeText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  step: { alignItems: "center", gap: 5, minWidth: 70 },
  stepDot: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  stepDotActive: { borderColor: SAFFRON, borderWidth: 6 },
  stepDotDone: { backgroundColor: SAFFRON, borderColor: SAFFRON },
  stepLabel: { color: "#A8927D", fontSize: 11, fontWeight: "700" },
  stepLabelOn: { color: EXPERIENCE_THEME.heading, fontWeight: "800" },
  stepLine: { backgroundColor: EXPERIENCE_THEME.border, flex: 1, height: 2, marginBottom: 16 },
  stepLineDone: { backgroundColor: SAFFRON },
  stepper: { alignItems: "center", flexDirection: "row", marginTop: 14 },
  track: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 5,
    height: 10,
    marginTop: 12,
    overflow: "hidden",
    width: "82%",
  },
});
