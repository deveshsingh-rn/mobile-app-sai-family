import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Bookmark, Search, UserRound, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import { selectDevoteeAccount } from "@/store/devotee-account/selectors";
import { useAppSelector } from "@/store/hooks";

const MENU_ACTIONS = [
  {
    href: "/(tabs)/profile",
    Icon: UserRound,
    label: "My Profile",
    subtitle: "View and Manage Your Devotee Profile",
  },
  {
    href: "/(tabs)/experiences/search",
    Icon: Search,
    label: "Search",
    subtitle: "Find Experiences Shared By Devotees",
  },
  {
    href: "/(tabs)/experiences/bookmarks",
    Icon: Bookmark,
    label: "Saved Experiences",
    subtitle: "Open Posts You Have Bookmarkend",
  },
] as const;

export function ExperienceProfileMenu() {
  const insets = useSafeAreaInsets();
  const account = useAppSelector(selectDevoteeAccount);
  const [visible, setVisible] = useState(false);
  const profileImageUrl =
    account?.profileImage?.uri ||
    account?.profileImageUrl ||
    account?.profile?.profileImageUrl;
  const initial = account?.name?.trim().charAt(0).toUpperCase() || "S";

  const navigateTo = (href: string) => {
    setVisible(false);
    requestAnimationFrame(() => router.push(href as never));
  };

  return (
    <>
      <Pressable
        accessibilityHint="Opens profile and experience shortcuts"
        accessibilityLabel="Open quick menu"
        accessibilityRole="button"
        hitSlop={6}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.pressed,
        ]}
      >
        {profileImageUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            source={{ uri: profileImageUrl }}
            style={styles.triggerImage}
          />
        ) : (
          <Text style={styles.triggerInitial}>{initial}</Text>
        )}
      </Pressable>

      <Modal
        animationType="slide"
        onRequestClose={() => setVisible(false)}
        statusBarTranslucent
        transparent
        visible={visible}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close quick menu"
            onPress={() => setVisible(false)}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 18) },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Quick Access</Text>
                <Text numberOfLines={1} style={styles.sheetSubtitle}>
                  {account?.name || "Sai Devotee"}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close quick menu"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setVisible(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
              >
                <X color={EXPERIENCE_THEME.heading} size={22} strokeWidth={2.3} />
              </Pressable>
            </View>

            <View style={styles.menuList}>
              {MENU_ACTIONS.map(({ href, Icon, label, subtitle }) => (
                <Pressable
                  accessibilityLabel={label}
                  accessibilityRole="button"
                  key={href}
                  onPress={() => navigateTo(href)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && styles.menuRowPressed,
                  ]}
                >
                  <View style={styles.menuIcon}>
                    <Icon
                      color={EXPERIENCE_THEME.heading}
                      size={23}
                      strokeWidth={2.2}
                    />
                  </View>
                  <View style={styles.menuCopy}>
                    <Text style={styles.menuLabel}>{label}</Text>
                    <Text style={styles.menuSubtitle}>{subtitle}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "#D9C6A8",
    borderRadius: 2,
    height: 4,
    marginBottom: 18,
    width: 42,
  },
  menuCopy: {
    flex: 1,
  },
  menuIcon: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  menuLabel: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 17,
    fontWeight: "800",
  },
  menuList: {
    gap: 8,
  },
  menuRow: {
    alignItems: "center",
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 14,
    minHeight: 72,
    paddingHorizontal: 4,
  },
  menuRowPressed: {
    backgroundColor: "rgba(254, 215, 170, 0.22)",
  },
  menuSubtitle: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2,
  },
  modalRoot: {
    backgroundColor: "rgba(45, 28, 15, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  sheet: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sheetSubtitle: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
    maxWidth: 250,
  },
  sheetTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 22,
    fontWeight: "900",
  },
  trigger: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 29,
    borderWidth: 2,
    height: 58,
    justifyContent: "center",
    overflow: "hidden",
    width: 58,
  },
  triggerImage: {
    height: "100%",
    width: "100%",
  },
  triggerInitial: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 21,
    fontWeight: "900",
  },
});
