import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreVertical,
  Pause,
  Play,
  Repeat2,
  Rewind,
  FastForward,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react-native";

import type { Experience } from "@/store/experiences/types";
import { doubleTapZone, HOLD_TO_FAST_RATE, SEEK_STEP_SECONDS } from "@/utils/reels";
import { ReelSeekBar } from "./ReelSeekBar";

export type ReelControls = {
  enterFullscreen: () => void;
  setPlaybackRate: (rate: number) => void;
  startPictureInPicture: () => void;
  playbackRate: number;
};

type Props = {
  bottomInset: number;
  topInset: number;
  height: number;
  isActive: boolean;
  isPaused: boolean;
  item: Experience;
  muted: boolean;
  onComment: () => void;
  onControlsReady: (id: string, controls: ReelControls | null) => void;
  onLike: (forceLike?: boolean) => void;
  onMore: () => void;
  onRepost: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onToggleMute: () => void;
  shouldLoad: boolean;
  width: number;
};

const DOUBLE_TAP_MS = 260;

function compactCount(value: number) {
  if (!value) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

/** One full-screen reel. The video player exists only while `shouldLoad` (active or next). */
export function ReelItem(props: Props) {
  const { height, item, shouldLoad, width } = props;
  const video = item.mediaAttachments?.find((media) => media.type === "video");

  return (
    <View style={[styles.page, { height, width }]}>
      {shouldLoad && video?.url ? (
        <ReelPlayer {...props} url={video.url} />
      ) : (
        <View style={styles.placeholder}>
          {video?.thumbnailUrl ? <Image source={{ uri: video.thumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
        </View>
      )}
    </View>
  );
}

function ReelPlayer({
  bottomInset,
  isActive,
  isPaused,
  item,
  muted,
  onBookmark,
  onComment,
  onControlsReady,
  onLike,
  onMore,
  onRepost,
  onShare,
  onToggleMute,
  topInset,
  url,
  width,
}: Props & { url: string }) {
  const videoViewRef = useRef<VideoView>(null);
  const player = useVideoPlayer(url, (created) => {
    created.loop = true;
    created.timeUpdateEventInterval = 0.25;
    created.muted = muted;
  });

  const { status } = useEvent(player, "statusChange", { status: player.status });
  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });
  const time = useEvent(player, "timeUpdate", {
    bufferedPosition: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    currentTime: 0,
  });

  const [userPaused, setUserPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [holdingFast, setHoldingFast] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [seekFlash, setSeekFlash] = useState<"back" | "forward" | null>(null);
  const [captionOpen, setCaptionOpen] = useState(false);
  const heart = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldPlay = isActive && !isPaused && !userPaused && !scrubbing;

  // Only the visible reel plays. Leaving a reel resets it, like other reel apps.
  useEffect(() => {
    if (shouldPlay) player.play();
    else player.pause();
  }, [player, shouldPlay]);

  useEffect(() => {
    if (!isActive) {
      setUserPaused(false);
      player.currentTime = 0;
    }
  }, [isActive, player]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    player.playbackRate = holdingFast ? HOLD_TO_FAST_RATE : rate;
  }, [holdingFast, player, rate]);

  useEffect(() => {
    if (!isActive) return;
    onControlsReady(item.id, {
      enterFullscreen: () => void videoViewRef.current?.enterFullscreen(),
      playbackRate: rate,
      setPlaybackRate: setRate,
      startPictureInPicture: () => void videoViewRef.current?.startPictureInPicture(),
    });
    return () => onControlsReady(item.id, null);
  }, [isActive, item.id, onControlsReady, rate]);

  useEffect(
    () => () => {
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
    },
    []
  );

  const burstHeart = () => {
    heart.setValue(0);
    Animated.sequence([
      Animated.spring(heart, { friction: 4, toValue: 1, useNativeDriver: true }),
      Animated.timing(heart, { delay: 350, duration: 250, toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const seek = (direction: "back" | "forward") => {
    player.seekBy(direction === "back" ? -SEEK_STEP_SECONDS : SEEK_STEP_SECONDS);
    setSeekFlash(direction);
    setTimeout(() => setSeekFlash(null), 500);
  };

  const handlePress = (event: GestureResponderEvent) => {
    const now = Date.now();
    const x = event.nativeEvent.locationX;
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      const zone = doubleTapZone(x, width);
      if (zone === "like") {
        burstHeart();
        onLike(true);
      } else {
        seek(zone);
      }
      return;
    }
    lastTap.current = now;
    singleTapTimer.current = setTimeout(() => setUserPaused((paused) => !paused), DOUBLE_TAP_MS);
  };

  const video = item.mediaAttachments?.find((media) => media.type === "video");
  const isLoading = status === "loading" || status === "idle";
  const author = item.authorName || "Sai devotee";
  const avatar = item.authorProfileImageUrl;

  return (
    <>
      <VideoView
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
        nativeControls={false}
        player={player}
        ref={videoViewRef}
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        accessibilityHint="Tap to pause or play. Double tap the middle to like, the sides to skip 10 seconds. Hold for 2x speed."
        accessibilityLabel={`Video by ${author}`}
        delayLongPress={350}
        onLongPress={() => setHoldingFast(true)}
        onPress={handlePress}
        onPressOut={() => setHoldingFast(false)}
        style={StyleSheet.absoluteFill}
      />

      {isActive && isLoading ? <ActivityIndicator color="#FFFFFF" size="large" style={styles.center} /> : null}

      {status === "error" ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void player.replaceAsync(url)}
          style={[styles.center, styles.errorBox]}
        >
          <Text style={styles.errorTitle}>Video could not load</Text>
          <Text style={styles.errorText}>Tap to try again</Text>
        </Pressable>
      ) : null}

      {userPaused && !isPlaying && status === "readyToPlay" ? (
        <View pointerEvents="none" style={[styles.center, styles.bigIcon]}>
          <Play color="#FFFFFF" fill="#FFFFFF" size={34} />
        </View>
      ) : null}

      {holdingFast ? (
        <View pointerEvents="none" style={styles.fastBadge}>
          <FastForward color="#FFFFFF" size={14} />
          <Text style={styles.fastText}>{HOLD_TO_FAST_RATE}x</Text>
        </View>
      ) : null}

      {seekFlash ? (
        <View pointerEvents="none" style={[styles.seekFlash, seekFlash === "back" ? styles.seekLeft : styles.seekRight]}>
          {seekFlash === "back" ? <Rewind color="#FFFFFF" size={22} /> : <FastForward color="#FFFFFF" size={22} />}
          <Text style={styles.seekText}>{SEEK_STEP_SECONDS}s</Text>
        </View>
      ) : null}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.center,
          { opacity: heart, transform: [{ scale: heart.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.2] }) }] },
        ]}
      >
        <Heart color="#FFFFFF" fill="#EF4444" size={96} />
      </Animated.View>

      <Pressable
        accessibilityLabel={muted ? "Unmute" : "Mute"}
        accessibilityRole="button"
        hitSlop={10}
        onPress={onToggleMute}
        style={[styles.muteButton, { top: topInset + 10 }]}
      >
        {muted ? <VolumeX color="#FFFFFF" size={20} /> : <Volume2 color="#FFFFFF" size={20} />}
      </Pressable>

      <View style={[styles.rail, { bottom: bottomInset + 96 }]}>
        <RailButton
          active={item.likedByMe}
          count={item.likes}
          icon={<Heart color={item.likedByMe ? "#EF4444" : "#FFFFFF"} fill={item.likedByMe ? "#EF4444" : "transparent"} size={30} />}
          label={item.likedByMe ? "Unlike" : "Like"}
          onPress={() => onLike()}
        />
        <RailButton count={item.comments} icon={<MessageCircle color="#FFFFFF" size={29} />} label="Comments" onPress={onComment} />
        <RailButton
          active={item.repostedByMe}
          count={item.reposts}
          icon={<Repeat2 color={item.repostedByMe ? "#F59E0B" : "#FFFFFF"} size={29} />}
          label={item.repostedByMe ? "Undo repost" : "Repost"}
          onPress={onRepost}
        />
        <RailButton icon={<Send color="#FFFFFF" size={27} />} label="Share" onPress={onShare} />
        <RailButton
          active={item.bookmarkedByMe}
          icon={<Bookmark color={item.bookmarkedByMe ? "#F59E0B" : "#FFFFFF"} fill={item.bookmarkedByMe ? "#F59E0B" : "transparent"} size={28} />}
          label={item.bookmarkedByMe ? "Remove bookmark" : "Bookmark"}
          onPress={onBookmark}
        />
        <RailButton icon={<MoreVertical color="#FFFFFF" size={26} />} label="More options" onPress={onMore} />
      </View>

      <View style={[styles.bottom, { paddingBottom: bottomInset + 14 }]}>
        <View style={styles.authorRow}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{author.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text numberOfLines={1} style={styles.author}>
            {author}
          </Text>
          {rate !== 1 ? <Text style={styles.rateTag}>{rate}x</Text> : null}
          {!isPlaying && !userPaused && status === "readyToPlay" && isActive ? <Pause color="#FFFFFF" size={14} /> : null}
        </View>

        {item.content ? (
          <Text numberOfLines={captionOpen ? 8 : 2} onPress={() => setCaptionOpen((open) => !open)} style={styles.caption}>
            {item.content}
          </Text>
        ) : null}

        {video ? (
          <ReelSeekBar
            bufferedPosition={time.bufferedPosition}
            currentTime={time.currentTime}
            duration={player.duration}
            onScrubChange={setScrubbing}
            onSeek={(seconds) => {
              player.currentTime = seconds;
            }}
          />
        ) : null}
      </View>
    </>
  );
}

function RailButton({
  active,
  count,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  count?: number;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(active) }}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.railButton, pressed && styles.pressed]}
    >
      {icon}
      {count !== undefined ? <Text style={styles.railCount}>{compactCount(count)}</Text> : null}
    </Pressable>
  );
}

const shadowText = {
  textShadowColor: "rgba(0,0,0,0.65)",
  textShadowOffset: { height: 1, width: 0 },
  textShadowRadius: 4,
} as const;

const styles = StyleSheet.create({
  author: {
    ...shadowText,
    color: "#FFFFFF",
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  authorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingRight: 80,
  },
  avatar: {
    borderColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1.5,
    height: 34,
    width: 34,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#C2410C",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  bigIcon: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  bottom: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  caption: {
    ...shadowText,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 12,
    paddingLeft: 16,
    paddingRight: 80,
  },
  center: {
    alignSelf: "center",
    position: "absolute",
    top: "45%",
  },
  errorBox: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 14,
    padding: 16,
  },
  errorText: {
    color: "#E5E7EB",
    fontSize: 13,
    marginTop: 4,
  },
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  fastBadge: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    top: 110,
  },
  fastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  muteButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 14,
    width: 36,
  },
  page: {
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  placeholder: {
    backgroundColor: "#000000",
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  rail: {
    alignItems: "center",
    gap: 18,
    position: "absolute",
    right: 10,
  },
  railButton: {
    alignItems: "center",
    minWidth: 48,
  },
  railCount: {
    ...shadowText,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },
  rateTag: {
    backgroundColor: "rgba(245,158,11,0.9)",
    borderRadius: 8,
    color: "#1F1300",
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  seekFlash: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    position: "absolute",
    top: "42%",
    width: 80,
  },
  seekLeft: {
    left: 28,
  },
  seekRight: {
    right: 28,
  },
  seekText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
});
