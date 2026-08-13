import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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

import { ArrowLeft, MessageCircle, X } from "lucide-react-native";
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

export default function ExperienceDetailScreen() {
  const insets = useSafeAreaInsets();
  const [commentsVisible, setCommentsVisible] = useState(false);
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

  const closeComments = useCallback(() => {
    Keyboard.dismiss();
    setCommentsVisible(false);
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
          onComment={() => setCommentsVisible(true)}
          onRepost={handleRepost}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Pressable
          accessibilityLabel={`Open ${comments.length} comments`}
          accessibilityRole="button"
          onPress={() => setCommentsVisible(true)}
          style={({ pressed }) => [
            styles.openCommentsButton,
            pressed && styles.openCommentsPressed,
          ]}
        >
          <MessageCircle color="#6B7280" size={18} />
          <Text style={styles.openCommentsText}>
            {comments.length
              ? `View all ${comments.length} comments`
              : "Be the first to comment"}
          </Text>
        </Pressable>
      </View>
    );
  }, [
    comments.length,
    detail,
    handleBookmark,
    handleDelete,
    handleEdit,
    handleLike,
    handleRepost,
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
    <View style={styles.container}>
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
        data={[]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        renderItem={null}
        showsVerticalScrollIndicator={false}
      />

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <Modal
        animationType="slide"
        onRequestClose={closeComments}
        presentationStyle="overFullScreen"
        transparent
        visible={commentsVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalRoot}
        >
          <Pressable
            accessibilityLabel="Close comments"
            onPress={closeComments}
            style={styles.modalBackdrop}
          />
          <View
            style={[
              styles.commentSheet,
              { paddingBottom: Math.max(insets.bottom, 8) },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleRow}>
                <Text style={styles.sheetTitle}>Comments</Text>
                <Text style={styles.sheetCount}>{comments.length}</Text>
              </View>
              <Pressable
                accessibilityLabel="Close comments"
                accessibilityRole="button"
                hitSlop={8}
                onPress={closeComments}
                style={styles.closeButton}
              >
                <X color="#374151" size={21} />
              </Pressable>
            </View>

            <FlatList
              contentContainerStyle={[
                styles.commentList,
                comments.length === 0 && styles.emptyCommentList,
              ]}
              data={comments}
              keyExtractor={(item) => item.id}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.noCommentsBox}>
                  <View style={styles.emptyCommentIcon}>
                    <MessageCircle color="#F97316" size={25} />
                  </View>
                  <Text style={styles.noCommentsTitle}>No comments yet</Text>
                  <Text style={styles.noCommentsText}>
                    Start a kind conversation with this devotee.
                  </Text>
                </View>
              }
              renderItem={({ item }) => <CommentItem item={item} />}
              showsVerticalScrollIndicator={false}
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}
            <CommentInput
              authorName={accountName}
              loading={addingComment}
              onSubmit={handleComment}
              profileImageUrl={accountProfileImageUrl}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },

  topBar: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderBottomColor: "#E7D7BE",
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
    borderColor: "#E7D7BE",
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  title: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
  },

  topSpacer: {
    width: 40,
  },

  content: {
    paddingBottom: 40,
    paddingTop: 16,
  },

  openCommentsButton: {
    alignItems: "center",
    borderTopColor: "#E5E7EB",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginHorizontal: 16,
    minHeight: 50,
    paddingHorizontal: 18,
  },
  openCommentsPressed: { opacity: 0.58 },
  openCommentsText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 9,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.44)",
  },
  commentSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "78%",
    overflow: "hidden",
    shadowColor: "#111827",
    shadowOffset: { height: -8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    height: 5,
    marginTop: 8,
    width: 42,
  },
  sheetHeader: {
    alignItems: "center",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  sheetTitleRow: { alignItems: "center", flexDirection: "row" },
  sheetTitle: { color: "#111827", fontSize: 17, fontWeight: "900" },
  sheetCount: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  commentList: {
    paddingBottom: 14,
    paddingTop: 8,
  },
  emptyCommentList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  noCommentsBox: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  emptyCommentIcon: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    marginBottom: 13,
    width: 48,
  },

  noCommentsTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "800",
  },

  noCommentsText: {
    color: "#6B7280",
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
    backgroundColor: "#FAFAF9",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
