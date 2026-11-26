import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { MessageCircle } from "lucide-react-native";

/**
 * Guest mode: shown instead of the comment box. `onPress` opens the login sheet (inside another
 * sheet, close that one first — two modals cannot open at once on iOS).
 */
export function GuestCommentPrompt({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.box, pressed && styles.pressed]}>
      <MessageCircle color="#C2410C" size={18} strokeWidth={2.4} />
      <Text style={styles.text}>Log in to comment</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginHorizontal: 12,
    marginVertical: 10,
    paddingVertical: 14,
  },
  pressed: { opacity: 0.75 },
  text: { color: "#9A3412", fontSize: 15, fontWeight: "800" },
});
