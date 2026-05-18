import React, {
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { SendHorizonal } from "lucide-react-native";

type Props = {
  loading?: boolean;
  onSubmit: (
    text: string
  ) => void;
};

export default function CommentInput({
  loading,
  onSubmit,
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
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Write a reply..."
            placeholderTextColor="#b99258"
            multiline
            style={styles.input}
          />

          <Pressable
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
              size={18}
              color="#fff"
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor:
      "rgba(228,196,144,0.35)",

    backgroundColor:
      "rgba(255,255,255,0.98)",
  },

  container: {
    flexDirection: "row",
    alignItems: "flex-end",

    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  input: {
    flex: 1,

    minHeight: 48,
    maxHeight: 140,

    paddingHorizontal: 18,
    paddingVertical: 14,

    borderRadius: 22,

    backgroundColor:
      "#fff7ea",

    color: "#2d1b02",

    fontSize: 15,
    lineHeight: 24,
  },

  sendButton: {
    width: 48,
    height: 48,

    marginLeft: 12,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#c07d16",
  },

  disabled: {
    opacity: 0.45,
  },
});