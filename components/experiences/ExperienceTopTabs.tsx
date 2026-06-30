import { useRouter } from "expo-router";

import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ExperienceTopTabKey =
  | "feed"
  | "search"
  | "post"
  | "category"
  | "bookmarks";

type ExperienceTopTabsProps = {
  activeTab: ExperienceTopTabKey;

  onTabChange?: (
    tab: ExperienceTopTabKey
  ) => void;
};

const EXPERIENCE_TABS = [
  {
    href: "/(tabs)",
    key: "feed",
    label: "Feed",
  },

  {
    href: "/(tabs)/experiences/search",
    key: "search",
    label: "Search",
  },

  {
    href: "/(tabs)/experiences/post",
    key: "post",
    label: "Post",
  },

  {
    href:
      "/(tabs)/experiences/bookmarks",

    key: "bookmarks",

    label: "Bookmarks",
  },
] as const;

export function ExperienceTopTabs({
  activeTab,
  onTabChange,
}: ExperienceTopTabsProps) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {EXPERIENCE_TABS.map((tab) => {
          const isActive =
            activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                if (onTabChange) {
                  onTabChange(tab.key);
                  return;
                }

                router.push(
                  tab.href as any
                );
              }}
              style={({ pressed }) => [
                styles.pressable,
                pressed &&
                  styles.pressed,
              ]}
            >
              {isActive ? (
                <View
                  style={
                    styles.activeTab
                  }
                >
                  <Text
                    style={
                      styles.activeText
                    }
                  >
                    {tab.label}
                  </Text>
                </View>
              ) : (
                <View
                  style={
                    styles.inactiveTab
                  }
                >
                  <Text
                    style={
                      styles.inactiveText
                    }
                  >
                    {tab.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: 12,
  },

  content: {
    paddingHorizontal: 16,
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

  activeTab: {
    minWidth: 102,
    height: 44,

    paddingHorizontal: 18,

    borderRadius: 999,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#23201D",

    shadowColor: "#7C2D12",

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 4,
  },

  inactiveTab: {
    minWidth: 102,
    height: 44,

    paddingHorizontal: 18,

    borderRadius: 999,

    overflow: "hidden",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor: "#E7D7BE",

    backgroundColor: "#FFFFFF",
  },

  activeText: {
    color: "#fff",

    fontSize: 14,
    fontWeight: "900",
  },

  inactiveText: {
    color: "#6B7280",

    fontSize: 14,
    fontWeight: "800",
  },
});
