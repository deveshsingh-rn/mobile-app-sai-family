import React, {
  useEffect,
  useRef,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { BlurView } from "expo-blur";
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Building2,
  CalendarDays,
  House,
  UserCircle2,
  Users,
} from "lucide-react-native";

const COLORS = {
  active: "#171717",
  inactive: "#78716C",
};

function canUseNativeGlass() {
  try {
    return isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

const TABS = [
  {
    Icon: House,
    label: "Devotee Experience",
    name: "experiences",
  },
  {
    Icon: CalendarDays,
    label: "Devotee Events",
    name: "events",
  },
  {
    Icon: Building2,
    label: " Sai     Connect",
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

function TabItem({
  focused,
  Icon,
  label,
  nativeGlassAvailable,
  onPress,
}: {
  focused: boolean;
  Icon: any;
  label: string;
  nativeGlassAvailable: boolean;
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

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabItem,
        focused && styles.tabItemActive,
        pressed && styles.pressed,
      ]}
    >
      {nativeGlassAvailable ? (
        <GlassView
          colorScheme="light"
          glassEffectStyle="regular"
          isInteractive
          pointerEvents="none"
          style={[styles.glassCircle, styles.nativeGlassCircle]}
          tintColor={focused ? "rgba(255, 237, 213, 0.42)" : "rgba(255, 255, 255, 0.2)"}
        />
      ) : (
        <BlurView
          intensity={focused ? 80 : 65}
          pointerEvents="none"
          style={[
            styles.glassCircle,
            styles.fallbackGlassCircle,
            focused && styles.activeGlassFallback,
          ]}
          tint="light"
        />
      )}

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
          color={focused ? COLORS.active : COLORS.inactive}
          size={27}
          strokeWidth={focused ? 2.7 : 2}
        />
      </Animated.View>
    </Pressable>
  );
}

export default function CustomTabBar({
  navigation,
  state,
}: any) {
  const insets = useSafeAreaInsets();
  const nativeGlassAvailable = canUseNativeGlass();
  const activeRoute = state.routes[state.index];
  const nestedState = activeRoute?.state;
  const nestedRoute =
    nestedState?.routes?.[
      nestedState.index ?? 0
    ];
  const isFocusedExperienceScreen =
    activeRoute?.name === "experiences" &&
    (nestedRoute?.name === "[id]" ||
      nestedRoute?.name === "ask-sai");

  if (isFocusedExperienceScreen) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { height: 66 + Math.max(insets.bottom, 8) },
      ]}
    >
      <View
        style={[
          styles.dock,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        <GlassContainer spacing={12} style={styles.tabsRow}>
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
                nativeGlassAvailable={nativeGlassAvailable}
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
                nativeGlassAvailable={nativeGlassAvailable}
                onPress={() => navigation.navigate(tab.name)}
              />
            );
          })}
        </GlassContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    backgroundColor: "transparent",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  glassCircle: {
    borderColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    height: 50,
    overflow: "hidden",
    position: "absolute",
    width: 50,
  },
  nativeGlassCircle: {
    backgroundColor: "transparent",
  },
  fallbackGlassCircle: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeGlassFallback: {
    backgroundColor: "rgba(255, 237, 213, 0.66)",
    borderColor: "rgba(249, 115, 22, 0.38)",
  },
  iconWrap: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  pressed: {
    opacity: 0.55,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    height: 66,
    justifyContent: "center",
    minWidth: 0,
    shadowColor: "#292524",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabItemActive: {
    transform: [{ translateY: -1 }],
  },
  tabsRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 66,
    paddingHorizontal: 10,
  },
  wrapper: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
});
