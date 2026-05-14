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
    href: "/(tabs)/experiences/category",
    key: "category",
    label: "Categories",
  },
  {
    href: "/(tabs)/experiences/bookmarks",
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
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {EXPERIENCE_TABS.map((tab) => {
          const isActive =
            activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              android_ripple={{
                color:
                  "rgba(255,255,255,0.12)",
              }}
              onPress={() => {
                if (onTabChange) {
                  onTabChange(tab.key);
                  return;
                }

                router.push(tab.href);
              }}
              style={({ pressed }) => [
                styles.tab,
                isActive &&
                  styles.activeTab,
                pressed &&
                  styles.pressedTab,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  isActive &&
                    styles.activeLabel,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>

              {isActive && (
                <View
                  style={
                    styles.activeIndicator
                  }
                />
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
    marginTop: 10,
    marginBottom: 12,
  },

  content: {
    paddingHorizontal: 18,
    gap: 12,
  },

  tab: {
    minWidth: 96,
    height: 46,

    borderRadius: 18,

    paddingHorizontal: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.78)",

    borderWidth: 1,
    borderColor:
      "rgba(222, 188, 122, 0.45)",

    overflow: "hidden",

    position: "relative",
  },

  activeTab: {
    backgroundColor: "#8e5d10",

    borderColor: "#8e5d10",

    shadowColor: "#8e5d10",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.24,
    shadowRadius: 18,

    elevation: 8,
  },

  pressedTab: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  label: {
    fontSize: 14,
    fontWeight: "800",

    color: "#7b5a1c",

    letterSpacing: 0.2,
  },

  activeLabel: {
    color: "#fff",
  },

  activeIndicator: {
    position: "absolute",

    bottom: 0,

    width: 26,
    height: 4,

    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,

    backgroundColor:
      "rgba(255,255,255,0.92)",
  },
});