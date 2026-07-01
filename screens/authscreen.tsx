import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Compass,
  HandHeart,
  Heart,
  HeartHandshake,
  MapPin,
  MessageCircle,
  MessageCircleHeart,
  MessageSquare,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  UserPlus,
  Users,
  Users2,
  Video,
  X,
} from "lucide-react-native";

import {
  authUserToDevoteeAccount,
  loginUserWithEmail,
  sendUserMobileOtp,
  verifyUserMobileOtp,
} from "@/services/auth";
import { saveDevoteeAccount } from "@/services/devotee-account";
import { loadSavedDevoteeAccountRequest } from "@/store/devotee-account/actions";
import { useAppDispatch } from "@/store/hooks";

/* Enable LayoutAnimation on Android */
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */
type AuthScreenProps = {
  onContinue: () => void;
  onCreateAccount: () => void;
};

type Country = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

type PillarId = "experiences" | "events" | "directory" | "sangha";

type PillarFeature = {
  Icon: React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
  label: string;
};

type Pillar = {
  id: PillarId;
  Icon: React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
  accent: string;
  bg: string;
  bgSoft: string;
  bgTint: string;
  label: string;
  tagline: string;
  description: string;
  features: PillarFeature[];
  quote: string;
};

/* ═══════════════════════════════════════════════════════════
   COUNTRIES (extend as needed)
   ═══════════════════════════════════════════════════════════ */
const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "MU", name: "Mauritius", dialCode: "+230", flag: "🇲🇺" },
  { code: "FJ", name: "Fiji", dialCode: "+679", flag: "🇫🇯" },
  { code: "TT", name: "Trinidad & Tobago", dialCode: "+1", flag: "🇹🇹" },
  { code: "GY", name: "Guyana", dialCode: "+592", flag: "🇬🇾" },
  { code: "SR", name: "Suriname", dialCode: "+597", flag: "🇸🇷" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
];

const DEFAULT_COUNTRY = COUNTRIES[0]; // India

/* ═══════════════════════════════════════════════════════════
   PILLARS — deep content
   ═══════════════════════════════════════════════════════════ */
const PILLARS: Pillar[] = [
  {
    id: "experiences",
    Icon: MessageCircleHeart,
    accent: "#C2410C",
    bg: "#FFF7ED",
    bgSoft: "#FFFBF5",
    bgTint: "#FCE8D4",
    label: "Leela Feed",
    tagline: "Where miracles find their voice",
    description:
      "The sacred feed where devotees share moments Baba's grace touched their lives — miracles received, dreams remembered, and darshan stories that inspire the whole family.",
    features: [
      { Icon: Heart, label: "Share your prayers, leelas & darshan stories" },
      { Icon: Sparkles, label: "Discover miracles from devotees worldwide" },
      { Icon: MessageCircle, label: "Offer blessings & comment on stories" },
      { Icon: Bookmark, label: "Save meaningful posts for reflection" },
    ],
    quote: "Every leela strengthens our shared faith",
  },
  {
    id: "events",
    Icon: CalendarDays,
    accent: "#0F766E",
    bg: "#ECFDF5",
    bgSoft: "#F5FEF9",
    bgTint: "#D1FADF",
    label: "Sacred Events",
    tagline: "Never miss a divine assembly",
    description:
      "Bhajans, satsangs, pujas, and spiritual retreats — organized in one calm calendar. Whether it's a Thursday aarti two blocks away or a global online satsang, you'll know.",
    features: [
      { Icon: MapPin, label: "Discover events near your city" },
      { Icon: Bell, label: "One-tap RSVP with gentle reminders" },
      { Icon: Video, label: "Join virtual satsangs from anywhere" },
      { Icon: Users, label: "See which devotees are attending" },
    ],
    quote: "Where devotees gather, Baba is present",
  },
  {
    id: "directory",
    Icon: Building2,
    accent: "#7C3AED",
    bg: "#F5F3FF",
    bgSoft: "#F9F7FF",
    bgTint: "#E9D5FF",
    label: "Seva Directory",
    tagline: "Support the sangha, be supported by it",
    description:
      "A trusted directory of devotee-run businesses and services — from prasad and puja supplies to everyday needs. Every purchase strengthens our shared community.",
    features: [
      { Icon: ShoppingBag, label: "Discover verified devotee businesses" },
      { Icon: Star, label: "Read blessings & authentic reviews" },
      { Icon: Shield, label: "Trust badges from the sangha" },
      { Icon: Compass, label: "Find services in your neighborhood" },
    ],
    quote: "When we support each other, the sangha rises",
  },
  {
    id: "sangha",
    Icon: Users,
    accent: "#BE185D",
    bg: "#FDF2F8",
    bgSoft: "#FEF7FA",
    bgTint: "#FBCFE8",
    label: "Sangha",
    tagline: "You are never alone on this path",
    description:
      "The heart of the app — a private, respectful community where devotees connect, form seva circles, and walk the path together. From newcomers to lifelong devotees, everyone finds their family here.",
    features: [
      { Icon: UserPlus, label: "Connect with fellow devotees" },
      { Icon: Users2, label: "Join or create seva circles" },
      { Icon: MessageSquare, label: "Private chats & group forums" },
      { Icon: HandHeart, label: "Give and receive blessings" },
    ],
    quote: "One family under Baba's grace",
  },
];

const trustItems = [
  "Mobile OTP protected",
  "Private devotee profile",
  "One-time verification",
];

/* ═══════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════ */
const C = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  ink: "#1C1917",
  inkSecondary: "#57534E",
  inkTertiary: "#A8A29E",
  separator: "#EFEAE0",
  saffron: "#C2410C",
  saffronText: "#9A3412",
  saffronBg: "#FFF7ED",
  saffronBorder: "#FED7AA",
  maroon: "#2B1308",
  green: "#15803D",
  greenBg: "#ECFDF5",
};

/* ═══════════════════════════════════════════════════════════
   COUNTRY PICKER MODAL
   ═══════════════════════════════════════════════════════════ */
type CountryPickerProps = {
  visible: boolean;
  selectedCode: string;
  onClose: () => void;
  onSelect: (country: Country) => void;
};

function CountryPickerModal({
  visible,
  selectedCode,
  onClose,
  onSelect,
}: CountryPickerProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropTouch} onPress={handleClose} />
        <View
          style={[
            styles.modalSheet,
            { paddingBottom: insets.bottom + 6 },
          ]}
        >
          {/* Grabber */}
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select country</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={10}
              style={styles.closeButton}
            >
              <X color={C.inkSecondary} size={14} strokeWidth={2.4} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <View style={styles.searchInput}>
              <Search color={C.inkSecondary} size={15} strokeWidth={2} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setQuery}
                placeholder="Search countries"
                placeholderTextColor={C.inkTertiary}
                style={styles.searchField}
                value={query}
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery("")} hitSlop={8}>
                  <X color={C.inkTertiary} size={14} strokeWidth={2.4} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Country list */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No countries match "{query}"</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.code === selectedCode;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    handleClose();
                  }}
                  style={({ pressed }) => [
                    styles.countryRow,
                    isSelected && styles.countryRowSelected,
                    pressed && styles.countryRowPressed,
                  ]}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryDial}>{item.dialCode}</Text>
                  </View>
                  {isSelected ? (
                    <View style={styles.checkBadge}>
                      <Check color="#FFFFFF" size={11} strokeWidth={2.5} />
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   PILLAR ACCORDION CARD
   ═══════════════════════════════════════════════════════════ */
function PillarAccordionCard({
  isOpen,
  onToggle,
  pillar,
}: {
  isOpen: boolean;
  onToggle: () => void;
  pillar: Pillar;
}) {
  const Icon = pillar.Icon;

  const handlePress = () => {
    LayoutAnimation.configureNext({
      duration: 280,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "spring", springDamping: 0.78 },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
    onToggle();
  };

  return (
    <Pressable
      activeOpacity={0.92}
      onPress={handlePress}
      style={[
        styles.pillarCard,
        {
          backgroundColor: isOpen ? pillar.bgSoft : C.surface,
          borderColor: isOpen ? pillar.accent : C.separator,
        },
      ]}
    >
      {isOpen ? (
        <View style={[styles.pillarRibbon, { backgroundColor: pillar.accent }]} />
      ) : null}

      {/* Header */}
      <View style={styles.pillarHeader}>
        <View
          style={[
            styles.pillarIconLarge,
            { backgroundColor: isOpen ? pillar.accent : pillar.bg },
          ]}
        >
          <Icon color={isOpen ? "#FFFFFF" : pillar.accent} size={20} strokeWidth={2} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.pillarLabel,
              { color: isOpen ? pillar.accent : C.ink },
            ]}
          >
            {pillar.label}
          </Text>
          <Text style={styles.pillarTagline}>{pillar.tagline}</Text>
        </View>

        <View
          style={[
            styles.pillarChevron,
            { backgroundColor: isOpen ? pillar.bgTint : "#F5E4C0" },
          ]}
        >
          <ChevronDown
            color={isOpen ? pillar.accent : "#8B4513"}
            size={14}
            strokeWidth={2.2}
            style={{
              transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
            }}
          />
        </View>
      </View>

      {/* Expanded body */}
      {isOpen ? (
        <View style={styles.pillarBody}>
          {/* Ornamental divider */}
          <View style={styles.dotDivider}>
            <View style={[styles.dotLine, { backgroundColor: pillar.accent }]} />
            <View style={[styles.dotDot, { backgroundColor: pillar.accent }]} />
            <View style={[styles.dotLine, { backgroundColor: pillar.accent }]} />
          </View>

          <Text style={styles.pillarDescription}>{pillar.description}</Text>

          <Text style={styles.featuresLabel}>WHAT YOU'LL DO</Text>

          {pillar.features.map((feature, idx) => {
            const FIcon = feature.Icon;
            return (
              <View key={idx} style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: pillar.bgTint },
                  ]}
                >
                  <FIcon color={pillar.accent} size={12} strokeWidth={1.8} />
                </View>
                <Text style={styles.featureText}>{feature.label}</Text>
              </View>
            );
          })}

          {/* Tagline chip */}
          <View
            style={[
              styles.quoteChip,
              {
                backgroundColor: pillar.bgTint,
                borderColor: pillar.accent + "30",
              },
            ]}
          >
            <Sparkles color={pillar.accent} size={10} strokeWidth={2.2} />
            <Text
              style={[styles.quoteChipText, { color: pillar.accent }]}
            >
              {pillar.quote}
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════════════════════ */
export default function AuthScreen({
  onContinue,
  onCreateAccount,
}: AuthScreenProps) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const [loginMode, setLoginMode] = useState<"mobile" | "email">("mobile");

  /* Phone: split into country + national number */
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const [mobileOtp, setMobileOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Accordion: first pillar open by default */
  const [openPillar, setOpenPillar] = useState<PillarId | null>("experiences");

  /* Compose full mobile number for services */
  const fullMobileNumber = `${selectedCountry.dialCode}${phoneNumber.replace(/\s/g, "")}`;

  /* ── Handlers (logic preserved) ── */
  const completeLogin = async (user: any) => {
    if (!user?.id) {
      throw new Error("Login succeeded, but user profile was not returned.");
    }
    await saveDevoteeAccount(authUserToDevoteeAccount(user));
    dispatch(loadSavedDevoteeAccountRequest());
    onContinue();
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Mobile required", "Please enter your mobile number.");
      return;
    }
    try {
      setIsSubmitting(true);
      await sendUserMobileOtp(fullMobileNumber);
      setOtpSent(true);
      Alert.alert("OTP sent", "Please enter the OTP sent to your mobile.");
    } catch (error) {
      Alert.alert(
        "OTP failed",
        error instanceof Error ? error.message : "Unable to send OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMobileLogin = async () => {
    if (!phoneNumber.trim() || !mobileOtp.trim()) {
      Alert.alert("OTP required", "Please enter mobile number and OTP.");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await verifyUserMobileOtp(fullMobileNumber, mobileOtp);
      await completeLogin(response.user);
    } catch (error) {
      Alert.alert(
        "Login failed",
        error instanceof Error ? error.message : "Unable to login."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Login details required", "Please enter email and password.");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await loginUserWithEmail(email, password);
      await completeLogin(response.user);
    } catch (error) {
      Alert.alert(
        "Login failed",
        error instanceof Error ? error.message : "Unable to login."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePillar = (id: PillarId) => {
    setOpenPillar((prev) => (prev === id ? null : id));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <StatusBar backgroundColor={C.bg} barStyle="dark-content" />

      <ScrollView
        bounces
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 180,
            paddingTop: insets.top + 14,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <HeartHandshake color={C.saffron} size={18} strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.brandEyebrow}>Welcome to</Text>
              <Text style={styles.brandTitle}>Sai Family</Text>
            </View>
          </View>
          <View style={styles.secureBadge}>
            <ShieldCheck color={C.green} size={13} strokeWidth={2.3} />
            <Text style={styles.secureText}>Secure</Text>
          </View>
        </View>

        {/* ─── Hero ─── */}
        <View style={styles.hero}>
          <View style={styles.heroImageRing}>
            <View style={styles.heroImageInner}>
              <Image
                resizeMode="contain"
                source={require("../assets/images/saibaba1.png")}
                style={styles.heroImage}
              />
            </View>
          </View>

          <View style={styles.kicker}>
            <Sparkles color={C.saffronText} size={11} strokeWidth={2.3} />
            <Text style={styles.kickerText}>OM SAI RAM</Text>
          </View>

          <Text style={styles.heroTitle}>
            One peaceful place for{"\n"}devotion & sangha
          </Text>
          <Text style={styles.heroText}>
            Continue with mobile or email to stay connected with experiences,
            events, and your community.
          </Text>
        </View>

        {/* ─── Sign-in card ─── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Sign in</Text>
              <Text style={styles.cardSubtitle}>
                Mobile OTP or verified email password
              </Text>
            </View>
            <View style={styles.shieldChip}>
              <ShieldCheck color={C.green} size={15} strokeWidth={2.2} />
            </View>
          </View>

          {/* Segmented */}
          <View style={styles.segmented}>
            {(["mobile", "email"] as const).map((mode) => {
              const activeMode = loginMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setLoginMode(mode)}
                  style={[
                    styles.segmentButton,
                    activeMode && styles.segmentButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      activeMode && styles.segmentTextActive,
                    ]}
                  >
                    {mode === "mobile" ? "Mobile OTP" : "Email"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {loginMode === "mobile" ? (
            <View style={styles.formStack}>
              <View>
                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>

                {/* Joined phone input: country pill + divider + national number */}
                <View style={styles.phoneInputWrap}>
                  <Pressable
                    onPress={() => setShowCountryPicker(true)}
                    style={({ pressed }) => [
                      styles.countryPill,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={styles.flagSmall}>{selectedCountry.flag}</Text>
                    <Text style={styles.dialCodeText}>
                      {selectedCountry.dialCode}
                    </Text>
                    <ChevronDown
                      color={C.inkSecondary}
                      size={12}
                      strokeWidth={2.2}
                    />
                  </Pressable>

                  <View style={styles.phoneDivider} />

                  <TextInput
                    keyboardType="phone-pad"
                    maxLength={15}
                    onChangeText={setPhoneNumber}
                    placeholder="98765 43210"
                    placeholderTextColor={C.inkTertiary}
                    style={styles.phoneInput}
                    value={phoneNumber}
                  />
                </View>
              </View>

              {otpSent ? (
                <View>
                  <Text style={styles.inputLabel}>ONE-TIME PASSWORD</Text>
                  <TextInput
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={setMobileOtp}
                    placeholder="6-digit code"
                    placeholderTextColor={C.inkTertiary}
                    style={styles.input}
                    value={mobileOtp}
                  />
                </View>
              ) : null}

              <Text style={styles.helperText}>
                {otpSent
                  ? `We sent a code to ${selectedCountry.dialCode} ${phoneNumber}. Enter it above to continue.`
                  : "We'll send a one-time password to confirm your number."}
              </Text>
            </View>
          ) : (
            <View style={styles.formStack}>
              <View>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={C.inkTertiary}
                  style={styles.input}
                  value={email}
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={C.inkTertiary}
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
              </View>
              <Text style={styles.helperText}>
                Email login works after you verify your email and create a
                password from profile settings.
              </Text>
            </View>
          )}
        </View>

        {/* ─── Trust chips ─── */}
        <View style={styles.trustRow}>
          {trustItems.map((item) => (
            <View key={item} style={styles.trustChip}>
              <CheckCircle2 color={C.green} size={13} strokeWidth={2.3} />
              <Text style={styles.trustChipText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* ─── Deep pillars section ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>FOUR SACRED PILLARS</Text>
          <Text style={styles.sectionTitle}>
            Everything your devotion needs
          </Text>
          <Text style={styles.sectionText}>
            Tap any pillar to see how it supports your daily practice.
          </Text>
        </View>

        <View style={styles.pillarsStack}>
          {PILLARS.map((pillar) => (
            <PillarAccordionCard
              key={pillar.id}
              isOpen={openPillar === pillar.id}
              onToggle={() => togglePillar(pillar.id)}
              pillar={pillar}
            />
          ))}
        </View>
      </ScrollView>

      {/* ─── Sticky bottom bar ─── */}
      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}
      >
        <Pressable
          disabled={isSubmitting}
          onPress={
            loginMode === "mobile"
              ? otpSent
                ? handleMobileLogin
                : handleSendOtp
              : handleEmailLogin
          }
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
            isSubmitting && styles.primaryButtonLoading,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryText}>
                {loginMode === "mobile"
                  ? otpSent
                    ? "Verify OTP"
                    : "Send OTP"
                  : "Login"}
              </Text>
              <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.2} />
            </>
          )}
        </Pressable>

        <Pressable
          onPress={onCreateAccount}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryText}>Create Account</Text>
        </Pressable>

        <Text style={styles.footerText}>॥ Jai Sai Ram ॥</Text>
      </View>

      {/* ─── Country picker modal ─── */}
      <CountryPickerModal
        visible={showCountryPicker}
        selectedCode={selectedCountry.code}
        onClose={() => setShowCountryPicker(false)}
        onSelect={setSelectedCountry}
      />
    </KeyboardAvoidingView>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  root: { backgroundColor: C.bg, flex: 1 },
  scrollContent: { paddingHorizontal: 18 },

  /* Header */
  header: { alignItems: "center", flexDirection: "row", marginBottom: 24 },
  brandRow: { alignItems: "center", flex: 1, flexDirection: "row", gap: 10 },
  brandMark: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  brandEyebrow: {
    color: C.inkSecondary,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  brandTitle: {
    color: C.ink,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 1,
  },
  secureBadge: {
    alignItems: "center",
    backgroundColor: C.greenBg,
    borderRadius: 100,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  secureText: {
    color: C.green,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  /* Hero */
  hero: { alignItems: "center", marginBottom: 24 },
  heroImageRing: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 100,
    borderWidth: 1,
    height: 152,
    justifyContent: "center",
    width: 152,
  },
  heroImageInner: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    height: 136,
    justifyContent: "center",
    overflow: "hidden",
    width: 136,
  },
  heroImage: { height: 130, width: 130 },
  kicker: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 100,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    marginTop: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  kickerText: {
    color: C.saffronText,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: C.ink,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 33,
    marginTop: 12,
    textAlign: "center",
  },
  heroText: {
    color: C.inkSecondary,
    fontSize: 14.5,
    fontWeight: "400",
    lineHeight: 21,
    marginTop: 8,
    paddingHorizontal: 8,
    textAlign: "center",
  },

  /* Card */
  card: {
    backgroundColor: C.surface,
    borderColor: C.separator,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
    shadowColor: "#7C2D12",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  cardTitle: {
    color: C.ink,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: C.inkSecondary,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
    marginTop: 2,
  },
  shieldChip: {
    alignItems: "center",
    backgroundColor: C.greenBg,
    borderRadius: 100,
    height: 32,
    justifyContent: "center",
    width: 32,
  },

  /* Segmented */
  segmented: {
    backgroundColor: "rgba(120,120,128,0.12)",
    borderRadius: 10,
    flexDirection: "row",
    marginBottom: 16,
    padding: 2,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: C.surface,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: { color: C.inkSecondary, fontSize: 13, fontWeight: "500" },
  segmentTextActive: { color: C.ink, fontWeight: "600" },

  /* Form */
  formStack: { gap: 14 },
  inputLabel: {
    color: C.inkSecondary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(120,120,128,0.08)",
    borderColor: "transparent",
    borderRadius: 12,
    borderWidth: 1.2,
    color: C.ink,
    fontSize: 16,
    fontWeight: "500",
    height: 50,
    paddingHorizontal: 14,
  },
  helperText: {
    color: C.inkSecondary,
    fontSize: 12.5,
    fontWeight: "400",
    lineHeight: 18,
  },

  /* Phone input with country picker */
  phoneInputWrap: {
    alignItems: "center",
    backgroundColor: "rgba(120,120,128,0.08)",
    borderRadius: 12,
    flexDirection: "row",
    height: 50,
    overflow: "hidden",
  },
  countryPill: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    height: "100%",
    paddingHorizontal: 12,
  },
  flagSmall: {
    fontSize: 18,
  },
  dialCodeText: {
    color: C.ink,
    fontSize: 15,
    fontWeight: "600",
  },
  phoneDivider: {
    backgroundColor: "rgba(120,120,128,0.24)",
    height: 26,
    width: 1,
  },
  phoneInput: {
    color: C.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    height: "100%",
    paddingHorizontal: 14,
  },

  /* Trust chips */
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 28,
    marginTop: 4,
  },
  trustChip: {
    alignItems: "center",
    backgroundColor: C.surface,
    borderColor: C.separator,
    borderRadius: 100,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trustChipText: { color: C.ink, fontSize: 12, fontWeight: "500" },

  /* Section header */
  sectionHeader: { marginBottom: 14 },
  sectionEyebrow: {
    color: C.saffronText,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  sectionTitle: {
    color: C.ink,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginTop: 4,
  },
  sectionText: {
    color: C.inkSecondary,
    fontSize: 13.5,
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 4,
  },

  /* Pillars accordion */
  pillarsStack: {
    gap: 10,
  },
  pillarCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
  },
  pillarRibbon: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 3,
  },
  pillarHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  pillarIconLarge: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  pillarLabel: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  pillarTagline: {
    color: C.inkSecondary,
    fontSize: 11.5,
    fontStyle: "italic",
    fontWeight: "500",
    marginTop: 1,
  },
  pillarChevron: {
    alignItems: "center",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  pillarBody: {
    paddingBottom: 14,
    paddingHorizontal: 14,
  },
  dotDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  dotLine: { flex: 1, height: 1, opacity: 0.3 },
  dotDot: { borderRadius: 3, height: 4, opacity: 0.5, width: 4 },
  pillarDescription: {
    color: "#3D2410",
    fontSize: 12.5,
    fontWeight: "400",
    lineHeight: 21,
    marginBottom: 14,
  },
  featuresLabel: {
    color: C.inkSecondary,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.7,
    marginBottom: 9,
  },
  featureRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 9,
    marginBottom: 8,
  },
  featureIcon: {
    alignItems: "center",
    borderRadius: 7,
    height: 22,
    justifyContent: "center",
    marginTop: 1,
    width: 22,
  },
  featureText: {
    color: "#5C3318",
    flex: 1,
    fontSize: 12.5,
    fontWeight: "400",
    lineHeight: 18,
  },
  quoteChip: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 100,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  quoteChipText: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  /* Pressed */
  pressed: { opacity: 0.85 },
  buttonPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },

  /* Bottom bar */
  bottomBar: {
    backgroundColor: "rgba(250,250,247,0.98)",
    borderTopColor: C.separator,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    position: "absolute",
    right: 0,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: C.maroon,
    borderRadius: 14,
    flexDirection: "row",
    gap: 7,
    height: 52,
    justifyContent: "center",
  },
  primaryButtonLoading: { opacity: 0.85 },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    marginTop: 6,
  },
  secondaryText: {
    color: C.maroon,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  footerText: {
    color: C.inkTertiary,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1.5,
    marginTop: 6,
    textAlign: "center",
  },

  /* ═══ Country picker modal ═══ */
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "85%",
    paddingTop: 8,
  },
  grabber: {
    alignSelf: "center",
    backgroundColor: "#D6D3D1",
    borderRadius: 100,
    height: 4,
    marginBottom: 8,
    width: 40,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  modalTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(120,120,128,0.16)",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  searchWrap: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInput: {
    alignItems: "center",
    backgroundColor: "rgba(120,120,128,0.1)",
    borderRadius: 11,
    flexDirection: "row",
    gap: 8,
    height: 40,
    paddingHorizontal: 12,
  },
  searchField: {
    color: C.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    height: "100%",
    padding: 0,
  },
  rowSeparator: {
    backgroundColor: C.separator,
    height: 1,
    marginHorizontal: 18,
  },
  countryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  countryRowSelected: {
    backgroundColor: C.saffronBg,
  },
  countryRowPressed: {
    opacity: 0.7,
  },
  flag: {
    fontSize: 22,
  },
  countryName: {
    color: C.ink,
    fontSize: 14.5,
    fontWeight: "600",
  },
  countryDial: {
    color: C.inkSecondary,
    fontSize: 12,
    fontWeight: "400",
    marginTop: 1,
  },
  checkBadge: {
    alignItems: "center",
    backgroundColor: C.saffron,
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: C.inkSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
});