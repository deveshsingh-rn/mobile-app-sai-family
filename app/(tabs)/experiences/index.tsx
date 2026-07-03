import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";

import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

import {
  PenLine,
  Search,
  UserCircle2,
} from "lucide-react-native";

import {
  CategoryChips,
  ExperienceCard,
  ExperienceCardSkeleton,
  ExperienceTopTabs,
} from "@/components/experiences";

import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

import {
  fetchExperiencesRequest,
  toggleLikeRequest,
  toggleBookmarkRequest,
  toggleRepostRequest,
} from "@/store/experiences/actions";

import {
  selectExperiencesFeed,
  selectExperiencesLoading,
} from "@/store/experiences/selectors";

import { selectDevoteeAccount } from "@/store/devotee-account/selectors";

const LIMIT = 10;
const HEADER_SCROLL_THRESHOLD = 18;
const HEADER_ANIMATION_MS = 150;

const CATEGORIES = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Miracles",
    value: "miracles",
  },
  {
    label: "Prayers",
    value: "prayers",
  },
  {
    label: "Dreams",
    value: "dreams",
  },
  {
    label: "Darshan",
    value: "darshan",
  },
  {
    label: "Blessings",
    value: "blessings",
  },
];

export default function HomeScreen() {
  const dispatch = useAppDispatch();
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

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [offset, setOffset] =
    useState(0);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [activeViewableId, setActiveViewableId] = useState<string | null>(null);
  const [isHeaderIntroMounted, setIsHeaderIntroMounted] =
    useState(true);
  const [isHeaderIntroVisible, setIsHeaderIntroVisible] =
    useState(true);

  const headerIntroProgress = useRef(
    new Animated.Value(1)
  ).current;
  const isHeaderIntroVisibleRef = useRef(true);
  const lastScrollYRef = useRef(0);

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

    setOffset(0);

    dispatch(
      fetchExperiencesRequest({
        limit: LIMIT,
        offset: 0,
        category:
          selectedCategory === "all"
            ? undefined
            : selectedCategory,
      })
    );

    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, [dispatch, selectedCategory]);

  // ───────────────── PAGINATION ─────────────────

  const handleLoadMore =
    useCallback(() => {
      if (
        loading ||
        loadingMore ||
        feed.length < LIMIT
      ) {
        return;
      }

      setLoadingMore(true);

      const nextOffset =
        offset + LIMIT;

      dispatch(
        fetchExperiencesRequest({
          limit: LIMIT,
          offset: nextOffset,
          category:
            selectedCategory ===
            "all"
              ? undefined
              : selectedCategory,
        })
      );

      setOffset(nextOffset);

      setTimeout(() => {
        setLoadingMore(false);
      }, 700);
    }, [
      loading,
      loadingMore,
      feed.length,
      offset,
      selectedCategory,
      dispatch,
    ]);

  // ───────────────── CATEGORY FILTER ─────────────────

  const handleCategoryChange =
    useCallback(
      (value: string) => {
        setSelectedCategory(value);

        setOffset(0);

        dispatch(
          fetchExperiencesRequest({
            limit: LIMIT,
            offset: 0,
            category:
              value === "all"
                ? undefined
                : value,
          })
        );
      },
      [dispatch]
    );

  const animateHeaderIntro = useCallback(
    (visible: boolean) => {
      if (
        isHeaderIntroVisibleRef.current ===
        visible
      ) {
        return;
      }

      isHeaderIntroVisibleRef.current =
        visible;
      setIsHeaderIntroVisible(visible);

      if (visible) {
        setIsHeaderIntroMounted(true);
        headerIntroProgress.setValue(0);

        Animated.timing(headerIntroProgress, {
          duration: HEADER_ANIMATION_MS,
          toValue: 1,
          useNativeDriver: true,
        }).start();
        return;
      }

      Animated.timing(headerIntroProgress, {
        duration: HEADER_ANIMATION_MS,
        toValue: 0,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsHeaderIntroMounted(false);
        }
      });
    },
    [headerIntroProgress]
  );

  const handleFeedScroll =
    useCallback(
      (event: any) => {
        const currentY = Math.max(
          event.nativeEvent.contentOffset.y,
          0
        );
        const diff =
          currentY -
          lastScrollYRef.current;

        if (currentY < 20) {
          animateHeaderIntro(true);
        } else if (
          diff >
          HEADER_SCROLL_THRESHOLD
        ) {
          animateHeaderIntro(false);
        } else if (
          diff <
          -HEADER_SCROLL_THRESHOLD
        ) {
          animateHeaderIntro(true);
        }

        lastScrollYRef.current =
          currentY;
      },
      [animateHeaderIntro]
    );

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
        setActiveViewableId(activeItem.item.id);
      }
    },
    []
  );

  // ───────────────── RENDER ITEM ─────────────────

  const renderItem = useCallback(({
    item,
  }: { item: any }) => {
    const isActive = activeViewableId === item.id;

    return (
      <ExperienceCard
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
        isActive={isActive}
      />
    );
  }, [activeViewableId, handleLike, handleBookmark, handleRepost]);

  // ───────────────── LOADER ─────────────────

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <ActivityIndicator
          size="small"
          color="#b97813"
        />
      </View>
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

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.fixedTop}>
        {isHeaderIntroMounted && (
          <Animated.View
            pointerEvents={
              isHeaderIntroVisible
                ? "auto"
                : "none"
            }
            style={[
              styles.headerIntroContent,
              {
                opacity: headerIntroProgress,
                transform: [
                  {
                    translateX:
                        headerIntroProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            screenWidth * 0.5,
                            0,
                          ],
                        }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <UserCircle2
                    size={23}
                    color="#1F2937"
                    strokeWidth={1.8}
                  />
                </View>

                <View>
                  <Text style={styles.eyebrow}>
                    Sai Family
                  </Text>
                  <Text style={styles.title}>
                    Experiences
                  </Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <Pressable
                  onPress={() =>
                    router.push("/(tabs)/experiences/search" as any)
                  }
                  style={styles.headerAction}
                >
                  <Search
                    size={18}
                    color="#1F2937"
                    strokeWidth={2}
                  />
                </Pressable>
                <Pressable
                  onPress={() =>
                    router.push("/(tabs)/experiences/post" as any)
                  }
                  style={styles.primaryAction}
                >
                  <PenLine
                    size={17}
                    color="#FFFFFF"
                    strokeWidth={2}
                  />
                </Pressable>
              </View>
            </View>

            {/* <View style={styles.heroPanel}>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>
                  Share blessings, prayers, dreams, and darshan stories.
                </Text>
                <Text style={styles.heroMeta}>
                  {feed.length || 0} live posts in your family feed
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Sparkles
                  size={18}
                  color="#F97316"
                  strokeWidth={2}
                />
              </View>
            </View> */}
          </Animated.View>
        )}

        <ExperienceTopTabs activeTab="feed" />

        <View
          style={
            styles.categoriesWrapper
          }
        >
          <CategoryChips
            activeValue={
              selectedCategory
            }
            categories={CATEGORIES}
            onChange={
              handleCategoryChange
            }
          />
        </View>
      </View>

      {/* FEED */}

      <FlashList
        data={feed}
        extraData={activeViewableId}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.id
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
        onScroll={handleFeedScroll}
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
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#FAFAF9",
  },

  fixedTop: {
    backgroundColor: "#FFFCF7",

    borderBottomWidth: 1,

    borderBottomColor: "#E9D8BD",
    paddingTop: 54,
  },

  header: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E9D8BD",
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
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  eyebrow: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "900",
  },

  title: {
    color: "#1F2937",

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
    borderColor: "#E7D7BE",
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  primaryAction: {
    alignItems: "center",
    backgroundColor: "#23201D",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  heroPanel: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
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
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 22,
  },

  heroMeta: {
    color: "#6B7280",
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

  categoriesWrapper: {
    paddingBottom: 12,
    paddingTop: 4,
  },

  content: {
    paddingTop: 16,
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
    color: "#6B7280",

    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23,
    textAlign: "center",
  },
});
