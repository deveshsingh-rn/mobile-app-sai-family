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
  Sparkles,
  UserCircle2,
} from "lucide-react-native";

import {
  ExperienceCard,
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
        <View style={styles.stateBox}>
          <ActivityIndicator
            color="#b97813"
            size="large"
          />
        </View>
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
          <UserCircle2
            color="#8e5d10"
            size={32}
            strokeWidth={1.5}
          />

          <Text style={styles.headerTitle}>
            Bookmarks
          </Text>

          <Sparkles
            color="#8e5d10"
            size={24}
            strokeWidth={1.5}
          />
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
    backgroundColor: "#fffaf0",
    flex: 1,
  },

  fixedTop: {
    backgroundColor:
      "rgba(255,250,240,0.97)",
    borderBottomColor:
      "rgba(224,193,138,0.24)",
    borderBottomWidth: 1,
    paddingTop: 54,
    zIndex: 10,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },

  headerTitle: {
    color: "#4e3309",
    fontSize: 20,
    fontWeight: "800",
  },

  content: {
    paddingBottom: 120,
    paddingTop: 14,
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
    backgroundColor:
      "rgba(185,120,19,0.12)",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: 16,
    width: 48,
  },

  stateTitle: {
    color: "#4e3309",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  stateText: {
    color: "#79571b",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },

  footer: {
    paddingVertical: 24,
  },
});
