import React, {
  useCallback,
  useEffect,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { ArrowLeft } from "lucide-react-native";

import { ExperienceCard } from "@/components/experiences";
import CommentInput from "@/components/experiences/CommentInput";
import CommentItem from "@/components/experiences/CommentItem";
import {
  addCommentRequest,
  fetchExperienceDetailRequest,
  toggleBookmarkRequest,
  toggleLikeRequest,
  toggleRepostRequest,
} from "@/store/experiences/actions";
import {
  selectExperienceComments,
  selectExperienceDetail,
  selectExperienceDetailError,
  selectExperienceDetailLoading,
  selectIsAddingExperienceComment,
} from "@/store/experiences/selectors";
import { selectDevoteeAccount } from "@/store/devotee-account/selectors";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const dispatch = useAppDispatch();
  const account = useAppSelector(
    selectDevoteeAccount
  );
  const detail = useAppSelector(
    selectExperienceDetail
  );
  const comments = useAppSelector(
    selectExperienceComments
  );
  const loading = useAppSelector(
    selectExperienceDetailLoading
  );
  const addingComment = useAppSelector(
    selectIsAddingExperienceComment
  );
  const error = useAppSelector(
    selectExperienceDetailError
  );

  const experienceId = Array.isArray(id)
    ? id[0]
    : id;

  const userId =
    account?.id || account?.authorId;

  useEffect(() => {
    if (experienceId) {
      dispatch(
        fetchExperienceDetailRequest(
          experienceId
        )
      );
    }
  }, [dispatch, experienceId]);

  const handleComment = useCallback(
    (text: string) => {
      if (!experienceId) {
        return;
      }

      dispatch(
        addCommentRequest(
          experienceId,
          text,
          userId
        )
      );
    },
    [dispatch, experienceId, userId]
  );

  const handleLike = useCallback(() => {
    if (experienceId) {
      dispatch(
        toggleLikeRequest(
          experienceId,
          userId
        )
      );
    }
  }, [dispatch, experienceId, userId]);

  const handleBookmark = useCallback(() => {
    if (experienceId) {
      dispatch(
        toggleBookmarkRequest(
          experienceId,
          userId
        )
      );
    }
  }, [dispatch, experienceId, userId]);

  const handleRepost = useCallback(() => {
    if (experienceId) {
      dispatch(
        toggleRepostRequest(
          experienceId,
          userId
        )
      );
    }
  }, [dispatch, experienceId, userId]);

  const header = useMemo(() => {
    if (!detail) {
      return null;
    }

    return (
      <View>
        <ExperienceCard
          item={detail}
          hideBorder
          disableNavigation
          onBookmark={handleBookmark}
          onLike={handleLike}
          onRepost={handleRepost}
        />

        <View style={styles.commentHeader}>
          <Text style={styles.commentTitle}>
            Comments
          </Text>

          <Text style={styles.commentCount}>
            {comments.length}
          </Text>
        </View>
      </View>
    );
  }, [
    comments.length,
    detail,
    handleBookmark,
    handleLike,
    handleRepost,
  ]);

  if (loading && !detail) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          color="#c17d17"
          size="large"
        />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {error || "Experience not found"}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      style={styles.container}
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)")
          }
          style={styles.backButton}
        >
          <ArrowLeft
            color="#5b3b0b"
            size={22}
          />
        </Pressable>

        <Text style={styles.title}>
          Experience
        </Text>

        <View style={styles.topSpacer} />
      </View>

      <FlatList
        contentContainerStyle={
          styles.content
        }
        data={comments}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.noCommentsBox}>
            <Text style={styles.noCommentsTitle}>
              No comments yet
            </Text>
            <Text style={styles.noCommentsText}>
              Be the first devotee to reply.
            </Text>
          </View>
        }
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <CommentItem item={item} />
        )}
        showsVerticalScrollIndicator={false}
      />

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <CommentInput
        loading={addingComment}
        onSubmit={handleComment}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fffaf4",
    flex: 1,
    marginBottom:120,
    borderWidth:1
  },

  topBar: {
    alignItems: "center",
    backgroundColor: "#fffaf4",
    borderBottomColor:
      "rgba(218,184,126,0.28)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 56,
    //  marginBottom:150,
    borderWidth:1
    
  },

  backButton: {
    alignItems: "center",
    backgroundColor:
      "rgba(183,122,24,0.12)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  title: {
    color: "#2f1b03",
    fontSize: 18,
    fontWeight: "800",
  },

  topSpacer: {
    width: 40,
  },

  loader: {
    alignItems: "center",
    backgroundColor: "#fffaf4",
    flex: 1,
    justifyContent: "center",
  },

  content: {
    paddingBottom: 24,
    paddingTop: 16,
  },

  commentHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 2,
    paddingBottom: 10,
    paddingHorizontal: 18,
  },

  commentTitle: {
    color: "#2f1b03",
    fontSize: 18,
    fontWeight: "800",
  },

  commentCount: {
    color: "#9d7a42",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  noCommentsBox: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 42,
  },

  noCommentsTitle: {
    color: "#4e3309",
    fontSize: 16,
    fontWeight: "800",
  },

  noCommentsText: {
    color: "#79571b",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },

  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 18,
    paddingVertical: 8,
  },

  emptyContainer: {
    alignItems: "center",
    backgroundColor: "#fffaf4",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  emptyText: {
    color: "#8d6a36",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
