import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bookmark,
  Search,
  SquarePlus,
  type LucideIcon,
} from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

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

type ExperienceNavigationAction = {
  href: string;
  Icon: LucideIcon;
  key: "search" | "post" | "bookmarks";
  label: string;
};

const EXPERIENCE_ACTIONS: ExperienceNavigationAction[] = [
  {
    href: "/(tabs)/experiences/search",
    Icon: Search,
    key: "search",
    label: "Search experiences",
  },
  {
    href: "/(tabs)/experiences/post",
    Icon: SquarePlus,
    key: "post",
    label: "Create a post",
  },
  {
    href: "/(tabs)/experiences/bookmarks",
    Icon: Bookmark,
    key: "bookmarks",
    label: "Saved experiences",
  },
];

function ToolbarAction({
  active,
  Icon,
  label,
  onPress,
}: {
  active: boolean;
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        active && styles.activeIconButton,
        pressed && styles.pressedIconButton,
      ]}
    >
      <Icon
        color={active ? "#C2410C" : "#292524"}
        fill={active && Icon === Bookmark ? "#C2410C" : "none"}
        size={23}
        strokeWidth={active ? 2.45 : 2.15}
      />
      {active ? <View style={styles.activeDot} /> : null}
    </Pressable>
  );
}

export function ExperienceTopTabs({
  activeTab,
  onTabChange,
}: ExperienceTopTabsProps) {
  const router = useRouter();
  const showBackButton = activeTab !== "feed";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/experiences" as never);
  };

  const handleActionPress = (action: ExperienceNavigationAction) => {
    if (action.key === activeTab) {
      return;
    }

    if (onTabChange) {
      onTabChange(action.key);
      return;
    }

    router.push(action.href as never);
  };

  return (
    <View style={styles.wrapper}>
      {showBackButton ? (
        <Pressable
          accessibilityLabel="Back to experiences"
          accessibilityRole="button"
          hitSlop={6}
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedIconButton,
          ]}
        >
          <ArrowLeft color="#292524" size={24} strokeWidth={2.2} />
        </Pressable>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      <View style={styles.actions}>
        {EXPERIENCE_ACTIONS.map((action) => (
          <ToolbarAction
            active={activeTab === action.key}
            Icon={action.Icon}
            key={action.key}
            label={action.label}
            onPress={() => handleActionPress(action)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    backgroundColor: "#FFFCF7",
    borderBottomColor: "#EEE7DC",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 52,
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  backButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backButtonPlaceholder: {
    height: 44,
    width: 44,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    position: "relative",
    width: 44,
  },
  activeIconButton: {
    backgroundColor: "#FFF4E8",
  },
  pressedIconButton: {
    backgroundColor: "#F5EFE7",
    opacity: 0.76,
  },
  activeDot: {
    backgroundColor: "#C2410C",
    borderRadius: 2,
    bottom: 4,
    height: 3,
    position: "absolute",
    width: 3,
  },
});
