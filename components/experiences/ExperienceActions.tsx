import React from "react";

import {
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
} from "lucide-react-native";

type Props = {
  liked?: boolean;
  bookmarked?: boolean;
  reposted?: boolean;

  likes: number;
  comments: number;
  reposts: number;

  onLike?: () => void;
  onComment?: () => void;
  onRepost?: () => void;
  onBookmark?: () => void;

  shareText?: string;
};

export default function ExperienceActions({
  liked,
  bookmarked,
  reposted,

  likes,
  comments,
  reposts,

  onLike,
  onComment,
  onRepost,
  onBookmark,

  shareText,
}: Props) {
  const handleShare = async () => {
    await Share.share({
      message: shareText || "",
    });
  };

  return (
    <View style={styles.container}>
      {/* LIKE */}

      <Pressable
        style={styles.actionButton}
        onPress={onLike}
      >
        <Heart
          size={20}
          color={
            liked
              ? "#ff4d67"
              : "#7c7c7c"
          }
          fill={
            liked
              ? "#ff4d67"
              : "transparent"
          }
        />

        <Text style={styles.count}>
          {likes}
        </Text>
      </Pressable>

      {/* COMMENT */}

      <Pressable
        style={styles.actionButton}
        onPress={onComment}
      >
        <MessageCircle
          size={20}
          color="#7c7c7c"
        />

        <Text style={styles.count}>
          {comments}
        </Text>
      </Pressable>

      {/* REPOST */}

      <Pressable
        style={styles.actionButton}
        onPress={onRepost}
      >
        <Repeat2
          size={20}
          color={
            reposted
              ? "#11a36a"
              : "#7c7c7c"
          }
        />

        <Text style={styles.count}>
          {reposts}
        </Text>
      </Pressable>

      {/* BOOKMARK */}

      <Pressable
        style={styles.actionButton}
        onPress={onBookmark}
      >
        <Bookmark
          size={20}
          color={
            bookmarked
              ? "#d08a18"
              : "#7c7c7c"
          }
          fill={
            bookmarked
              ? "#d08a18"
              : "transparent"
          }
        />
      </Pressable>

      {/* SHARE */}

      <Pressable
        style={styles.actionButton}
        onPress={handleShare}
      >
        <Send
          size={19}
          color="#7c7c7c"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",

    gap: 6,
  },

  count: {
    color: "#7d622e",

    fontSize: 13,
    fontWeight: "700",
  },
});