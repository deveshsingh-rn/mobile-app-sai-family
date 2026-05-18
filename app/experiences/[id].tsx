import React, {
  useEffect,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useLocalSearchParams,
} from "expo-router";

import {
  useDispatch,
  useSelector,
} from "react-redux";


import { ExperienceCard } from "@/components/experiences";
import { SafeAreaView } from "react-native-safe-area-context";
import CommentItem from "@/components/experiences/CommentItem";
import CommentInput from "@/components/experiences/CommentInput";



export default function ExperienceDetailScreen() {
  const { id } =
    useLocalSearchParams();

  const dispatch = useDispatch();

  const loading = useSelector(
    (state: any) =>
      state.experiences.loading
  );

  const detail = useSelector(
    (state: any) =>
      state.experiences.detail
  );

  const comments = useSelector(
    (state: any) =>
      state.experiences.comments || []
  );

  const account = useSelector(
    (state: any) =>
      state.devoteeAccount
        ?.account
  );

  useEffect(() => {
    if (id) {
      dispatch(
        fetchExperienceDetailRequest(
          String(id)
        )
      );
    }
  }, [id]);

  const handleComment = (
    text: string
  ) => {
    dispatch(
      addCommentRequest(
        String(id),
        text,
        account?.id
      )
    );
  };

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
        />

        <View style={styles.commentHeader}>
          <Text style={styles.commentTitle}>
            Replies
          </Text>

          <Text style={styles.commentCount}>
            {comments.length}
          </Text>
        </View>
      </View>
    );
  }, [detail, comments]);

  if (loading && !detail) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#c17d17"
        />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Experience not found
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <FlatList
          data={comments}
          keyExtractor={(item) =>
            item.id
          }
          renderItem={({ item }) => (
            <CommentItem item={item} />
          )}
          ListHeaderComponent={
            header
          }
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        />

        <CommentInput
          onSubmit={handleComment}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf4",
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingBottom: 120,
  },

  commentHeader: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 10,

    flexDirection: "row",
    alignItems: "center",
  },

  commentTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2f1b03",
  },

  commentCount: {
    marginLeft: 8,
    color: "#9d7a42",
    fontSize: 14,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#8d6a36",
    fontSize: 16,
    fontWeight: "700",
  },
});