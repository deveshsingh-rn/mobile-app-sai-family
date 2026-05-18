import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import { BlurView } from "expo-blur";

import { LinearGradient } from "expo-linear-gradient";

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
              <LinearGradient
                colors={[
                  "#d89d38",
                  "#9b6513",
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 1,
                }}
                style={
                  styles.activeChip
                }
              >
                <Text
                  style={
                    styles.activeText
                  }
                >
                  {category.label}
                </Text>
              </LinearGradient>
            ) : (
              <BlurView
                intensity={40}
                tint="light"
                style={
                  styles.inactiveChip
                }
              >
                <Text
                  style={
                    styles.inactiveText
                  }
                >
                  {category.label}
                </Text>
              </BlurView>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    gap: 10,
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

  activeChip: {
    height: 42,

    paddingHorizontal: 18,

    borderRadius: 999,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#9b6513",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.2,
    shadowRadius: 16,

    elevation: 6,
  },

  inactiveChip: {
    height: 42,

    paddingHorizontal: 18,

    borderRadius: 999,

    overflow: "hidden",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      "rgba(225,198,158,0.45)",

    backgroundColor:
      "rgba(255,255,255,0.55)",
  },

  activeText: {
    color: "#fff",

    fontSize: 13,
    fontWeight: "800",

    letterSpacing: 0.2,
  },

  inactiveText: {
    color: "#7c5a21",

    fontSize: 13,
    fontWeight: "700",

    letterSpacing: 0.2,
  },
});