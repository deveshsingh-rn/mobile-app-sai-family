import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bookmark,
  Plus,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react-native";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppSelector } from "@/store/hooks";
import { selectDevoteeAccount } from "@/store/devotee-account/selectors";

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

const CREATE_POST_ACTION: ExperienceNavigationAction = {
  href: "/(tabs)/experiences/post",
  Icon: Plus,
  key: "post",
  label: "Create a post",
};

const EXPERIENCE_ACTIONS: ExperienceNavigationAction[] = [
  {
    href: "/(tabs)/experiences/search",
    Icon: Search,
    key: "search",
    label: "Search experiences",
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

function CreateProfileAction({
  active,
  name,
  onPress,
  profileImageUrl,
}: {
  active: boolean;
  name?: string;
  onPress: () => void;
  profileImageUrl?: string;
}) {
  const initial = name?.trim().charAt(0).toUpperCase() || "S";

  return (
    <Pressable
      accessibilityLabel="Create a post"
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.createButton,
        active && styles.activeCreateButton,
        pressed && styles.pressedIconButton,
      ]}
    >
      {profileImageUrl ? (
        <Image source={{ uri: profileImageUrl }} style={styles.createAvatar} />
      ) : (
        <View style={[styles.createAvatar, styles.createAvatarFallback]}>
          <Text style={styles.createAvatarText}>{initial}</Text>
        </View>
      )}
      <View style={styles.createBadge}>
        <Plus color="#FFFFFF" size={12} strokeWidth={3.2} />
      </View>
    </Pressable>
  );
}

export function ExperienceTopTabs({
  activeTab,
  onTabChange,
}: ExperienceTopTabsProps) {
  const router = useRouter();
  const account = useAppSelector(selectDevoteeAccount);
  const showBackButton = activeTab !== "feed";
  const profileImageUrl =
    account?.profileImage?.uri ||
    account?.profileImageUrl ||
    account?.profile?.profileImageUrl;

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
      <View style={styles.leadingGroup}>
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
        ) : null}

        <CreateProfileAction
          active={activeTab === CREATE_POST_ACTION.key}
          name={account?.name}
          onPress={() => handleActionPress(CREATE_POST_ACTION)}
          profileImageUrl={profileImageUrl}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Open Sai Naam Jap counter"
          accessibilityRole="button"
          hitSlop={4}
          onPress={() => router.push("/naam-jap" as never)}
          style={({ pressed }) => [
            styles.naamJapButton,
            pressed && styles.pressedIconButton,
          ]}
        >
          <Sparkles color="#9A3412" size={14} strokeWidth={2.4} />
          <Text numberOfLines={1} style={styles.naamJapText}>
            Naam Jap
          </Text>
        </Pressable>

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
  leadingGroup: {
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
  iconButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    position: "relative",
    width: 44,
  },
  naamJapButton: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    height: 46,
    justifyContent: "center",
    paddingHorizontal: 9,
  },
  naamJapText: {
    color: "#9A3412",
    fontSize: 11,
    fontWeight: "900",
  },
  createButton: {
    alignItems: "center",
    borderColor: "#FFFFFF",
    borderRadius: 30,
    borderWidth: 2,
    height: 60,
    justifyContent: "center",
    position: "relative",
    width: 60,
  },
  activeCreateButton: {
    borderColor: "#F97316",
  },
  createAvatar: {
    backgroundColor: "#F1E4CE",
    borderRadius: 30,
    height: 60,
    width: 60,
  },
  createAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  createAvatarText: {
    color: "#9A3412",
    fontSize: 15,
    fontWeight: "900",
  },
  createBadge: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderColor: "#FFFCF7",
    borderRadius: 9,
    borderWidth: 2,
    bottom: -1,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: -1,
    shadowColor: "#9A3412",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: 18,
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
