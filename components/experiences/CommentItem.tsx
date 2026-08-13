import React from "react";

import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  item: any;
};

export default function CommentItem({
  item,
}: Props) {
  const authorName =
    item.author?.name ||
    item.authorName ||
    "Devotee";

  const profileImageUrl =
    item.author?.profileImageUrl ||
    item.author?.profileImage?.uri ||
    item.author?.profile?.profileImageUrl ||
    item.authorProfileImageUrl;

  const createdAt = new Date(item.createdAt);
  const timeLabel = Number.isNaN(createdAt.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
      }).format(createdAt);

  return (
    <View style={styles.container}>
      {profileImageUrl ? (
        <Image
          source={{
            uri: profileImageUrl,
          }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>
            {authorName.charAt(0)}
          </Text>
        </View>
      )}

      <View style={styles.right}>
        <View style={styles.commentRow}>
          <Text style={styles.name}>
            {authorName}
          </Text>
          <Text style={styles.comment}>
            {item.content}
          </Text>
        </View>
        {!!timeLabel && <Text style={styles.time}>{timeLabel}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    paddingHorizontal: 18,
    paddingVertical: 9,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor: "#f1ddba",
  },

  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#f1ddba",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  avatarText: {
    color: "#8e5d10",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  right: {
    flex: 1,
    marginLeft: 12,
  },

  commentRow: { flexDirection: "row", flexWrap: "wrap" },

  name: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 20,
    marginRight: 6,
  },

  comment: {
    color: "#374151",
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  time: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
