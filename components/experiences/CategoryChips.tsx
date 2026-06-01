import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

export type ExperienceCategory = {
  label: string;
  value: string;
};

type CategoryChipsProps = {
  activeValue?: string;

  categories: ExperienceCategory[];

  onChange?: (
    value: string
  ) => void;
};

export function CategoryChips({
  activeValue,
  categories,
  onChange,
}: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.container
      }
    >
      {categories.map((category) => {
        const isActive =
          activeValue ===
          category.value;

        return (
          <Pressable
            key={category.value}
            onPress={() =>
              onChange?.(
                category.value
              )
            }
            style={({ pressed }) => [
              styles.pressable,
              pressed &&
                styles.pressed,
            ]}
          >
            {isActive ? (
              <Text
                style={
                  [
                    styles.chip,
                    styles.activeChip,
                    styles.activeText,
                  ]
                }
              >
                {category.label}
              </Text>
            ) : (
              <Text
                style={
                  [
                    styles.chip,
                    styles.inactiveChip,
                    styles.inactiveText,
                  ]
                }
              >
                {category.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },

  pressable: {
    borderRadius: 999,
  },

  pressed: {
    transform: [
      {
        scale: 0.97,
      },
    ],

    opacity: 0.92,
  },

  chip: {
    height: 36,

    paddingHorizontal: 14,

    borderRadius: 999,
    lineHeight: 36,
    overflow: "hidden",
    textAlign: "center",
  },

  activeChip: {
    backgroundColor: "#F97316",
  },

  inactiveChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7D7BE",
  },

  activeText: {
    color: "#fff",

    fontSize: 13,
    fontWeight: "800",
  },

  inactiveText: {
    color: "#7c5a21",

    fontSize: 13,
    fontWeight: "700",
  },
});
