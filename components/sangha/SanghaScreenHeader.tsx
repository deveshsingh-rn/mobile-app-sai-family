import React, { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  SanghaColors,
  SanghaRadius,
  SanghaShadow,
  SanghaSpace,
  SanghaType,
} from "@/constants/sangha-theme";

type SanghaScreenHeaderProps = {
  onBack?: () => void;
  right?: ReactNode;
  subtitle?: string;
  title: string;
};

export function SanghaHeaderAction({
  accessibilityLabel,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons color={SanghaColors.ink} name={icon} size={21} />
    </Pressable>
  );
}

export function SanghaScreenHeader({
  onBack,
  right,
  subtitle,
  title,
}: SanghaScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <SanghaHeaderAction
          accessibilityLabel="Go back"
          icon="arrow-back"
          onPress={onBack}
        />
      ) : null}
      <View style={[styles.copy, !onBack && styles.copyWithoutBack]}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={2} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    backgroundColor: SanghaColors.surface,
    borderColor: SanghaColors.border,
    borderRadius: SanghaRadius.control,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
    ...SanghaShadow,
  },
  copy: {
    flex: 1,
    marginLeft: 13,
  },
  copyWithoutBack: {
    marginLeft: 0,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 72,
    paddingBottom: 12,
    paddingHorizontal: SanghaSpace.page,
    paddingTop: 8,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  right: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 10,
  },
  subtitle: {
    color: SanghaColors.inkSecondary,
    marginTop: 2,
    ...SanghaType.caption,
  },
  title: {
    color: SanghaColors.ink,
    ...SanghaType.pageTitle,
  },
});
