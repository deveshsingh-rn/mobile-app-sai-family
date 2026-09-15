import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import {
  CalendarDays,
  House,
  Users,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FamilySilhouetteIcon from "../assets/icons/family-silhouette-svgrepo-com.svg";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";

const COLORS = {
  active: EXPERIENCE_THEME.heading,
  inactive: EXPERIENCE_THEME.paragraph,
};

const ACTIVE_INDICATOR_HEIGHT = 48;
const ACTIVE_INDICATOR_WIDTH = 58;

type TabIcon = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type PillarTab = {
  displayLabel: string;
  href: string;
  Icon: TabIcon;
  label: string;
  name: string;
};

function MalaIcon({ color, size }: React.ComponentProps<TabIcon>) {
  return (
    <FontAwesome5
      color={color}
      name="praying-hands"
      size={size}
    />
  );
}

function FamilyIcon({ color, size = 30 }: React.ComponentProps<TabIcon>) {
  return (
    <FamilySilhouetteIcon
      color={color}
      fill={color}
      height={size}
      width={size}
    />
  );
}

const TABS: PillarTab[] = [
  {
    displayLabel: "Home",
    href: "/(tabs)/experiences",
    Icon: House,
    label: "Devotee Experience",
    name: "experiences",
  },
  {
    displayLabel: "Events",
    href: "/(tabs)/events",
    Icon: CalendarDays,
    label: "Devotee Events",
    name: "events",
  },
  {
    displayLabel: "Sai Family",
    href: "/(tabs)/directory",
    Icon: FamilyIcon,
    label: "Sai Connect",
    name: "directory",
  },
  // {
  //   displayLabel: "Sanghat",
  //   href: "/(tabs)/sangha",
  //   Icon: Users,
  //   label: "Local community",
  //   name: "sangha",
  // },
  {
    displayLabel: "Naam Jap",
    href: "/naam-jap",
    Icon: MalaIcon,
    label: "Naam Jap",
    name: "naam-jap",
  },
];

function canUseNativeGlass() {
  try {
    return isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

function TabItem({
  displayLabel,
  focused,
  Icon,
  label,
  onPress,
}: {
  displayLabel: string;
  focused: boolean;
  Icon: TabIcon;
  label: string;
  onPress: () => void;
}) {
  const animation = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      damping: 18,
      mass: 0.8,
      stiffness: 180,
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [animation, focused]);

  const scale = animation.interpolate({
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
      <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
        <Icon
          color={focused ? COLORS.active : COLORS.active}
          size={focused ? 30 : 28}
          strokeWidth={focused ? 2.7 : 2}
        />
      </Animated.View>
      <Text
        allowFontScaling={false}
        numberOfLines={2}
        style={[styles.tabLabel, focused && styles.tabLabelActive]}
      >
        {displayLabel}
      </Text>
    </Pressable>
  );
}

type PillarGlassDockProps = {
  activeRouteName: string;
  onNavigate?: (routeName: string) => void;
  style?: ViewStyle;
};

export function PillarGlassDock({
  activeRouteName,
  onNavigate,
  style,
}: PillarGlassDockProps) {
  const nativeGlassAvailable = canUseNativeGlass();
  const [dockWidth, setDockWidth] = useState(0);
  const activeTabIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.name === activeRouteName)
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

    return Math.min(Math.max(centeredPosition, 4), maximumPosition);
  });
  const indicatorTranslateX = activeTabProgress.interpolate({
    inputRange: TABS.map((_, index) => index),
    outputRange: indicatorPositions,
  });

  const handleNavigate = (tab: PillarTab) => {
    if (onNavigate && tab.name !== "naam-jap") {
      onNavigate(tab.name);
      return;
    }

    router.push(tab.href as never);
  };

  return (
    <GlassContainer spacing={8} style={[styles.glassContainer, style]}>
      {nativeGlassAvailable ? (
        <GlassView
          colorScheme="light"
          glassEffectStyle="regular"
          isInteractive={false}
          pointerEvents="none"
          style={styles.dockGlass}
          tintColor="rgba(255, 248, 236, 0.82)"
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
            { transform: [{ translateX: indicatorTranslateX }] },
          ]}
        >
          {nativeGlassAvailable ? (
            <GlassView
              colorScheme="light"
              glassEffectStyle="clear"
              isInteractive={false}
              style={styles.activeIndicator}
              tintColor="rgba(241, 217, 181, 0.62)"
            />
          ) : (
            <BlurView
              intensity={85}
              style={[styles.activeIndicator, styles.fallbackActiveIndicator]}
              tint="light"
            />
          )}
        </Animated.View>
      ) : null}

      <View
        onLayout={(event) => setDockWidth(event.nativeEvent.layout.width)}
        style={styles.tabsRow}
      >
        {TABS.map((tab) => (
          <TabItem
            displayLabel={tab.displayLabel}
            focused={tab.name === activeRouteName}
            Icon={tab.Icon}
            key={tab.name}
            label={tab.label}
            onPress={() => handleNavigate(tab)}
          />
        ))}
      </View>
    </GlassContainer>
  );
}

export default function CustomTabBar({ navigation, state }: any) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index];
  const nestedState = activeRoute?.state;
  const nestedRoute = nestedState?.routes?.[nestedState.index ?? 0];
  const nestedRouteName = nestedRoute?.name;
  const experienceOwnsDock =
    activeRoute?.name === "experiences" &&
    (!nestedRouteName ||
      nestedRouteName === "index" ||
      nestedRouteName === "[id]" ||
      nestedRouteName === "ask-sai");

  // Experiences owns its dock so it can move from inline to floating on scroll.
  if (experienceOwnsDock) {
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
        <PillarGlassDock
          activeRouteName={activeRoute?.name ?? "experiences"}
          onNavigate={(routeName) => navigation.navigate(routeName)}
        />
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
    maxWidth: 520,
    position: "relative",
    shadowColor: EXPERIENCE_THEME.heading,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    width: "92%",
  },
  dockGlass: {
    ...StyleSheet.absoluteFillObject,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  fallbackDockGlass: {
    backgroundColor: "rgba(255, 248, 236, 0.82)",
  },
  indicatorPosition: {
    height: ACTIVE_INDICATOR_HEIGHT,
    left: 0,
    position: "absolute",
    top: 9,
    width: ACTIVE_INDICATOR_WIDTH,
    zIndex: 1,
  },
  activeIndicator: {
    alignItems: "center",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    height: ACTIVE_INDICATOR_HEIGHT,
    overflow: "hidden",
    width: ACTIVE_INDICATOR_WIDTH,
  },
  fallbackActiveIndicator: {
    backgroundColor: "rgba(241, 217, 181, 0.62)",
    borderColor: EXPERIENCE_THEME.border,
  },
  iconWrap: {
    alignItems: "center",
    height: 29,
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
  tabLabel: {
    color: COLORS.inactive,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 11,
    marginTop: 1,
    textAlign: "center",
  },
  tabLabelActive: {
    color: COLORS.active,
    fontWeight: "800",
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
