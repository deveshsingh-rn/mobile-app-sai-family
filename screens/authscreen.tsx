import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Users,
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

/* ─── Types ──────────────────────────────────────────────── */
type AuthScreenProps = {
  onContinue: () => void;
  onCreateAccount: () => void;
};

type PillarId = "experiences" | "events" | "directory" | "sangha";

type Pillar = {
  accent: string;
  background: string;
  description: string;
  id: PillarId;
  Icon: React.ComponentType<{
    color?: string;
    size?: number;
    strokeWidth?: number;
  }>;
  label: string;
  title: string;
};

/* ─── Data ───────────────────────────────────────────────── */
const PILLARS: Pillar[] = [
  {
    accent: "#C2410C",
    background: "#FFF7ED",
    description:
      "Share prayers, miracles, dreams, darshan stories, and blessings.",
    Icon: MessageCircleHeart,
    id: "experiences",
    label: "Leela Feed",
    title: "Divine experiences",
  },
  {
    accent: "#0F766E",
    background: "#ECFDF5",
    description:
      "Discover bhajans, pooja, seva, satsang, and community gatherings.",
    Icon: CalendarDays,
    id: "events",
    label: "Events",
    title: "Sacred gatherings",
  },
  {
    accent: "#7C3AED",
    background: "#F5F3FF",
    description:
      "Find devotee businesses and trusted services from your community.",
    Icon: Building2,
    id: "directory",
    label: "Directory",
    title: "Devotee services",
  },
  {
    accent: "#BE185D",
    background: "#FDF2F8",
    description:
      "Join circles, groups, and seva communities with shared purpose.",
    Icon: Users,
    id: "sangha",
    label: "Sangha",
    title: "Community circles",
  },
];

const trustItems = [
  "Mobile OTP protected",
  "Private devotee profile",
  "One-time verification",
];

/* ─── Theme tokens ───────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════════════════ */
export default function AuthScreen({
  onContinue,
  onCreateAccount,
}: AuthScreenProps) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [activePillar, setActivePillar] = useState<PillarId>("experiences");
  const [loginMode, setLoginMode] = useState<"mobile" | "email">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const active = useMemo(
    () => PILLARS.find((p) => p.id === activePillar) || PILLARS[0],
    [activePillar]
  );
  const ActiveIcon = active.Icon;

  /* ── Handlers (unchanged) ── */
  const completeLogin = async (user: any) => {
    if (!user?.id) {
      throw new Error("Login succeeded, but user profile was not returned.");
    }
    await saveDevoteeAccount(authUserToDevoteeAccount(user));
    dispatch(loadSavedDevoteeAccountRequest());
    onContinue();
  };

  const handleSendOtp = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert("Mobile required", "Please enter your mobile number.");
      return;
    }
    try {
      setIsSubmitting(true);
      await sendUserMobileOtp(mobileNumber);
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
    if (!mobileNumber.trim() || !mobileOtp.trim()) {
      Alert.alert("OTP required", "Please enter mobile number and OTP.");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await verifyUserMobileOtp(mobileNumber, mobileOtp);
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

  /* ═════════════════════════════════════════════════════════ */
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

          {/* iOS-style segmented control */}
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
                <TextInput
                  keyboardType="phone-pad"
                  onChangeText={setMobileNumber}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={C.inkTertiary}
                  style={styles.input}
                  value={mobileNumber}
                />
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
                  ? "We sent a code to your mobile. Enter it above to continue."
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

        {/* ─── Pillars section ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>FOUR PILLARS</Text>
          <Text style={styles.sectionTitle}>
            Everything for your daily devotion
          </Text>
          <Text style={styles.sectionText}>
            Tap a card to see how each pillar supports your spiritual journey.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillarScroller}
          decelerationRate="fast"
          snapToInterval={166}
        >
          {PILLARS.map((pillar, index) => {
            const isActive = activePillar === pillar.id;
            const Icon = pillar.Icon;
            return (
              <Pressable
                key={pillar.id}
                onPress={() => setActivePillar(pillar.id)}
                style={({ pressed }) => [
                  styles.pillarCard,
                  isActive && {
                    borderColor: pillar.accent,
                    backgroundColor: pillar.background,
                  },
                  isActive && styles.pillarCardActive,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.pillarIcon,
                    {
                      backgroundColor: isActive ? pillar.accent : C.saffronBg,
                    },
                  ]}
                >
                  <Icon
                    color={isActive ? "#FFFFFF" : pillar.accent}
                    size={20}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.pillarStep}>0{index + 1}</Text>
                <Text numberOfLines={1} style={styles.pillarLabel}>
                  {pillar.label}
                </Text>
                <Text numberOfLines={2} style={styles.pillarSmallText}>
                  {pillar.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ─── Active pillar preview ─── */}
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: active.background,
              borderColor: active.accent + "40",
            },
          ]}
        >
          <View
            style={[
              styles.previewIcon,
              { backgroundColor: active.accent + "1A" },
            ]}
          >
            <ActiveIcon color={active.accent} size={22} strokeWidth={2} />
          </View>
          <View style={styles.previewCopy}>
            <Text style={[styles.previewTitle, { color: active.accent }]}>
              {active.title}
            </Text>
            <Text style={styles.previewDescription}>{active.description}</Text>
          </View>
          <ChevronRight color={active.accent} size={18} strokeWidth={2.2} />
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
    </KeyboardAvoidingView>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  root: { backgroundColor: C.bg, flex: 1 },
  scrollContent: { paddingHorizontal: 18 },

  /* Header */
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 24,
  },
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

  /* Card (generic) */
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

  /* Segmented control (iOS) */
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

  /* Pillars */
  pillarScroller: { gap: 12, paddingBottom: 4, paddingRight: 18 },
  pillarCard: {
    backgroundColor: C.surface,
    borderColor: C.separator,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 150,
    padding: 14,
    width: 154,
  },
  pillarCardActive: {
    shadowColor: "#7C2D12",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  pillarIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    marginBottom: 12,
    width: 40,
  },
  pillarStep: {
    color: C.inkTertiary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  pillarLabel: {
    color: C.ink,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  pillarSmallText: {
    color: C.inkSecondary,
    fontSize: 12.5,
    fontWeight: "400",
    lineHeight: 17,
    marginTop: 3,
  },

  /* Preview */
  previewCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    padding: 14,
  },
  previewIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  previewCopy: { flex: 1 },
  previewTitle: { fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },
  previewDescription: {
    color: C.inkSecondary,
    fontSize: 12.5,
    fontWeight: "400",
    lineHeight: 17,
    marginTop: 2,
  },

  /* Press states */
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
});