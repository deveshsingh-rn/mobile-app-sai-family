import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';

import {
  CalendarDays,
  House,
  Plus,
  UserCircle2,
  Users,
} from 'lucide-react-native';

const COLORS = {
  bg: '#ec3535',

  navGlass: 'rgba(255, 255, 255, 0.99)',
  navBorder: 'rgba(255,255,255,0.7)',

  pill: 'rgba(160, 160, 160, 0)',

  active: '#5A380A',
  inactive: '#322714',

  glow: 'rgba(230,162,60,0.18)',
};

const TABS = [
  {
    name: 'index',
    label: 'Home',
    Icon: House,
  },
  {
    name: 'sangha',
    label: 'Sangha',
    Icon: Users,
  },
  {
    name: 'events',
    label: 'Events',
    Icon: CalendarDays,
  },
  {
    name: 'profile',
    label: 'Profile',
    Icon: UserCircle2,
  },
];

const NAV_HEIGHT = 78;
const BUTTON_SIZE = 76;
const BOTTOM = Platform.OS === 'ios' ? 28 : 18;

function TabItem({
  focused,
  label,
  Icon,
  onPress,
}: any) {
  const anim = useRef(
    new Animated.Value(focused ? 1 : 0),
  ).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      tension: 180,
      friction: 16,
    }).start();
  }, [focused]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.tabItem}
      onPress={onPress}>

      {focused && (
        <Animated.View
          style={[
            // styles.activePill,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}>
          <BlurView
            intensity={94}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      <Animated.View
        style={{
          transform: [{ scale }],
        }}>
        <Icon
          size={22}
          strokeWidth={focused ? 2.5 : 2}
          color={
            focused
              ? COLORS.active
              : COLORS.inactive
          }
        />
      </Animated.View>

      <Text
        style={[
          styles.label,
          {
            color: focused
              ? COLORS.active
              : COLORS.inactive,
          },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CreateButton() {
  const scale = useRef(
    new Animated.Value(1),
  ).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.createWrapper}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>

      <Animated.View
        style={[
          styles.createButton,
          {
            transform: [{ scale }],
          },
        ]}>

        <View style={styles.glowRing} />

        <BlurView
          intensity={96}
          tint="light"
          style={styles.blurButton}>

          <Plus
            size={30}
            color={COLORS.active}
            strokeWidth={2.2}
          />
        </BlurView>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({
  state,
  navigation,
}: any) {
  return (
    <View style={styles.wrapper}>

      <View style={styles.navWrapper}>

        <View style={styles.navGlow} />

        <BlurView
          intensity={5}
          tint="light"
          style={styles.navBar}>

          <View style={styles.topShine} />

          <View style={styles.tabsRow}>
            {TABS.map((tab) => {
              const index =
                state.routes.findIndex(
                  (r: any) =>
                    r.name === tab.name,
                );

              const focused =
                state.index === index;

              return (
                <TabItem
                  key={tab.name}
                  focused={focused}
                  label={tab.label}
                  Icon={tab.Icon}
                  onPress={() =>
                    navigation.navigate(
                      tab.name,
                    )
                  }
                />
              );
            })}
          </View>
        </BlurView>
      </View>

      <CreateButton />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },

  navWrapper: {
    position: 'absolute',
    left: 16,
    right: 110,
    bottom: BOTTOM,
    height: NAV_HEIGHT,
  },

  navGlow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: -6,
    borderRadius: 40,
    backgroundColor: COLORS.glow,

    shadowColor: '#3359d8',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },

  navBar: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',

    backgroundColor: COLORS.navGlass,

    borderWidth: 1,
    borderColor: COLORS.navBorder,

    shadowColor: '#57c822',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  topShine: {
    position: 'absolute',
    top: 0,
    left: 30,
    right: 30,
    height: 1.2,

    backgroundColor:
      'rgba(255,255,255,0.9)',
  },

  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  activePill: {
  position: 'absolute',

  width: 52,
  height: 52,

  borderRadius: 26,

  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: COLORS.pill,

  borderWidth: 2,
  borderColor: 'rgba(255,255,255,0.6)',
},

  label: {
    fontSize: 10,
    fontWeight: '700',
  },

  createWrapper: {
    position: 'absolute',
    right: 18,
    bottom: BOTTOM,
  },

  createButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  glowRing: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,

    borderWidth: 1.5,
    borderColor:
      'rgba(230,162,60,0.3)',

    shadowColor: '#D89A33',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
  },

  blurButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,

    justifyContent: 'center',
    alignItems: 'center',

    overflow: 'hidden',

    backgroundColor:
      'rgba(255,249,235,0.5)',

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.7)',
  },
});