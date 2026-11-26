import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserRound } from "lucide-react-native";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import { openAuth } from "@/services/login-prompt";
import { selectDevoteeAccount } from "@/store/devotee-account/selectors";
import { useAppSelector } from "@/store/hooks";
import { loginPromptCopy, type AccountAction } from "@/utils/login-prompt";

/**
 * Guest mode: a screen that needs an account (create post, my events, Sangha, …). Members see the
 * screen; guests see a friendly "create your account" page instead — also when they arrive from a
 * link or notification.
 */
export function withMembersOnly<P extends object>(Screen: React.ComponentType<P>, action: AccountAction) {
  function MembersOnlyScreen(props: P) {
    const account = useAppSelector(selectDevoteeAccount);
    if (account) return <Screen {...props} />;
    return <MembersOnlyPage action={action} />;
  }
  MembersOnlyScreen.displayName = `MembersOnly(${Screen.displayName || Screen.name || "Screen"})`;
  return MembersOnlyScreen;
}

function MembersOnlyPage({ action }: { action: AccountAction }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const copy = loginPromptCopy(action);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/experiences" as never);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <View style={styles.icon}>
        <UserRound color="#C2410C" size={30} strokeWidth={2.3} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {copy.title}
      </Text>
      <Text style={styles.message}>{copy.message}</Text>

      <Pressable accessibilityRole="button" onPress={() => openAuth("login")} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
        <LinearGradient colors={["#F97316", "#C2410C"]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.primaryFill}>
          <Text style={styles.primaryText}>Log in</Text>
        </LinearGradient>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => openAuth("create")} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
        <Text style={styles.secondaryText}>Create a free account</Text>
      </Pressable>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={goBack} style={styles.back}>
        <Text style={styles.backText}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "center", paddingVertical: 14 },
  backText: { color: "#8A7461", fontSize: 15, fontWeight: "700" },
  icon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFEDD5",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  message: { color: EXPERIENCE_THEME.paragraph, fontSize: 15, fontWeight: "600", lineHeight: 22, marginTop: 10, textAlign: "center" },
  pressed: { opacity: 0.8 },
  primary: { borderRadius: 14, marginTop: 28, overflow: "hidden" },
  primaryFill: { alignItems: "center", paddingVertical: 15 },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  root: { backgroundColor: EXPERIENCE_THEME.background, flex: 1, paddingHorizontal: 24 },
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
  title: { color: EXPERIENCE_THEME.heading, fontSize: 22, fontWeight: "900", marginTop: 18, textAlign: "center" },
});
