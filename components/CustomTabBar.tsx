import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { BlurView } from "expo-blur";
import { router } from "expo-router";
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
  Sparkles,
  UserCircle2,
  Users,
  type LucideIcon,
} from "lucide-react-native";

const COLORS = {
  active: "#171717",
  inactive: "#78716C",
};

const ACTIVE_INDICATOR_HEIGHT = 48;
const ACTIVE_INDICATOR_WIDTH = 68;

function canUseNativeGlass() {
  try {
    return isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

type PillarTab = {
  href?: string;
  Icon: LucideIcon;
  label: string;
  name: string;
};

const TABS: PillarTab[] = [
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
    href: "/naam-jap",
    Icon: Sparkles,
    label: "Naam Jap",
    name: "naam-jap",
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
  const [dockWidth, setDockWidth] = useState(0);
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
  const activeTabIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.name === activeRoute?.name)
  );
  const activeTabProgress = useRef(
    new Animated.Value(activeTabIndex)
  ).current;

  useEffect(() => {
    Animated.spring(activeTabProgress, {
      damping: 22,
      mass: 0.8,
      stiffness: 230,
      toValue: activeTabIndex,
      useNativeDriver: true,
    }).start();
  }, [activeTabIndex, activeTabProgress]);

  const tabWidth = dockWidth / TABS.length;
  const indicatorPositions = TABS.map((_, index) => {
    const centeredPosition =
      index * tabWidth +
      (tabWidth - ACTIVE_INDICATOR_WIDTH) / 2;
    const maximumPosition = Math.max(
      4,
      dockWidth - ACTIVE_INDICATOR_WIDTH - 4
    );

    return Math.min(
      Math.max(centeredPosition, 4),
      maximumPosition
    );
  });
  const indicatorTranslateX = activeTabProgress.interpolate({
    inputRange: TABS.map((_, index) => index),
    outputRange: indicatorPositions,
  });

  if (isFocusedExperienceScreen) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { height: 76 + Math.max(insets.bottom, 8) },
      ]}
    >
      <View
        style={[
          styles.dock,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        <GlassContainer
          spacing={8}
          style={styles.glassContainer}
        >
          {nativeGlassAvailable ? (
            <GlassView
              colorScheme="light"
              glassEffectStyle="clear"
              isInteractive={false}
              pointerEvents="none"
              style={styles.dockGlass}
              // tintColor="rgba(255, 255, 255, 0.05)"
              tintColor="rgba(255, 237, 213, 0.05)"
            />
          ) : (
            <BlurView
              intensity={72}
              pointerEvents="none"
              style={[styles.dockGlass, styles.fallbackDockGlass]}
              tint="light"
            />
          )}

          {dockWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicatorPosition,
                {
                  left: 0,
                  transform: [{ translateX: indicatorTranslateX }],
                },
              ]}
            >
              {nativeGlassAvailable ? (
                <GlassView
                  colorScheme="light"
                  
                    glassEffectStyle="regular"
                  isInteractive={false}
                  style={styles.activeIndicator}
                  tintColor="rgba(255, 237, 213, 0.95)"
                />
              ) : (
                <BlurView
                  intensity={85}
                  style={[
                    styles.activeIndicator,
                    styles.fallbackActiveIndicator,
                  ]}
                  tint="light"
                />
              )}
            </Animated.View>
          ) : null}

          <View
            onLayout={(event) => setDockWidth(event.nativeEvent.layout.width)}
            style={styles.tabsRow}
          >
            {TABS.map((tab) => {
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
                  onPress={() => {
                    if (tab.href) {
                      router.push(tab.href as never);
                      return;
                    }

                    navigation.navigate(tab.name);
                  }}
                />
              );
            })}
          </View>
        </GlassContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    alignItems: "center",
    backgroundColor: "transparent",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  glassContainer: {
    borderRadius: 34,
    height: 66,
    marginHorizontal: 14,
    maxWidth: 520,
    position: "relative",
    shadowColor: "#292524",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    width: "92%",
  },
  dockGlass: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "rgba(255, 255, 255, 0.76)",
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  fallbackDockGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.64)",
  },
  indicatorPosition: {
    height: ACTIVE_INDICATOR_HEIGHT,
    position: "absolute",
    top: 9,
    width: ACTIVE_INDICATOR_WIDTH,
    zIndex: 1,
  },
  activeIndicator: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius:24,
    borderWidth: StyleSheet.hairlineWidth,
    height: ACTIVE_INDICATOR_HEIGHT,
    overflow: "hidden",
    padding:15,
    width: ACTIVE_INDICATOR_WIDTH,
  },
  fallbackActiveIndicator: {
    backgroundColor: "rgba(255, 237, 213, 0.72)",
    borderColor: "rgba(249, 115, 22, 0.28)",
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
    zIndex: 2,
  },
  tabItemActive: {
    transform: [{ translateY: -1 }],
  },
  tabsRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 66,
    width: "100%",
    zIndex: 2,
  },
  wrapper: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
});
