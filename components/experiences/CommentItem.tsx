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
    item.authorProfileImageUrl;

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
        <View style={styles.bubble}>
          <Text style={styles.name}>
            {authorName}
          </Text>

          <Text style={styles.comment}>
            {item.content}
          </Text>
        </View>

        <Text style={styles.time}>
          {new Date(
            item.createdAt
          ).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  avatar: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#f1ddba",
  },

  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#f1ddba",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
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

  bubble: {
    borderRadius: 18,

    padding: 14,

    backgroundColor:
      "rgba(255,249,241,0.96)",
  },

  name: {
    color: "#2f1a02",

    fontWeight: "800",
    fontSize: 14,
  },

  comment: {
    marginTop: 6,

    color: "#51350d",

    fontSize: 15,
    lineHeight: 24,
  },

  time: {
    marginTop: 6,
    marginLeft: 4,

    color: "#aa814a",

    fontSize: 12,
    fontWeight: "600",
  },
});
