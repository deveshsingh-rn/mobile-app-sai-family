import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ExperienceCategory = {
  label: string;
  value: string;
};

type CategoryChipsProps = {
  activeValue?: string;
  categories: ExperienceCategory[];
  onChange?: (value: string) => void;
};

export function CategoryChips({
  activeValue,
  categories,
  onChange,
}: CategoryChipsProps) {
  return (
    <ScrollView
      accessibilityRole="tablist"
      alwaysBounceHorizontal={false}
      bounces={false}
      contentContainerStyle={styles.container}
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => {
        const isActive = activeValue === category.value;

        return (
          <Pressable
            accessibilityLabel={`${category.label} category`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            hitSlop={{ bottom: 4, top: 4 }}
            key={category.value}
            onPress={() => onChange?.(category.value)}
            style={({ pressed }) => [
              styles.chip,
              isActive ? styles.activeChip : styles.inactiveChip,
              pressed && styles.pressed,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.label, isActive ? styles.activeText : styles.inactiveText]}
            >
              {category.label}
            </Text>
            {isActive ? <View style={styles.activeAccent} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 12,
  },
  pressed: {
    backgroundColor: "#F7F2EA",
    opacity: 0.7,
  },
  chip: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    minWidth: 52,
    paddingHorizontal: 12,
    position: "relative",
  },
  activeChip: {
    backgroundColor: "transparent",
  },
  inactiveChip: {
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
  },
  activeText: {
    color: "#1C1917",
    fontWeight: "800",
  },
  inactiveText: {
    color: "#78716C",
  },
  activeAccent: {
    backgroundColor: "#C2410C",
    borderRadius: 2,
    bottom: 0,
    height: 2,
    left: 12,
    position: "absolute",
    right: 12,
  },
});
