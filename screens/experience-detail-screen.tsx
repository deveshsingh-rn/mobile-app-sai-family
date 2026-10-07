import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  FlatList,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
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

import { ArrowLeft, MessageCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ExperienceCard,
  ExperienceDetailSkeleton,
} from "@/components/experiences";
import CommentInput from "@/components/experiences/CommentInput";
import CommentItem from "@/components/experiences/CommentItem";
import {
  addCommentRequest,
  deleteExperienceRequest,
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
import { EXPERIENCE_THEME } from "@/constants/experience-theme";

export default function ExperienceDetailScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const commentsOffsetRef = useRef(0);
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
  const accountName = account?.name || "You";
  const accountProfileImageUrl =
    account?.profileImage?.uri ||
    account?.profileImageUrl ||
    account?.profile?.profileImageUrl ||
    null;

  const scrollToComments = useCallback(() => {
    listRef.current?.scrollToOffset({
      animated: true,
      offset: commentsOffsetRef.current,
    });
  }, []);

  const captureCommentsOffset = useCallback((event: LayoutChangeEvent) => {
    commentsOffsetRef.current = event.nativeEvent.layout.y;
  }, []);

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

  const handleEdit = useCallback(() => {
    if (experienceId) {
      router.push({
        pathname: "/experiences/edit" as any,
        params: { id: experienceId },
      });
    }
  }, [experienceId]);

  const handleDelete = useCallback(() => {
    if (!experienceId) {
      return;
    }

    dispatch(
      deleteExperienceRequest(experienceId)
    );
    router.back();
  }, [dispatch, experienceId]);

  const header = useMemo(() => {
    if (!detail) {
      return null;
    }

    return (
      <View>
        <ExperienceCard
          currentUserId={userId}
          item={detail}
          hideBorder
          disableNavigation
          onBookmark={handleBookmark}
          onLike={handleLike}
          onComment={scrollToComments}
          onRepost={handleRepost}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <View
          onLayout={captureCommentsOffset}
          style={styles.commentsHeader}
        >
          <Text style={styles.commentsTitle}>Comments</Text>
          <Text style={styles.commentsCount}>{comments.length}</Text>
        </View>
      </View>
    );
  }, [
    captureCommentsOffset,
    comments.length,
    detail,
    handleBookmark,
    handleDelete,
    handleEdit,
    handleLike,
    handleRepost,
    scrollToComments,
    userId,
  ]);

  if (loading && !detail) {
    return <ExperienceDetailSkeleton />;
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
        ref={listRef}
        contentContainerStyle={
          styles.content
        }
        data={comments}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.noCommentsBox}>
            <View style={styles.emptyCommentIcon}>
              <MessageCircle color={EXPERIENCE_THEME.heading} size={25} />
            </View>
            <Text style={styles.noCommentsTitle}>No Comments Yet</Text>
            <Text style={styles.noCommentsText}>
              Start a kind conversation with this devotee.
            </Text>
          </View>
        }
        ListHeaderComponent={header}
        renderItem={({ item }) => <CommentItem item={item} />}
        showsVerticalScrollIndicator={false}
      />

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <View
        style={[
          styles.commentBar,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        <CommentInput
          authorName={accountName}
          loading={addingComment}
          onSubmit={handleComment}
          profileImageUrl={accountProfileImageUrl}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: EXPERIENCE_THEME.background,
    flex: 1,
  },

  topBar: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 56,
  },

  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  title: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 18,
    fontWeight: "900",
  },

  topSpacer: {
    width: 40,
  },

  content: {
    paddingBottom: 24,
    paddingTop: 16,
  },

  commentsHeader: {
    alignItems: "center",
    borderTopColor: EXPERIENCE_THEME.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 4,
    paddingBottom: 6,
    paddingTop: 16,
  },
  commentsTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 17,
    fontWeight: "900",
  },
  commentsCount: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },
  commentBar: {
    backgroundColor: EXPERIENCE_THEME.background,
  },

  noCommentsBox: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 28,
  },
  emptyCommentIcon: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    marginBottom: 13,
    width: 48,
  },

  noCommentsTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "800",
  },

  noCommentsText: {
    color: EXPERIENCE_THEME.paragraph,
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
    backgroundColor: EXPERIENCE_THEME.background,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  emptyText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
