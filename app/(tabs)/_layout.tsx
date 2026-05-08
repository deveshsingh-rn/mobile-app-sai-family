// app/(tabs)/_layout.tsx
//
// PURE LIQUID GLASS TAB BAR
// — Fully custom tab bar (no native renderer = no rogue arrows/artifacts)
// — True frosted glass: blur + specular highlight + inner glow + edge refraction
// — Spring-animated active pill with saffron warmth
// — Labels for clarity and accessibility
// — Floating create button with press animation

import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import {
  House,
  Users,
  CalendarDays,
  UserCircle2,
  Plus,
} from 'lucide-react-native';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:           '#FFF8ED',

  navGlass:     'rgba(255,251,240,0.58)',
  navBorder:    'rgba(255,255,255,0.62)',
  navShadow:    '#B8812A',

  pillGlass:    'rgba(255, 244, 215, 0.7)',
  pillBorder:   'rgba(255,255,255,0.75)',
  pillShadow:   '#E6A23C',

  createGlass:  'rgba(255,249,232,0.70)',
  createBorder: 'rgba(255,255,255,0.65)',
  createShadow: '#D4921C',

  shine:        'rgba(255,255,255,0.95)',
  shineEdge:    'rgba(210,168,72,0.18)',
  innerWash:    'rgba(255,247,220,0.30)',
  glow:         'rgba(230,162,60,0.20)',

  active:       '#5A380A',
  inactive:     '#C2A06A',
  labelActive:  '#7A5020',
};

// ─── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { name: 'index',   label: 'Home',    Icon: House        },
  { name: 'sangha',  label: 'Sangha',  Icon: Users        },
  { name: 'events',  label: 'Events',  Icon: CalendarDays },
  { name: 'profile', label: 'Profile', Icon: UserCircle2  },
] as const;

// ─── Single animated tab item ──────────────────────────────────────────────────
function TabItem({
  label,
  Icon,
  focused,
  onPress,
}: {
  label: string;
  Icon: React.ElementType;
  focused: boolean;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      tension: 260,
      friction: 18,
    }).start();
  }, [focused]);

  const pillOpacity = anim;
  const pillScale   = anim.interpolate({ inputRange: [0, 1], outputRange: [0.80, 1] });
  const pillY       = anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  const iconScale   = anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.10] });
  const labelOp     = anim.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 0, 1] });
  const labelY      = anim.interpolate({ inputRange: [0, 1], outputRange: [4, 0] });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}>

      {/* Active glass pill */}
      <Animated.View
        style={[
          styles.pillWrap,
          { opacity: pillOpacity, transform: [{ scale: pillScale }, { translateY: pillY }] },
        ]}>
        <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.pillInnerWash} />
        <View style={styles.pillShineTop} />
        <View style={styles.pillShineBot} />
        <View style={styles.pillBorderRing} />
      </Animated.View>

      {/* Icon */}
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <Icon
          size={22}
          strokeWidth={focused ? 2.7 : 2.0}
          color={focused ? T.active : T.inactive}
        />
      </Animated.View>

      {/* Label — slides up and fades in when active */}
      <Animated.Text
        style={[
          styles.tabLabel,
          { opacity: labelOp, transform: [{ translateY: labelY }] },
        ]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// ─── Floating create button ────────────────────────────────────────────────────
function CreateButton({ onPress }: { onPress: () => void }) {
  const scale  = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale,  { toValue: 0.87, useNativeDriver: true, tension: 400, friction: 8 }),
        Animated.timing(rotate, { toValue: 1, duration: 180, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(scale,  { toValue: 1,    useNativeDriver: true, tension: 200, friction: 7 }),
        Animated.timing(rotate, { toValue: 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();
    onPress();
  };

  const rot = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      style={styles.createWrapper}
      accessibilityRole="button"
      accessibilityLabel="Create">
      <Animated.View style={[styles.createShell, { transform: [{ scale }, { rotate: rot }] }]}>
        <View style={styles.createGlowRing} />
        <BlurView intensity={75} tint="light" style={styles.createBlur}>
          <View style={styles.createInnerWash} />
          <View style={styles.createShineTop} />
          <View style={styles.createShineBot} />
          <Plus size={28} strokeWidth={2.2} color={T.active} />
        </BlurView>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Custom tab bar — completely replaces the native renderer ──────────────────
// This is the KEY fix: passing `tabBar` to <Tabs> means Expo Router never
// renders the native tab bar at all, so no rogue dropdown arrow or system chrome.
function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  return (
    <View style={styles.barRoot} pointerEvents="box-none">

      {/* NAV PILL */}
      <View style={styles.navWrapper}>
        <View style={styles.navGlowBlob} />
        <BlurView intensity={72} tint="light" style={styles.navBlur}>
          <View style={styles.navInnerWash} />
          <View style={styles.navShineTop} />
          <View style={styles.navShineBot} />

          <View style={styles.tabsRow}>
            {TABS.map((tab) => {
              const routeIndex = state.routes.findIndex((r: any) => r.name === tab.name);
              const focused    = state.index === routeIndex;
              return (
                <TabItem
                  key={tab.name}
                  label={tab.label}
                  Icon={tab.Icon}
                  focused={focused}
                  onPress={() => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: state.routes[routeIndex]?.key,
                      canPreventDefault: true,
                    });
                    if (!event.defaultPrevented) {
                      navigation.navigate(tab.name);
                    }
                  }}
                />
              );
            })}
          </View>
        </BlurView>
      </View>

      {/* FLOATING CREATE */}
      <CreateButton onPress={() => { /* wire up your create flow here */ }} />
    </View>
  );
}

// ─── Root layout ───────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: T.bg },
        }}>
        <Tabs.Screen name="explore"  options={{ href: null }} />
        <Tabs.Screen name="index"    options={{ title: 'Home'    }} />
        <Tabs.Screen name="sangha"   options={{ title: 'Sangha'  }} />
        <Tabs.Screen name="events"   options={{ title: 'Events'  }} />
        <Tabs.Screen name="profile"  options={{ title: 'Profile' }} />
      </Tabs>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const NAV_H  = 74;
const BTN    = 76;
const BOTTOM = Platform.OS === 'ios' ? 30 : 20;
const BTN_R  = 18;
const NAV_L  = 16;
const NAV_R  = BTN_R + BTN + 12;
const RADIUS = 46;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  },

  barRoot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM + NAV_H + 24,
    pointerEvents: 'box-none',
  },

  // ── Nav pill ─────────────────────────────────────────
  navWrapper: {
    position: 'absolute',
    left: NAV_L,
    right: NAV_R,
    bottom: BOTTOM,
    height: NAV_H,
  },

  navGlowBlob: {
    position: 'absolute',
    top: 12,
    left: 20,
    right: 20,
    bottom: -10,
    borderRadius: RADIUS,
    backgroundColor: T.glow,
    shadowColor: T.pillShadow,
    shadowOpacity: 0.40,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
  },

  navBlur: {
    flex: 1,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: T.navGlass,
    borderWidth: 1,
    borderColor: T.navBorder,
    shadowColor: T.navShadow,
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },

  navInnerWash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
    backgroundColor: T.innerWash,
  },

  navShineTop: {
    position: 'absolute',
    top: 0,
    left: 32,
    right: 32,
    height: 1.5,
    borderRadius: 2,
    backgroundColor: T.shine,
  },

  navShineBot: {
    position: 'absolute',
    bottom: 0,
    left: 44,
    right: 44,
    height: 1,
    borderRadius: 2,
    backgroundColor: T.shineEdge,
  },

  // ── Tabs row ──────────────────────────────────────────
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },

  tabItem: {
    flex: 1,
    height: NAV_H,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  // ── Active pill ───────────────────────────────────────
  pillWrap: {
    position: 'absolute',
    width: 68,
    height: 58,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: T.pillShadow,
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },

  pillInnerWash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    backgroundColor: T.pillGlass,
  },

  pillShineTop: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1.4,
    borderRadius: 2,
    backgroundColor: T.shine,
  },

  pillShineBot: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 1,
    borderRadius: 2,
    backgroundColor: T.shineEdge,
  },

  pillBorderRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1.2,
    borderColor: T.pillBorder,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: T.labelActive,
    fontFamily: Platform.select({
      ios:     'SF Pro Rounded',
      android: 'sans-serif-medium',
    }),
  },

  // ── Create button ─────────────────────────────────────
  createWrapper: {
    position: 'absolute',
    right: BTN_R,
    bottom: BOTTOM,
    width: BTN,
    height: BTN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  createShell: {
    width: BTN,
    height: BTN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  createGlowRing: {
    position: 'absolute',
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(230,162,60,0.30)',
    shadowColor: T.pillShadow,
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    transform: [{ scale: 1.15 }],
  },

  createBlur: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: T.createGlass,
    borderWidth: 1.2,
    borderColor: T.createBorder,
    shadowColor: T.createShadow,
    shadowOpacity: 0.20,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },

  createInnerWash: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 28,
    backgroundColor: T.innerWash,
  },

  createShineTop: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1.5,
    borderRadius: 3,
    backgroundColor: T.shine,
  },

  createShineBot: {
    position: 'absolute',
    bottom: 0,
    left: 22,
    right: 22,
    height: 1,
    borderRadius: 2,
    backgroundColor: T.shineEdge,
  },
});