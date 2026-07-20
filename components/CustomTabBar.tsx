import React, {
  useEffect,
  useRef,
} from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BlurView } from "expo-blur";
import {
  Building2,
  CalendarDays,
  House,
  UserCircle2,
  Users,
} from "lucide-react-native";

const COLORS = {
  active: "#1F2937",
  border: "#E7D7BE",
  dock: "rgba(255,255,255,0.94)",
  inactive: "#78716C",
  primary: "#F97316",
  soft: "#FFF7ED",
};

const TABS = [
  {
    Icon: House,
    label: "Devotee Experiences",
    name: "experiences",
  },
  {
    Icon: CalendarDays,
    label: "Devotee Events",
    name: "events",
  },
  {
    Icon: Building2,
    label: "Business Directory",
    name: "directory",
  },
  {
    Icon: Users,
    label: "Local community",
    name: "sangha",
  },
  {
    Icon: UserCircle2,
    label: "Devotee Profile",
    name: "profile",
  },
];

const BOTTOM = Platform.OS === "ios" ? 24 : 14;

function TabItem({
  focused,
  Icon,
  label,
  onPress,
}: {
  focused: boolean;
  Icon: any;
  label: string;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      damping: 18,
      mass: 0.8,
      stiffness: 180,
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [anim, focused]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const activeOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabItem,
        focused && styles.tabItemActive,
        pressed && styles.pressed,
      ]}
    >
      <Animated.View
        style={[
          styles.activePill,
          {
            opacity: activeOpacity,
            transform: [
              {
                scale,
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.iconWrap,
          {
            transform: [
              {
                scale,
              },
            ],
          },
        ]}
      >
        <Icon
          color={focused ? COLORS.primary : COLORS.inactive}
          size={21}
          strokeWidth={focused ? 2.5 : 2}
        />
      </Animated.View>

      <Text
        numberOfLines={2}
        style={[
          styles.label,
          focused && styles.labelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function CustomTabBar({
  navigation,
  state,
}: any) {
  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <BlurView intensity={70} tint="light" style={styles.dock}>
        <View style={styles.tabsRow}>
          {TABS.slice(0, 2).map((tab) => {
            const index = state.routes.findIndex(
              (route: any) => route.name === tab.name
            );
            const focused = state.index === index;

            return (
              <TabItem
                key={tab.name}
                Icon={tab.Icon}
                focused={focused}
                label={tab.label}
                onPress={() => navigation.navigate(tab.name)}
              />
            );
          })}

         
          {TABS.slice(2).map((tab) => {
            const index = state.routes.findIndex(
              (route: any) => route.name === tab.name
            );
            const focused = state.index === index;

            return (
              <TabItem
                key={tab.name}
                Icon={tab.Icon}
                focused={focused}
                label={tab.label}
                onPress={() => navigation.navigate(tab.name)}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  activePill: {
    backgroundColor: "#FFF4E6",
    borderColor: COLORS.primary,
    borderRadius: 18,
    borderWidth: 1.4,
    bottom: 4,
    left: 3,
    position: "absolute",
    right: 3,
    top: 4,
  },
  
  createPressable: {
    alignItems: "center",
    height: 62,
    justifyContent: "center",
    width: 58,
  },
  createSlot: {
    alignItems: "center",
    justifyContent: "center",
    width: 58,
  },
  dock: {
    backgroundColor: COLORS.dock,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    bottom: BOTTOM,
    left: 12,
    overflow: "hidden",
    paddingHorizontal: 5,
    position: "absolute",
    right: 12,
    shadowColor: "#7C2D12",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 12,
  },
  iconWrap: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 28,
  },
  label: {
    color: COLORS.inactive,
    flexShrink: 1,
    fontSize: 10.5,
    fontWeight: "800",
    lineHeight: 12.5,
    marginTop: 3,
    maxWidth: "100%",
    minHeight: 25,
    paddingHorizontal: 2,
    textAlign: "center",
  },
  labelActive: {
    color: COLORS.active,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.82,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    height: 76,
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: 2,
  },
  tabItemActive: {
    transform: [{ translateY: -2 }],
  },
  tabsRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 82,
  },
  wrapper: {
    bottom: 0,
    height: 126,
    left: 0,
    position: "absolute",
    right: 0,
  },
});
