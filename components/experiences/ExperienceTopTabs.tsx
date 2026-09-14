import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Bookmark,
  Plus,
  Search,
  UserCircle2,
  type LucideIcon,
} from "lucide-react-native";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppSelector } from "@/store/hooks";
import { selectDevoteeAccount } from "@/store/devotee-account/selectors";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";

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
  key: "search" | "post" | "bookmarks" | "profile";
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
  {
    href: "/(tabs)/profile",
    Icon: UserCircle2,
    key: "profile",
    label: "Open devotee profile",
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
        color={active ? EXPERIENCE_THEME.heading : EXPERIENCE_THEME.paragraph}
        fill={active && Icon === Bookmark ? EXPERIENCE_THEME.heading : "none"}
        size={32}
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
        pressed && styles.pressedCreateButton,
      ]}
    >
      <LinearGradient
        colors={active ? ["#C2410C", "#F59E0B"] : ["#F59E0B", "#C2410C"]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.createRing}
      >
        <View style={styles.createAvatarInset}>
          {profileImageUrl ? (
            <Image
              resizeMode="cover"
              source={{ uri: profileImageUrl }}
              style={styles.createAvatar}
            />
          ) : (
            <View style={[styles.createAvatar, styles.createAvatarFallback]}>
              <Text style={styles.createAvatarText}>{initial}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
      <View style={styles.createBadge}>
        <Plus color="#FFFFFF" size={12} strokeWidth={3.4} />
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

    if (onTabChange && action.key !== "profile") {
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
            <ArrowLeft
              color={EXPERIENCE_THEME.paragraph}
              size={24}
              strokeWidth={2.2}
            />
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
    backgroundColor: EXPERIENCE_THEME.background,
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 66,
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
  createButton: {
    alignItems: "center",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    position: "relative",
    width: 60,
  },
  activeCreateButton: {
    backgroundColor: EXPERIENCE_THEME.background,
  },
  pressedCreateButton: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  createRing: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  createAvatarInset: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  createAvatar: {
    backgroundColor: EXPERIENCE_THEME.border,
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  createAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  createAvatarText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 18,
    fontWeight: "900",
  },
  createBadge: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.background,
    borderRadius: 10,
    borderWidth: 2,
    bottom: 1,
    height: 21,
    justifyContent: "center",
    position: "absolute",
    right: 1,
    shadowColor: EXPERIENCE_THEME.heading,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: 21,
  },
  activeIconButton: {
    backgroundColor: EXPERIENCE_THEME.background,
  },
  pressedIconButton: {
    backgroundColor: EXPERIENCE_THEME.border,
    opacity: 0.76,
  },
  activeDot: {
    backgroundColor: EXPERIENCE_THEME.heading,
    borderRadius: 2,
    bottom: 4,
    height: 3,
    position: "absolute",
    width: 3,
  },
});
