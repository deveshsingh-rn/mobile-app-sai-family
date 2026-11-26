import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Platform,
  Pressable,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReelCommentsSheet } from "@/components/reels/ReelCommentsSheet";
import { ReelItem, type ReelControls } from "@/components/reels/ReelItem";
import { ReelSpeedSheet } from "@/components/reels/ReelSpeedSheet";
import { trackProductEvent } from "@/services/product-analytics";
import {
  apiFetchExperienceDetail,
  apiFetchVideoReels,
  apiReportExperience,
  apiToggleBookmark,
  apiToggleLike,
  apiToggleRepost,
  type ExperienceReportReason,
} from "@/services/experiences";
import { toggleBookmarkSuccess, toggleLikeSuccess, toggleRepostSuccess } from "@/store/experiences/actions";
import { flattenExperience } from "@/store/experiences/saga";
import type { Experience } from "@/store/experiences/types";
import { useAppDispatch } from "@/store/hooks";
import { createExperiencePublicShareLink, createExperienceShareMessage } from "@/utils/experience-links";
import { mergeReelPages, takeReelSeed } from "@/utils/reels";
import { requireAccount } from "@/services/login-prompt";

const PAGE_SIZE = 5;
/** Muted / unmuted is remembered while the app is open (not across launches). */
let sessionMuted = false;

/**
 * Full-screen vertical video player ("Reels"). Opened by tapping a video in the feed: that post is
 * shown first, older video posts follow as the user swipes up. Only the visible reel plays and
 * only the next one is preloaded (data and memory on mid-range Android / 4G).
 */
export default function ReelsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const isFocused = useIsFocused();

  const [reels, setReels] = useState<Experience[]>(() => {
    const seed = takeReelSeed<Experience>();
    return seed ? [seed] : [];
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [appActive, setAppActive] = useState(AppState.currentState === "active");
  const [muted, setMuted] = useState(sessionMuted);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [speedSheetOpen, setSpeedSheetOpen] = useState(false);
  const controls = useRef<{ id: string; value: ReelControls } | null>(null);
  const viewed = useRef(new Set<string>());

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => setAppActive(state === "active"));
    return () => subscription.remove();
  }, []);

  // Deep link or app restore without a seed: load the post itself first.
  useEffect(() => {
    if (reels.length || !params.id) return;
    apiFetchExperienceDetail(params.id)
      .then((data) => {
        const experience = data?.experience ?? data;
        if (experience?.id) setReels([flattenExperience(experience) as Experience]);
      })
      .catch(() => setLoadError("This video could not be opened."));
  }, [params.id, reels.length]);

  const loadMore = useCallback(async () => {
    const last = reels[reels.length - 1];
    if (!last || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await apiFetchVideoReels({ cursor: last.id, limit: PAGE_SIZE });
      const next = (data.reels ?? []).map((item) => flattenExperience(item) as Experience);
      setReels((current) => mergeReelPages(current, next));
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch {
      // Swiping again retries; the current reel keeps playing.
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, reels]);

  // Fetch the following reels as soon as the first one is on screen.
  useEffect(() => {
    if (reels.length === 1) void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reels.length === 1]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visible = viewableItems.find((entry) => entry.isViewable);
    if (visible?.index != null) setActiveIndex(visible.index);
  }).current;

  const activeReel = reels[activeIndex];
  useEffect(() => {
    if (!activeReel || viewed.current.has(activeReel.id)) return;
    viewed.current.add(activeReel.id);
    trackProductEvent("Reel Viewed", { position: activeIndex });
  }, [activeIndex, activeReel]);

  const updateReel = (id: string, change: (item: Experience) => Experience) =>
    setReels((current) => current.map((item) => (item.id === id ? change(item) : item)));

  const handleLike = async (item: Experience, forceLike = false) => {
    if (forceLike && item.likedByMe) return; // double tap only likes, never unlikes
    if (!requireAccount("like")) return;
    const liked = !item.likedByMe;
    updateReel(item.id, (current) => ({ ...current, likedByMe: liked, likes: Math.max(0, current.likes + (liked ? 1 : -1)) }));
    try {
      const response = await apiToggleLike(item.id);
      const likes = response?._count?.likes ?? item.likes + (liked ? 1 : -1);
      const likedByMe = response?.liked ?? liked;
      updateReel(item.id, (current) => ({ ...current, likedByMe, likes }));
      dispatch(toggleLikeSuccess(item.id, likes, likedByMe));
      if (likedByMe) trackProductEvent("Reel Liked");
    } catch {
      updateReel(item.id, (current) => ({ ...current, likedByMe: item.likedByMe, likes: item.likes }));
    }
  };

  const handleBookmark = async (item: Experience) => {
    if (!requireAccount("bookmark")) return;
    const bookmarked = !item.bookmarkedByMe;
    updateReel(item.id, (current) => ({ ...current, bookmarkedByMe: bookmarked }));
    try {
      const response = await apiToggleBookmark(item.id);
      const bookmarkedByMe = response?.bookmarked ?? bookmarked;
      const bookmarks = response?._count?.bookmarks ?? item.bookmarks;
      updateReel(item.id, (current) => ({ ...current, bookmarkedByMe, bookmarks }));
      dispatch(toggleBookmarkSuccess(item.id, bookmarks, bookmarkedByMe));
    } catch {
      updateReel(item.id, (current) => ({ ...current, bookmarkedByMe: item.bookmarkedByMe }));
    }
  };

  const handleRepost = async (item: Experience) => {
    if (!requireAccount("repost")) return;
    const reposted = !item.repostedByMe;
    updateReel(item.id, (current) => ({ ...current, repostedByMe: reposted, reposts: Math.max(0, current.reposts + (reposted ? 1 : -1)) }));
    try {
      const response = await apiToggleRepost(item.id);
      const repostedByMe = response?.reposted ?? reposted;
      const reposts = response?._count?.reposts ?? item.reposts + (reposted ? 1 : -1);
      updateReel(item.id, (current) => ({ ...current, repostedByMe, reposts }));
      dispatch(toggleRepostSuccess(item.id, reposts, repostedByMe));
    } catch {
      updateReel(item.id, (current) => ({ ...current, repostedByMe: item.repostedByMe, reposts: item.reposts }));
    }
  };

  const handleShare = async (item: Experience) => {
    try {
      const result = await Share.share({
        message: createExperienceShareMessage({ authorName: item.authorName, content: item.content, experienceId: item.id }),
        title: "Sai Family Experience",
        url: createExperiencePublicShareLink(item.id),
      });
      if (result.action === Share.sharedAction) trackProductEvent("Reel Shared");
    } catch {
      // Share sheet dismissed or unavailable.
    }
  };

  const report = async (item: Experience, reason: ExperienceReportReason) => {
    if (!requireAccount("report")) return;
    try {
      const result = await apiReportExperience(item.id, reason);
      Alert.alert("Report received", result.alreadyReported ? "You have already reported this post." : "Thank you. Our team will review this post.");
    } catch {
      Alert.alert("Could not send report", "Please try again later.");
    }
  };

  const chooseSpeed = () => {
    if (controls.current) setSpeedSheetOpen(true);
  };

  const showMore = (item: Experience) => {
    const actions: { label: string; run: () => void; destructive?: boolean }[] = [
      { label: "Playback speed", run: chooseSpeed },
      { label: "Full screen", run: () => controls.current?.value.enterFullscreen() },
      { label: "Picture in picture", run: () => controls.current?.value.startPictureInPicture() },
      { destructive: true, label: "Report", run: () => void report(item, "unsafe_content") },
    ];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          cancelButtonIndex: actions.length,
          destructiveButtonIndex: actions.findIndex((action) => action.destructive),
          options: [...actions.map((action) => action.label), "Cancel"],
        },
        (index) => actions[index]?.run()
      );
    } else {
      Alert.alert("Video options", undefined, [
        ...actions.slice(0, 2).map((action) => ({ onPress: action.run, text: action.label })),
        { onPress: actions[3].run, style: "destructive" as const, text: "Report" },
      ]);
    }
  };

  const onControlsReady = useCallback((id: string, value: ReelControls | null) => {
    if (value) controls.current = { id, value };
    else if (controls.current?.id === id) controls.current = null;
  }, []);

  const toggleMute = () => {
    sessionMuted = !muted;
    setMuted(sessionMuted);
  };

  const screenPaused = !isFocused || !appActive || Boolean(commentsFor);
  const currentRate = controls.current?.value.playbackRate ?? 1;

  if (!reels.length) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="light-content" />
        {loadError ? <Text style={styles.message}>{loadError}</Text> : <ActivityIndicator color="#FFFFFF" size="large" />}
        <BackButton top={insets.top} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={reels}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ index, length: height, offset: height * index })}
        initialNumToRender={1}
        keyExtractor={(item) => item.id}
        maxToRenderPerBatch={2}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={1.5}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        removeClippedSubviews
        renderItem={({ index, item }) => (
          <ReelItem
            bottomInset={insets.bottom}
            topInset={insets.top}
            height={height}
            isActive={index === activeIndex}
            isPaused={screenPaused}
            item={item}
            muted={muted}
            onBookmark={() => void handleBookmark(item)}
            onComment={() => setCommentsFor(item.id)}
            onControlsReady={onControlsReady}
            onLike={(forceLike) => void handleLike(item, forceLike)}
            onMore={() => showMore(item)}
            onRepost={() => void handleRepost(item)}
            onShare={() => void handleShare(item)}
            onToggleMute={toggleMute}
            shouldLoad={index === activeIndex || index === activeIndex + 1}
            width={width}
          />
        )}
        showsVerticalScrollIndicator={false}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        windowSize={3}
      />

      <BackButton top={insets.top} />

      <ReelSpeedSheet
        current={currentRate}
        onClose={() => setSpeedSheetOpen(false)}
        onPick={(rate) => controls.current?.value.setPlaybackRate(rate)}
        visible={speedSheetOpen}
      />

      <ReelCommentsSheet
        experienceId={commentsFor}
        onClose={() => setCommentsFor(null)}
        onCommentAdded={(id) => updateReel(id, (item) => ({ ...item, comments: item.comments + 1 }))}
      />
    </View>
  );
}

function BackButton({ top }: { top: number }) {
  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      hitSlop={10}
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/experiences"))}
      style={[styles.back, { top: top + 8 }]}
    >
      <ArrowLeft color="#FFFFFF" size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    left: 12,
    position: "absolute",
    width: 40,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  root: {
    backgroundColor: "#000000",
    flex: 1,
  },
});
