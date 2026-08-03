import { useRouter } from "expo-router";
import {
  Bookmark,
  House,
  Search,
  SquarePlus,
  type LucideIcon,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
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
  onTabChange?: (tab: ExperienceTopTabKey) => void;
};

type ExperienceNavigationTab = {
  href: string;
  Icon: LucideIcon;
  key: Exclude<ExperienceTopTabKey, "category">;
  label: string;
  primary?: boolean;
};

const EXPERIENCE_TABS: ExperienceNavigationTab[] = [
  {
    href: "/(tabs)/experiences",
    Icon: House,
    key: "feed",
    label: "Feed",
  },
  {
    href: "/(tabs)/experiences/search",
    Icon: Search,
    key: "search",
    label: "Search",
  },
  {
    href: "/(tabs)/experiences/post",
    Icon: SquarePlus,
    key: "post",
    label: "Post",
    primary: true,
  },
  {
    href: "/(tabs)/experiences/bookmarks",
    Icon: Bookmark,
    key: "bookmarks",
    label: "Saved",
  },
];

function ExperienceNavigationItem({
  active,
  Icon,
  label,
  onPress,
  primary = false,
}: {
  active: boolean;
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      damping: 17,
      mass: 0.75,
      stiffness: 190,
      toValue: active ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [active, progress]);

  const iconScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <Pressable
      accessibilityLabel={`${label} experiences`}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        pressed && styles.tabPressed,
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          primary && styles.primaryIconContainer,
          active && !primary && styles.activeIconContainer,
          {
            transform: [{ scale: iconScale }],
          },
        ]}
      >
        <Icon
          color={primary ? "#FFFFFF" : active ? "#C2410C" : "#78716C"}
          fill={active && !primary && label !== "Search" ? "#FFEDD5" : "none"}
          size={primary ? 24 : 23}
          strokeWidth={active || primary ? 2.5 : 2.1}
        />
      </Animated.View>

      {active ? <View style={styles.activeIndicator} /> : null}
    </Pressable>
  );
}

export function ExperienceTopTabs({
  activeTab,
  onTabChange,
}: ExperienceTopTabsProps) {
  const router = useRouter();

  const handleTabPress = (tab: ExperienceNavigationTab) => {
    if (tab.key === activeTab) {
      return;
    }

    if (onTabChange) {
      onTabChange(tab.key);
      return;
    }

    if (tab.key === "feed") {
      router.replace(tab.href as never);
      return;
    }

    router.push(tab.href as never);
  };

  return (
    <View accessibilityRole="tablist" style={styles.wrapper}>
      {EXPERIENCE_TABS.map((tab) => (
        <ExperienceNavigationItem
          active={activeTab === tab.key}
          Icon={tab.Icon}
          key={tab.key}
          label={tab.label}
          onPress={() => handleTabPress(tab)}
          primary={tab.primary}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "stretch",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E9D8BD",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F3E8D5",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 54,
    paddingHorizontal: 18,
  },
  tab: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
    position: "relative",
  },
  tabPressed: {
    opacity: 0.68,
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 15,
    height: 38,
    justifyContent: "center",
    width: 46,
  },
  activeIconContainer: {
    backgroundColor: "#FFF7ED",
  },
  primaryIconContainer: {
    backgroundColor: "#C2410C",
    borderColor: "#FED7AA",
    borderRadius: 17,
    borderWidth: 2,
    height: 40,
    shadowColor: "#9A3412",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    width: 48,
    elevation: 5,
  },
  activeIndicator: {
    backgroundColor: "#F97316",
    borderRadius: 999,
    bottom: 0,
    height: 3,
    left: "31%",
    position: "absolute",
    right: "31%",
  },
});
