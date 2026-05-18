import { useRouter } from "expo-router";

import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BlurView } from "expo-blur";

import { LinearGradient } from "expo-linear-gradient";

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
      "/(tabs)/experiences/category",

    key: "category",

    label: "Categories",
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
                <LinearGradient
                  colors={[
                    "#c88a24",
                    "#8e5d10",
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
                </LinearGradient>
              ) : (
                <BlurView
                  intensity={55}
                  tint="light"
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
                </BlurView>
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
    paddingHorizontal: 18,
    gap: 12,
  },

  pressable: {
    borderRadius: 18,
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
    minWidth: 104,
    height: 46,

    paddingHorizontal: 20,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#8e5d10",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.24,
    shadowRadius: 18,

    elevation: 10,
  },

  inactiveTab: {
    minWidth: 104,
    height: 46,

    paddingHorizontal: 20,

    borderRadius: 18,

    overflow: "hidden",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      "rgba(226,195,145,0.45)",

    backgroundColor:
      "rgba(255,255,255,0.55)",
  },

  activeText: {
    color: "#fff",

    fontSize: 14,
    fontWeight: "800",

    letterSpacing: 0.2,
  },

  inactiveText: {
    color: "#7b5b22",

    fontSize: 14,
    fontWeight: "700",

    letterSpacing: 0.2,
  },
});