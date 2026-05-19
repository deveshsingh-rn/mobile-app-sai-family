import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";

import { FlashList } from "@shopify/flash-list";

import {
  Sparkles,
  UserCircle2,
} from "lucide-react-native";

import {
  CategoryChips,
  ExperienceCard,
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

  // ───────────────── INITIAL FETCH ─────────────────

  useEffect(() => {
    dispatch(
      fetchExperiencesRequest({
        limit: LIMIT,
        offset: 0,
      })
    );
  }, []);

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
  }, [selectedCategory]);

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
      feed,
      offset,
      selectedCategory,
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
      []
    );

  // ───────────────── ACTIONS ─────────────────

  const handleLike = (
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
  };

  const handleBookmark = (
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
  };

  const handleRepost = (
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
  };

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
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color="#b97813"
          />
        </View>
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
        <View style={styles.header}>
          <UserCircle2
            size={32}
            color="#8e5d10"
            strokeWidth={1.5}
          />

          <Text style={styles.title}>
            Leela Feed
          </Text>

          <Sparkles
            size={24}
            color="#8e5d10"
            strokeWidth={1.5}
          />
        </View>

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

    backgroundColor: "#fffaf3",
  },

  fixedTop: {
    paddingTop: 54,

    backgroundColor:
      "rgba(255,250,240,0.97)",

    borderBottomWidth: 1,

    borderBottomColor:
      "rgba(224,193,138,0.24)",
  },

  header: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 18,
    paddingBottom: 14,
  },

  title: {
    color: "#3f2502",

    fontSize: 22,
    fontWeight: "800",

    letterSpacing: -0.4,
  },

  categoriesWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 6,
  },

  content: {
    paddingTop: 10,
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
  },

  emptyText: {
    color: "#8f6b37",

    fontSize: 15,
    fontWeight: "600",
  },
});
