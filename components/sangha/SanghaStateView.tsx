import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import {
  SanghaColors,
  SanghaRadius,
  SanghaSpace,
  SanghaType,
} from "@/constants/sangha-theme";

type SanghaStateViewProps = {
  actionLabel?: string;
  body?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  onAction?: () => void;
  title: string;
};

export function SanghaStateView({
  actionLabel,
  body,
  icon = "people-outline",
  loading,
  onAction,
  title,
}: SanghaStateViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        {loading ? (
          <ActivityIndicator color={SanghaColors.saffron} />
        ) : (
          <Ionicons color={SanghaColors.saffron} name={icon} size={29} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: SanghaColors.maroon,
    borderRadius: SanghaRadius.control,
    marginTop: 18,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  actionText: {
    color: SanghaColors.surface,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  body: {
    color: SanghaColors.inkSecondary,
    marginTop: 7,
    maxWidth: 310,
    textAlign: "center",
    ...SanghaType.body,
  },
  container: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: SanghaColors.surface,
    borderColor: SanghaColors.border,
    borderRadius: SanghaRadius.panel,
    borderWidth: 1,
    justifyContent: "center",
    padding: SanghaSpace.section,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: SanghaColors.saffronSoft,
    borderRadius: SanghaRadius.round,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  title: {
    color: SanghaColors.ink,
    marginTop: 14,
    textAlign: "center",
    ...SanghaType.cardTitle,
  },
});
