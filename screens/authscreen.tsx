

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Platform,
  UIManager,
  StatusBar,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, {
  Circle,
  Path,
  Line,
  G,
  Defs,
  Use,
  Ellipse,
} from 'react-native-svg';
import {
  useFonts,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_500Medium_Italic,
} from '@expo-google-fonts/cormorant-garamond';

/* Enable LayoutAnimation on Android */
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


type AuthScreenProps = {
  onContinue: () => void;
  onCreateAccount: () => void;
};

/* ═══════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════ */
const C = {
  bg: '#FBF1DE',
  bgSurface: '#FFFAF0',
  ink: '#5C1A1B',
  inkSoft: '#7A4520',
  saffron: '#D2691E',
  saffronDim: '#8B4513',
  gold: '#B8860B',
  border: '#E8D4B0',
  borderSoft: '#F0DDB8',
  meta: '#A07845',
  bodyText: '#3D2410',
  subBody: '#5C3318',
};

/* ═══════════════════════════════════════════════════════════
   PILLAR DATA
   ═══════════════════════════════════════════════════════════ */
type PillarId = 'leela' | 'events' | 'directory' | 'sangha';

interface Pillar {
  id: PillarId;
  title: string;
  subtitle: string;
  color: string;
  colorLight: string;
  description: string;
  features: string[];
  iconKey: 'diya' | 'lotus' | 'shop' | 'hands';
}

const PILLARS: Pillar[] = [
  {
    id: 'leela',
    iconKey: 'diya',
    title: 'Leela Feed',
    subtitle: 'Divine Experiences',
    color: '#C2410C',
    colorLight: '#FCE8D4',
    description:
      "Share and discover miraculous experiences, divine leelas, and spiritual journeys of devotees from around the world. Every story is a testament to Baba's eternal grace.",
    features: [
      'Share your personal leelas with the community',
      'Browse heartfelt stories from devotees worldwide',
      "Offer blessings to others' sacred journeys",
    ],
  },
  {
    id: 'events',
    iconKey: 'lotus',
    title: 'Sacred Events',
    subtitle: 'Satsangs & Gatherings',
    color: '#B45309',
    colorLight: '#FCEBC8',
    description:
      'Stay connected to upcoming satsangs, bhajans, pujas, and spiritual retreats near you and around the world. Never miss a divine gathering.',
    features: [
      'Discover satsangs, bhajans & pujas near you',
      'One-tap RSVP with gentle reminders',
      'Join virtual events from anywhere',
    ],
  },
  {
    id: 'directory',
    iconKey: 'shop',
    title: 'Seva Directory',
    subtitle: 'Devotee Businesses',
    color: '#9A3412',
    colorLight: '#FAE3CF',
    description:
      'Discover and support businesses owned by fellow devotees. From spiritual services to everyday needs — shop with intention and strengthen the sangha.',
    features: [
      'Find verified devotee-run businesses',
      'Leave reviews & blessings',
      'Strengthen the community economy',
    ],
  },
  {
    id: 'sangha',
    iconKey: 'hands',
    title: 'Sangha',
    subtitle: 'Sacred Community',
    color: '#7C2D12',
    colorLight: '#F5DCC6',
    description:
      "Connect, grow, and serve together as one family under Baba's guidance. Build meaningful bonds, join seva groups, and walk the path of devotion together.",
    features: [
      'Join seva groups & community circles',
      'Chat & connect with fellow devotees',
      'Forums to share wisdom & seek guidance',
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   ICONS — custom SVG, no emojis
   ═══════════════════════════════════════════════════════════ */
interface IconProps {
  color: string;
  size?: number;
}

const DiyaIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M4 15 Q12 22 20 15 Q18 17 12 17 Q6 17 4 15 Z"
      fill={color}
    />
    <Ellipse cx="12" cy="15" rx="8" ry="1.5" fill={color} opacity={0.7} />
    <Path
      d="M12 14 Q11 11 12 8 Q13 11 12 14"
      fill="#FFB627"
      stroke={color}
      strokeWidth={0.5}
    />
    <Path d="M12 11 Q11.5 9 12 7.5 Q12.5 9 12 11" fill="#FFF" opacity={0.6} />
  </Svg>
);

const LotusIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 19 Q6 16 5 11 Q9 13 12 12 Q15 13 19 11 Q18 16 12 19 Z"
      fill={color}
      opacity={0.4}
    />
    <Path
      d="M12 18 Q8 14 8 9 Q10 11 12 10 Q14 11 16 9 Q16 14 12 18 Z"
      fill={color}
      opacity={0.7}
    />
    <Path d="M12 17 Q10 13 11 7 Q12 11 13 7 Q14 13 12 17 Z" fill={color} />
    <Circle cx="12" cy="19" r="1" fill={color} />
  </Svg>
);

const ShopIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 9 L5 6 L19 6 L19 9"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <Path
      d="M5 6 L7 3 L17 3 L19 6"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 9 L6 20 L18 20 L18 9"
      stroke={color}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
    <Path
      d="M10 13 Q10 11 12 11 Q14 11 14 13 L14 16 L10 16 Z"
      stroke={color}
      strokeWidth={1.2}
    />
    <Circle cx="12" cy="9" r={0.8} fill={color} />
  </Svg>
);

const HandsIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="8" r={2.5} stroke={color} strokeWidth={1.3} />
    <Circle cx="16" cy="8" r={2.5} stroke={color} strokeWidth={1.3} />
    <Circle cx="12" cy="14" r={2.5} stroke={color} strokeWidth={1.3} />
    <Path
      d="M8 11 Q10 13 12 12"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
    <Path
      d="M16 11 Q14 13 12 12"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
    <Path
      d="M9 9 Q12 7 15 9"
      stroke={color}
      strokeWidth={1}
      strokeLinecap="round"
      opacity={0.5}
    />
  </Svg>
);

const renderIcon = (key: Pillar['iconKey'], color: string) => {
  switch (key) {
    case 'diya':
      return <DiyaIcon color={color} />;
    case 'lotus':
      return <LotusIcon color={color} />;
    case 'shop':
      return <ShopIcon color={color} />;
    case 'hands':
      return <HandsIcon color={color} />;
  }
};

/* ═══════════════════════════════════════════════════════════
   DECORATIVE BACKDROP — mandala behind Om
   ═══════════════════════════════════════════════════════════ */
const MandalaBackdrop = () => (
  <Svg
    width={240}
    height={240}
    viewBox="0 0 220 220"
    style={styles.mandala}
    pointerEvents="none"
  >
    <Circle
      cx={110}
      cy={110}
      r={105}
      fill="none"
      stroke={C.border}
      strokeWidth={0.5}
      strokeDasharray="2 3"
    />
    <Circle
      cx={110}
      cy={110}
      r={85}
      fill="none"
      stroke={C.saffron}
      strokeWidth={0.4}
      opacity={0.5}
    />
    <Circle
      cx={110}
      cy={110}
      r={65}
      fill="none"
      stroke={C.saffron}
      strokeWidth={0.6}
      opacity={0.4}
    />
    <Defs>
      <Path
        id="petal"
        d="M0,-90 Q-10,-60 0,-50 Q10,-60 0,-90"
        fill="#E8C68C"
      />
    </Defs>
    <G transform="translate(110,110)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <Use
          key={deg}
          href="#petal"
          transform={`rotate(${deg})`}
          opacity={0.4}
        />
      ))}
    </G>
  </Svg>
);

/* Ornamental "SAI RAM" wing flourish */
const SideFlourish = ({ flipped = false }: { flipped?: boolean }) => (
  <Svg
    width={32}
    height={6}
    viewBox="0 0 32 6"
    style={flipped && { transform: [{ scaleX: -1 }] }}
  >
    <Line x1="0" y1="3" x2="22" y2="3" stroke={C.saffron} strokeWidth={0.8} />
    <Circle
      cx={26}
      cy={3}
      r={2}
      fill="none"
      stroke={C.saffron}
      strokeWidth={0.8}
    />
    <Circle cx={26} cy={3} r={0.8} fill={C.saffron} />
  </Svg>
);

/* Small four-pointed star ornament */
const StarOrnament = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 14 14">
    <Path
      d="M7 1 L8.5 5.5 L13 7 L8.5 8.5 L7 13 L5.5 8.5 L1 7 L5.5 5.5 Z"
      fill={C.saffron}
      opacity={0.7}
    />
  </Svg>
);

/* Tiny check inside the feature bullet */
const CheckMark = ({ color }: { color: string }) => (
  <Svg width={8} height={8} viewBox="0 0 8 8" fill="none">
    <Path
      d="M1.5 4 L3.2 5.7 L6.5 2.3"
      stroke={color}
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/* ═══════════════════════════════════════════════════════════
   PILLAR CARD
   ═══════════════════════════════════════════════════════════ */
interface CardProps {
  pillar: Pillar;
  isOpen: boolean;
  onToggle: () => void;
  fontsReady: boolean;
}

function PillarCard({ pillar, isOpen, onToggle, fontsReady }: CardProps) {
  const rotateAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 130,
      friction: 9,
    }).start();
  }, [isOpen]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handlePress = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.78 },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    onToggle();
  };

  const iconColor = isOpen ? pillar.color : C.saffronDim;
  const cardBg = isOpen ? `${pillar.colorLight}` : C.bgSurface;
  const borderColor = isOpen ? pillar.color : C.border;
  const titleFont =
    fontsReady ? 'CormorantGaramond_600SemiBold' : Platform.OS === 'ios' ? 'Georgia' : 'serif';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
        },
      ]}
    >
      {/* Active-state left edge ribbon */}
      {isOpen && (
        <View style={[styles.cardRibbon, { backgroundColor: pillar.color }]} />
      )}

      {/* Header row */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: isOpen ? pillar.colorLight : '#FBE8C8',
              borderColor: isOpen ? pillar.color : C.border,
            },
          ]}
        >
          {renderIcon(pillar.iconKey, iconColor)}
        </View>

        <View style={styles.titleBlock}>
          <Text
            style={[
              styles.cardTitle,
              { fontFamily: titleFont, color: isOpen ? pillar.color : C.ink },
            ]}
          >
            {pillar.title}
          </Text>
          <Text style={styles.cardSubtitle}>{pillar.subtitle}</Text>
        </View>

        <Animated.View
          style={[
            styles.chevWrap,
            {
              backgroundColor: isOpen ? pillar.colorLight : '#F5E4C0',
              transform: [{ rotate }],
            },
          ]}
        >
          <Svg width={10} height={6} viewBox="0 0 10 6">
            <Path
              d="M1 1 L5 5 L9 1"
              stroke={isOpen ? pillar.color : C.saffronDim}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </View>

      {/* Expanded body */}
      {isOpen && (
        <View style={styles.cardBody}>
          {/* dot divider */}
          <View style={styles.dotDivider}>
            <View
              style={[styles.dotDivLine, { backgroundColor: pillar.color }]}
            />
            <View style={[styles.dotDivDot, { backgroundColor: pillar.color }]} />
            <View
              style={[styles.dotDivLine, { backgroundColor: pillar.color }]}
            />
          </View>

          <Text style={styles.description}>{pillar.description}</Text>

          {pillar.features.map((feat, idx) => (
            <View key={idx} style={styles.featureRow}>
              <View
                style={[
                  styles.featureMark,
                  {
                    backgroundColor: pillar.colorLight,
                    borderColor: pillar.color,
                  },
                ]}
              >
                <CheckMark color={pillar.color} />
              </View>
              <Text style={styles.featureText}>{feat}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════════════════════ */
export default function AuthScreen({ onContinue, onCreateAccount }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const [openId, setOpenId] = useState<PillarId | null>('leela');

  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_500Medium_Italic,
  });

  const togglePillar = useCallback((id: PillarId) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const omShimmer = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(omShimmer, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: true,
        }),
        Animated.timing(omShimmer, {
          toValue: 0.88,
          duration: 1700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const fontDisplay =
    fontsLoaded ? 'CormorantGaramond_600SemiBold' : Platform.OS === 'ios' ? 'Georgia' : 'serif';
  const fontItalic =
    fontsLoaded ? 'CormorantGaramond_500Medium_Italic' : Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif';
  const fontMedium =
    fontsLoaded ? 'CormorantGaramond_500Medium' : Platform.OS === 'ios' ? 'Georgia' : 'serif';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Scroll content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 150,
          },
        ]}
        bounces
      >
        {/* ───── HERO ───── */}
        <View style={styles.hero}>
          <MandalaBackdrop />

          <Animated.View style={[styles.omCircle, { opacity: omShimmer }]}>
            <View style={styles.omInnerRing} />
            <Text style={[styles.omGlyph, { fontFamily: fontDisplay }]}>ॐ</Text>
          </Animated.View>

          <Text style={[styles.brandName, { fontFamily: fontDisplay }]}>
            Sai Family
          </Text>

          <View style={styles.sanskritRow}>
            <SideFlourish />
            <Text style={styles.sanskritLabel}>SAI RAM</Text>
            <SideFlourish flipped />
          </View>

          <Text style={[styles.tagline, { fontFamily: fontItalic }]}>
            A sacred space for devotion,{'\n'}community &amp; divine connection
          </Text>
        </View>

        {/* ───── SECTION HEADING ───── */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLine} />
          <StarOrnament />
          <Text style={[styles.sectionLabel, { fontFamily: fontMedium }]}>
            THE FOUR PILLARS
          </Text>
          <StarOrnament />
          <View style={styles.sectionLine} />
        </View>

        {/* ───── CARDS ───── */}
        <View style={styles.cardsWrap}>
          {PILLARS.map((p) => (
            <PillarCard
              key={p.id}
              pillar={p}
              isOpen={openId === p.id}
              onToggle={() => togglePillar(p.id)}
              fontsReady={fontsLoaded}
            />
          ))}
        </View>
      </ScrollView>

      {/* ───── STICKY BOTTOM ACTION BAR ───── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 14 },
        ]}
      >
        {/* Ornamental divider */}
        <View style={styles.bottomOrnament}>
          <View style={styles.ornLineShort} />
          <View style={styles.ornDot} />
          <View style={styles.ornLineLong} />
          <View style={styles.ornDot} />
          <View style={styles.ornLineShort} />
        </View>

        <View style={styles.buttonRow}>
         
          <Pressable style={styles.btnPrimary} onPress={onContinue}>
            <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
              <Circle
                cx={7}
                cy={7}
                r={6}
                stroke={C.bg}
                strokeWidth={1.2}
              />
              <Path
                d="M5 7 L7 9 L10 5"
                stroke={C.bg}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.btnPrimaryText}>Login</Text>
            </Pressable>
       
          <Pressable style={styles.btnSecondary} onPress={onCreateAccount}><Text style={styles.btnSecondaryText}>Create Account</Text></Pressable>
          
        </View>

        <Text style={[styles.jaiSai, { fontFamily: fontMedium }]}>
          JAI SAI RAM
        </Text>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 18,
  },

    primaryButton: {
    alignItems: "center",
    backgroundColor: "#8e5d10",
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#d9bd7a",
    borderRadius: 8,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  /* ── Hero ── */
  hero: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 22,
    position: 'relative',
  },
  mandala: {
    position: 'absolute',
    top: -10,
    opacity: 0.55,
  },
  omCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: C.bgSurface,
    borderWidth: 1.5,
    borderColor: C.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  omInnerRing: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: 46,
    borderWidth: 0.5,
    borderColor: C.saffron,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  omGlyph: {
    fontSize: 46,
    color: C.ink,
    lineHeight: 52,
  },
  brandName: {
    color: C.ink,
    fontSize: 34,
    fontWeight: '600',
    marginTop: 14,
    letterSpacing: 0.3,
  },
  sanskritRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  sanskritLabel: {
    color: C.saffron,
    fontSize: 10.5,
    letterSpacing: 4,
    fontWeight: '500',
  },
  tagline: {
    color: C.inkSoft,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },

  /* ── Section heading ── */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 14,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.saffron,
    opacity: 0.25,
  },
  sectionLabel: {
    color: C.saffronDim,
    fontSize: 12,
    letterSpacing: 3.5,
    fontWeight: '500',
  },

  /* ── Cards ── */
  cardsWrap: {
    gap: 11,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  cardRibbon: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 13,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  titleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: C.meta,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  chevWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Card body ── */
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 2,
  },
  dotDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dotDivLine: {
    flex: 1,
    height: 1,
    opacity: 0.25,
  },
  dotDivDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    opacity: 0.5,
  },
  description: {
    color: C.bodyText,
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  featureMark: {
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2,
  },
  featureText: {
    color: C.subBody,
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },

  /* ── Bottom action bar ── */
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(210,105,30,0.12)',
  },
  bottomOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
    opacity: 0.6,
  },
  ornLineShort: { width: 16, height: 1, backgroundColor: C.saffron },
  ornLineLong: { width: 24, height: 1, backgroundColor: C.saffron },
  ornDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.saffron },

  buttonRow: {
    flexDirection: 'row',
    gap: 11,
  },
  btnPrimary: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimaryText: {
    color: C.bg,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  btnSecondary: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: C.ink,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  jaiSai: {
    textAlign: 'center',
    color: C.meta,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 11,
    fontWeight: '500',
  },
});
