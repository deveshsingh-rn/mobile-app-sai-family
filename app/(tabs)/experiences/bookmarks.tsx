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
} from "react-native";

import { FlashList } from "@shopify/flash-list";

import {
  Bookmark,
  Search,
  Sparkles,
  UserCircle2,
} from "lucide-react-native";

import {
  ExperienceCard,
  ExperienceCardSkeleton,
  ExperienceTopTabs,
} from "@/components/experiences";
import { selectDevoteeAccount } from "@/store/devotee-account/selectors";
import {
  fetchBookmarkedExperiencesRequest,
  toggleBookmarkRequest,
  toggleLikeRequest,
  toggleRepostRequest,
} from "@/store/experiences/actions";
import {
  selectBookmarkedExperiencesError,
  selectBookmarkedExperiencesFeed,
  selectBookmarkedExperiencesHasMore,
  selectBookmarkedExperiencesLoading,
} from "@/store/experiences/selectors";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

const LIMIT = 20;

export default function BookmarkedExperiencesScreen() {
  const dispatch = useAppDispatch();
  const account = useAppSelector(
    selectDevoteeAccount
  );
  const bookmarks = useAppSelector(
    selectBookmarkedExperiencesFeed
  );
  const loading = useAppSelector(
    selectBookmarkedExperiencesLoading
  );
  const hasMore = useAppSelector(
    selectBookmarkedExperiencesHasMore
  );
  const error = useAppSelector(
    selectBookmarkedExperiencesError
  );

  const [offset, setOffset] =
    useState(0);
  const [refreshing, setRefreshing] =
    useState(false);
  const [loadingMore, setLoadingMore] =
    useState(false);

  const userId =
    account?.id || account?.authorId;

  useEffect(() => {
    if (userId) {
      setOffset(0);
      dispatch(
        fetchBookmarkedExperiencesRequest({
          limit: LIMIT,
          offset: 0,
        })
      );
    }
  }, [dispatch, userId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setOffset(0);

    dispatch(
      fetchBookmarkedExperiencesRequest({
        limit: LIMIT,
        offset: 0,
      })
    );

    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (
      loading ||
      loadingMore ||
      !hasMore
    ) {
      return;
    }

    const nextOffset =
      offset + LIMIT;

    setLoadingMore(true);
    setOffset(nextOffset);

    dispatch(
      fetchBookmarkedExperiencesRequest({
        limit: LIMIT,
        offset: nextOffset,
      })
    );

    setTimeout(() => {
      setLoadingMore(false);
    }, 700);
  }, [
    dispatch,
    hasMore,
    loading,
    loadingMore,
    offset,
  ]);

  const handleLike = useCallback(
    (experienceId: string) => {
      if (!userId) {
        return;
      }

      dispatch(
        toggleLikeRequest(
          experienceId,
          userId
        )
      );
    },
    [dispatch, userId]
  );

  const handleBookmark = useCallback(
    (experienceId: string) => {
      if (!userId) {
        return;
      }

      dispatch(
        toggleBookmarkRequest(
          experienceId,
          userId
        )
      );
    },
    [dispatch, userId]
  );

  const handleRepost = useCallback(
    (experienceId: string) => {
      if (!userId) {
        return;
      }

      dispatch(
        toggleRepostRequest(
          experienceId,
          userId
        )
      );
    },
    [dispatch, userId]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <ExperienceCard
        item={item}
        onBookmark={() =>
          handleBookmark(item.id)
        }
        onLike={() =>
          handleLike(item.id)
        }
        onRepost={() =>
          handleRepost(item.id)
        }
      />
    ),
    [
      handleBookmark,
      handleLike,
      handleRepost,
    ]
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <ExperienceCardSkeleton count={3} />
      );
    }

    return (
      <View style={styles.stateBox}>
        <View style={styles.emptyIcon}>
          <Bookmark
            color="#b97813"
            size={28}
          />
        </View>

        <Text style={styles.stateTitle}>
          No bookmarks yet
        </Text>

        <Text style={styles.stateText}>
          Save Sai experiences from the feed and they will appear here.
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <ActivityIndicator
          color="#b97813"
          size="small"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <UserCircle2
                color="#1F2937"
                size={23}
                strokeWidth={1.8}
              />
            </View>

            <View>
              <Text style={styles.eyebrow}>Saved</Text>
              <Text style={styles.headerTitle}>
                Bookmarks
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.headerAction}>
              <Search color="#1F2937" size={18} strokeWidth={2} />
            </View>
            <View style={styles.primaryAction}>
              <Sparkles color="#FFFFFF" size={17} strokeWidth={2} />
            </View>
          </View>
        </View>

        <ExperienceTopTabs activeTab="bookmarks" />
      </View>

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <FlashList
        contentContainerStyle={
          styles.content
        }
        data={bookmarks}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#b97813"
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },

  fixedTop: {
    backgroundColor: "#FFFCF7",
    borderBottomColor: "#E9D8BD",
    borderBottomWidth: 1,
    paddingTop: 54,
    zIndex: 10,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 16,
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

  headerTitle: {
    color: "#1F2937",
    fontSize: 24,
    fontWeight: "900",
  },

  headerActions: {
    flexDirection: "row",
    gap: 8,
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

  content: {
    paddingBottom: 120,
    paddingTop: 16,
  },

  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  stateBox: {
    alignItems: "center",
    marginTop: 110,
    paddingHorizontal: 28,
  },

  emptyIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderWidth: 1,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: 16,
    width: 48,
  },

  stateTitle: {
    color: "#1F2937",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },

  stateText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },

  footer: {
    paddingVertical: 24,
  },
});
