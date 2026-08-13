import React, {
  useState,
} from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SendHorizonal } from "lucide-react-native";

type Props = {
  loading?: boolean;
  authorName?: string;
  profileImageUrl?: string | null;
  onSubmit: (
    text: string
  ) => void;
};

export default function CommentInput({
  loading,
  onSubmit,
  authorName = "You",
  profileImageUrl,
}: Props) {
  const [comment, setComment] =
    useState("");

  const handleSend = () => {
    if (!comment.trim()) {
      return;
    }

    onSubmit(comment.trim());

    setComment("");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {authorName.trim().charAt(0) || "Y"}
            </Text>
          </View>
        )}
        <View style={styles.composer}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            blurOnSubmit={false}
            placeholder="Add a comment..."
            placeholderTextColor="#9CA3AF"
            multiline
            style={styles.input}
          />

          <Pressable
            accessibilityLabel="Post comment"
            accessibilityRole="button"
            onPress={handleSend}
            disabled={
              loading ||
              !comment.trim()
            }
            style={[
              styles.sendButton,
              (!comment.trim() ||
                loading) &&
                styles.disabled,
            ]}
          >
            <SendHorizonal
              size={17}
              color="#fff"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor:
      "#E5E7EB",

    backgroundColor:
      "#FFFFFF",
  },

  container: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    borderRadius: 19,
    height: 38,
    width: 38,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 19,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  avatarText: {
    color: "#9A3412",
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  composer: {
    alignItems: "flex-end",
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    marginLeft: 10,
  },

  input: {
    flex: 1,

    minHeight: 44,
    maxHeight: 110,

    paddingHorizontal: 14,
    paddingVertical: 11,
    color: "#111827",

    fontSize: 15,
    lineHeight: 21,
  },

  sendButton: {
    width: 38,
    height: 38,
    marginBottom: 3,
    marginRight: 3,
    borderRadius: 19,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F97316",
  },

  disabled: {
    opacity: 0.45,
  },
});
