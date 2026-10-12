import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";

import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Mic2,
  Type,
} from "lucide-react-native";

import {
  ExperienceCard,
  ExperienceCardSkeleton,
  ExperienceCreatePostButton,
  ExperienceListFooterSkeleton,
  ExperienceProfileMenu,
} from "@/components/experiences";

import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

import {
  fetchExperiencesRequest,
  deleteExperienceRequest,
  toggleLikeRequest,
  toggleBookmarkRequest,
  toggleRepostRequest,
} from "@/store/experiences/actions";

import {
  selectExperiencesFeed,
  selectExperiencesLoading,
  selectExperiencesLoadingMore,
  selectExperiencesPagination,
} from "@/store/experiences/selectors";

import { selectDevoteeAccount } from "@/store/devotee-account/selectors";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";

const LIMIT = 10;
const SAI_BABA_WELCOME_IMAGE =
  require("@/assets/images/hariom.png");

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } =
    useWindowDimensions();

  const feed = useAppSelector(
    selectExperiencesFeed
  );

  const loading = useAppSelector(
    selectExperiencesLoading
  );

  const account = useAppSelector(
    selectDevoteeAccount
  );

  const [refreshing, setRefreshing] =
    useState(false);

  const loadingMore = useAppSelector(
    selectExperiencesLoadingMore
  );
  const pagination = useAppSelector(
    selectExperiencesPagination
  );
  const loadMoreInFlightRef = useRef(false);

  const [activeViewableId, setActiveViewableId] = useState<string | null>(null);
  const askSaiBorderProgress = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    askSaiBorderProgress.setValue(0);
    const borderAnimation = Animated.loop(
      Animated.timing(askSaiBorderProgress, {
        duration: 6200,
        easing: Easing.linear,
        isInteraction: false,
        toValue: 1,
        useNativeDriver: true,
      })
    );

    borderAnimation.start();

    return () => {
      borderAnimation.stop();
    };
  }, [askSaiBorderProgress]);

  // ───────────────── INITIAL FETCH ─────────────────

  useEffect(() => {
    dispatch(
      fetchExperiencesRequest({
        limit: LIMIT,
        offset: 0,
      })
    );
  }, [dispatch]);

  // ───────────────── REFRESH ─────────────────

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    dispatch(
      fetchExperiencesRequest({
        limit: LIMIT,
        offset: 0,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (refreshing && !loading) {
      setRefreshing(false);
    }
  }, [loading, refreshing]);

  // ───────────────── PAGINATION ─────────────────

  const handleLoadMore =
    useCallback(() => {
      if (
        loading ||
        loadingMore ||
        loadMoreInFlightRef.current ||
        !pagination.hasMore ||
        pagination.nextOffset === null
      ) {
        return;
      }

      loadMoreInFlightRef.current = true;

      dispatch(
        fetchExperiencesRequest({
          limit: LIMIT,
          offset: pagination.nextOffset,
        })
      );
    }, [
      loading,
      loadingMore,
      pagination.hasMore,
      pagination.nextOffset,
      dispatch,
    ]);

  useEffect(() => {
    if (!loadingMore) {
      loadMoreInFlightRef.current = false;
    }
  }, [loadingMore]);

  // ───────────────── ACTIONS ─────────────────

  const handleLike = useCallback((
    experienceId: string
  ) => {
    if (!account?.id) {
      return;
    }

    dispatch(
      toggleLikeRequest(
        experienceId,
        account.id
      )
    );
  }, [account?.id, dispatch]);

  const handleBookmark = useCallback((
    experienceId: string
  ) => {
    if (!account?.id) {
      return;
    }

    dispatch(
      toggleBookmarkRequest(
        experienceId,
        account.id
      )
    );
  }, [account?.id, dispatch]);

  const handleRepost = useCallback((
    experienceId: string
  ) => {
    if (!account?.id) {
      return;
    }

    dispatch(
      toggleRepostRequest(
        experienceId,
        account.id
      )
    );
  }, [account?.id, dispatch]);

  const handleEdit = useCallback(
    (experienceId: string) => {
      router.push({
        pathname: "/experiences/edit" as any,
        params: { id: experienceId },
      });
    },
    []
  );

  const handleDelete = useCallback(
    (experienceId: string) => {
      dispatch(
        deleteExperienceRequest(experienceId)
      );
    },
    [dispatch]
  );

  const openAskSai = useCallback(() => {
    router.push("/(tabs)/experiences/ask-sai" as any);
  }, []);

  const openCreatePost = useCallback(() => {
    router.push("/(tabs)/experiences/post" as any);
  }, []);

  // ───────────────── VIEWABILITY (AUTO-PLAY/PAUSE) ─────────────────

  const viewabilityConfig = React.useMemo(() => ({
    itemVisiblePercentThreshold: 70,
    minimumViewTime: 100, // Debounce rapid scrolling
  }), []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        // Get the first item that meets the 70% visibility threshold
        const activeItem = viewableItems[0];
        setActiveViewableId(
          activeItem.item.feedItemId || activeItem.item.id
        );
      }
    },
    []
  );

  // ───────────────── RENDER ITEM ─────────────────

  const renderItem = useCallback(({
    item,
  }: { item: any }) => {
    const isActive =
      activeViewableId === (item.feedItemId || item.id);

    return (
      <ExperienceCard
        currentUserId={
          account?.id || account?.authorId
        }
        item={item}
        onLike={() =>
          handleLike(item.id)
        }
        onBookmark={() =>
          handleBookmark(item.id)
        }
        onRepost={() =>
          handleRepost(item.id)
        }
        onEdit={() =>
          handleEdit(item.id)
        }
        onDelete={() =>
          handleDelete(item.id)
        }
        isActive={isActive}
      />
    );
  }, [
    account?.authorId,
    account?.id,
    activeViewableId,
    handleBookmark,
    handleDelete,
    handleEdit,
    handleLike,
    handleRepost,
  ]);

  // ───────────────── LOADER ─────────────────

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <ExperienceListFooterSkeleton />
    );
  };

  // ───────────────── EMPTY ─────────────────

  const renderEmpty = () => {
    if (loading) {
      return (
        <ExperienceCardSkeleton count={3} />
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No divine experiences found
        </Text>
      </View>
    );
  };

  // ───────────────── UI ─────────────────

  const askSaiFrameWidth = Math.min(
    screenWidth - 12,
    440
  );
  const askSaiFrameHeight =
    (askSaiFrameWidth - 8) / 2 + 8;
  const askSaiGlowSize = Math.max(
    askSaiFrameWidth * 1.65,
    520
  );
  const askSaiBorderRotation =
    askSaiBorderProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View
        style={[
          styles.fixedTop,
          { paddingTop: Math.max(insets.top + 4, 12) },
        ]}
      >
        <View style={styles.pillarHeaderRow}>
          <ExperienceProfileMenu />
        </View>
      </View>

      {/* FEED */}
      <FlashList
        data={feed}
        extraData={activeViewableId}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.feedItemId || item.id
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        onEndReached={
          handleLoadMore
        }
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.feedHeader}>
            <View style={styles.headerIntroContent}>
              <Pressable
                accessibilityHint="Opens the Ask Sai voice and text assistant"
                accessibilityLabel="Ask Sai"
                accessibilityRole="button"
                onPress={openAskSai}
                style={({ pressed }) => [
                  styles.askSaiGlowFrame,
                  {
                    height: askSaiFrameHeight,
                    width: askSaiFrameWidth,
                  },
                  pressed && styles.askSaiCardPressed,
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.askSaiBorderLight,
                    {
                      height: askSaiGlowSize,
                      marginLeft: -askSaiGlowSize / 2,
                      marginTop: -askSaiGlowSize / 2,
                      transform: [{ rotate: askSaiBorderRotation }],
                      width: askSaiGlowSize,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "#FFF7C2",
                      "#a2ff00",
                      "#fe4800",
                      "#f3f1f0",
                      "#FFF7C2",
                    ]}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>

                <ImageBackground
                  imageStyle={styles.askSaiImage}
                  resizeMode="cover"
                  source={SAI_BABA_WELCOME_IMAGE}
                  style={styles.askSaiCard}
                >
                  <LinearGradient
                    colors={[
                      "rgba(24, 14, 6, 0.90)",
                      "rgba(28, 16, 7, 0.72)",
                      "rgba(32, 18, 8, 0.30)",
                      "rgba(36, 20, 8, 0)",
                      "rgba(36, 20, 8, 0)",
                    ]}
                    end={{ x: 1, y: 0.5 }}
                    locations={[0, 0.34, 0.6, 0.72, 1]}
                    pointerEvents="none"
                    start={{ x: 0, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View style={styles.askSaiTopRow} />

                  <View style={styles.askSaiBottomRow}>
                    <View style={styles.askSaiCopy}>
                      <View style={styles.askSaiPromptList}>
                        <View style={styles.askSaiPromptRow}>
                          <Text aria-hidden style={styles.askSaiPromptBullet}>•</Text>
                          <Text style={styles.askSaiPrompt}>Speak or Write</Text>
                        </View>
                        <View style={styles.askSaiPromptRow}>
                          <Text aria-hidden style={styles.askSaiPromptBullet}>•</Text>
                          <Text style={styles.askSaiPrompt}>
                            Ask Guidance from Shri Sai Satcharitra
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.askSaiMicButton}>
                      <Mic2 color="#3A2108" size={26} strokeWidth={2.4} />
                    </View>
                    <View style={styles.askSaiMicButton}>
                      <Type color="#3A2108" size={26} strokeWidth={2.4} />
                    </View>
                  </View>
                </ImageBackground>
              </Pressable>
            </View>

            <View style={styles.experienceIntro}>
              <View style={styles.experienceIntroTitleRow}>
                <ExperienceCreatePostButton
                  active={false}
                  imageSource={require("@/assets/images/saibaba1.png")}
                  name={account?.name}
                  onPress={openCreatePost}
                  size="large"
                />
                <Text style={styles.experienceIntroTitle}>
                  Share your Sai Journey
                </Text>
              </View>
              <Text style={styles.experienceIntroText}>
                Share Sai Mandirs Worldwide, Miracles, Moments when Baba Blessed You. Receive Sai Blessings
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          renderFooter
        }
        ListEmptyComponent={
          renderEmpty
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
            tintColor="#b97813"
          />
        }
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EXPERIENCE_THEME.background,
  },

  fixedTop: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: EXPERIENCE_THEME.border,
  },

  pillarHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingBottom: 10,
    paddingHorizontal: 12,
  },

  feedHeader: {
    backgroundColor: EXPERIENCE_THEME.background,
    paddingTop: 10,
  },

  experienceIntro: {
    paddingBottom: 14,
    paddingHorizontal: 24,
  },

  experienceIntroTitleRow: {
    alignItems: "center",
    flexDirection: "row",
  },

  experienceIntroTitle: {
    color: EXPERIENCE_THEME.heading,
    flex: 1,
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 28,
    marginLeft: 14,
  },

  experienceIntroText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 25,
    marginTop: 5,
  },

  askSaiGlowFrame: {
    alignSelf: "center",
    backgroundColor: "#F59E0B",
    borderRadius: 27,
    marginBottom: 14,
    overflow: "hidden",
    padding: 4,
    shadowColor: "#9A5C10",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },

  askSaiBorderLight: {
    left: "50%",
    position: "absolute",
    top: "50%",
  },

  askSaiCardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },

  askSaiCard: {
    // backgroundColor: "#2C2C2C",
    alignSelf: "stretch",
    borderRadius: 23,
    flex: 1,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: 12,
  },

  askSaiImage: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 23,
  },

  askSaiTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
  },

  askSaiEyebrow: {
    color: "#fcfbfa",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2.1,
    textShadowColor: "rgba(0, 0, 0, 0.28)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 4,
  },

  askSaiTitle: {
    color: "#faf9f9",
    fontFamily: "Georgia",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 35,
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.34)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 7,
  },

  askSaiBottomRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
  },

  askSaiCopy: {
    flex: 1,
    paddingRight: 8,
  },

  askSaiPrompt: {
    color: "#FFF7E1",
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 19,
    textShadowColor: "rgba(0, 0, 0, 0.32)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 5,
  },

  askSaiPromptList: {
    gap: 2,
  },

  askSaiPromptRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 6,
  },

  askSaiPromptBullet: {
    color: "#FFE2A0",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 19,
    textShadowColor: "rgba(0, 0, 0, 0.32)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 5,
  },

  askSaiMeta: {
    color: "#FFE2A0",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },

  askSaiMicButton: {
    alignItems: "center",
    backgroundColor: "#FFE29A",
    borderColor: "rgba(255, 255, 255, 0.74)",
    borderRadius: 24,
    borderWidth: 2,
    height: 54,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    width: 54,
  },

  header: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: EXPERIENCE_THEME.border,
    backdropFilter: "blur(10px)",
    shadowColor: "#ed9a1e",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  headerIntroContent: {
    overflow: "hidden",
  },

  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },

  headerIcon: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  eyebrow: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: "900",
  },

  title: {
    color: EXPERIENCE_THEME.heading,

    fontSize: 24,
    fontWeight: "900",
  },

  headerActions: {
    flexDirection: "row",
    gap: 8,
    overflow: "hidden",
  },

  headerAction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  primaryAction: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  heroPanel: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 14,
    marginHorizontal: 16,
    padding: 16,
  },

  heroTextWrap: {
    flex: 1,
  },

  heroTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 22,
  },

  heroMeta: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },

  heroBadge: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    height: 42,
    justifyContent: "center",
    marginLeft: 12,
    width: 42,
  },

  content: {
    paddingTop: 1,
    paddingBottom: 120,
  },

  footer: {
    paddingVertical: 24,
  },

  loader: {
    marginTop: 80,

    alignItems: "center",
    justifyContent: "center",
  },

  emptyContainer: {
    marginTop: 100,

    alignItems: "center",
    paddingHorizontal: 28,
  },

  emptyText: {
    color: EXPERIENCE_THEME.paragraph,

    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23,
    textAlign: "center",
  },
});
