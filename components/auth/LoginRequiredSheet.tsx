import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogIn } from "lucide-react-native";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import { dismissLoginPrompt, openAuth, useLoginPrompt } from "@/services/login-prompt";
import { trackProductEvent } from "@/services/product-analytics";
import { loginPromptCopy } from "@/utils/login-prompt";

/**
 * Guest mode: "log in to continue", shown when a guest taps a member-only action. Solid cream
 * sheet (no blur). Login and Create account open over the current screen, so the devotee comes
 * back to exactly where they were.
 */
export function LoginRequiredSheet() {
  const { promptAction } = useLoginPrompt();
  const insets = useSafeAreaInsets();
  const copy = loginPromptCopy(promptAction ?? undefined);
  const visible = promptAction !== null;

  React.useEffect(() => {
    if (promptAction) void trackProductEvent("Login Prompt Shown", { action: promptAction });
  }, [promptAction]);

  const choose = (mode: "login" | "create") => {
    void trackProductEvent("Login Prompt Accepted", { action: promptAction ?? "default", mode });
    openAuth(mode);
  };

  return (
    <Modal animationType="slide" onRequestClose={dismissLoginPrompt} statusBarTranslucent transparent visible={visible}>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={dismissLoginPrompt} style={styles.backdrop} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.handle} />
          <View style={styles.icon}>
            <LogIn color="#C2410C" size={26} strokeWidth={2.4} />
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            {copy.title}
          </Text>
          <Text style={styles.message}>{copy.message}</Text>

          <Pressable accessibilityRole="button" onPress={() => choose("login")} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <LinearGradient colors={["#F97316", "#C2410C"]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.primaryFill}>
              <Text style={styles.primaryText}>Log in</Text>
            </LinearGradient>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => choose("create")} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>Create a free account</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={dismissLoginPrompt} style={styles.later}>
            <Text style={styles.laterText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(28, 25, 23, 0.55)" },
  handle: { alignSelf: "center", backgroundColor: EXPERIENCE_THEME.border, borderRadius: 3, height: 5, marginBottom: 18, width: 44 },
  icon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFEDD5",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  later: { alignItems: "center", paddingVertical: 12 },
  laterText: { color: "#8A7461", fontSize: 15, fontWeight: "700" },
  message: { color: EXPERIENCE_THEME.paragraph, fontSize: 15, fontWeight: "600", lineHeight: 22, marginTop: 8, textAlign: "center" },
  pressed: { opacity: 0.8 },
  primary: { borderRadius: 14, marginTop: 22, overflow: "hidden" },
  primaryFill: { alignItems: "center", paddingVertical: 15 },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  root: { flex: 1, justifyContent: "flex-end" },
  secondary: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#C2410C",
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 10,
    paddingVertical: 13,
  },
  secondaryText: { color: "#9A3412", fontSize: 15, fontWeight: "800" },
  sheet: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: { color: EXPERIENCE_THEME.heading, fontSize: 21, fontWeight: "900", marginTop: 14, textAlign: "center" },
});
