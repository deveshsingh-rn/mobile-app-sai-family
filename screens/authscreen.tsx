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

type AuthScreenProps = {
  onContinue: () => void;
  onCreateAccount: () => void;
};

type PillarId =
  | "experiences"
  | "events"
  | "directory"
  | "sangha";

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
  "No login again after verification",
];

export default function AuthScreen({
  onContinue,
  onCreateAccount,
}: AuthScreenProps) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [activePillar, setActivePillar] =
    useState<PillarId>("experiences");
  const [loginMode, setLoginMode] = useState<"mobile" | "email">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const active = useMemo(
    () =>
      PILLARS.find((pillar) => pillar.id === activePillar) ||
      PILLARS[0],
    [activePillar]
  );
  const ActiveIcon = active.Icon;

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
      Alert.alert("OTP failed", error instanceof Error ? error.message : "Unable to send OTP.");
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
      Alert.alert("Login failed", error instanceof Error ? error.message : "Unable to login.");
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
      Alert.alert("Login failed", error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <StatusBar
        backgroundColor="#FAFAF9"
        barStyle="dark-content"
      />

      <ScrollView
        bounces
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 174,
            paddingTop: insets.top + 18,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <HeartHandshake color="#1F2937" size={20} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Sai Family</Text>
            <Text style={styles.headerTitle}>Devotion App</Text>
          </View>
          <View style={styles.secureBadge}>
            <ShieldCheck color="#F97316" size={18} />
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroImageWrap}>
            <Image
              resizeMode="contain"
              source={require("../assets/images/saibaba1.png")}
              style={styles.heroImage}
            />
          </View>

          <View style={styles.heroTextWrap}>
            <View style={styles.kicker}>
              <Sparkles color="#F97316" size={14} />
              <Text style={styles.kickerText}>Om Sai Ram</Text>
            </View>

            <Text style={styles.heroTitle}>
              One peaceful place for devotion, seva, and community.
            </Text>
            <Text style={styles.heroText}>
              Continue as a devotee, create your Sai Family account, and
              stay connected with experiences, events, Sangha, and trusted
              services.
            </Text>
          </View>
        </View>

        <View style={styles.loginCard}>
          <View style={styles.loginHeader}>
            <View>
              <Text style={styles.loginTitle}>Login to continue</Text>
              <Text style={styles.loginSubtitle}>
                Use mobile OTP or your verified email password.
              </Text>
            </View>
            <ShieldCheck color="#15803D" size={24} />
          </View>

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
                    {mode === "mobile" ? "Mobile OTP" : "Email Password"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {loginMode === "mobile" ? (
            <View style={styles.loginForm}>
              <View>
                <Text style={styles.inputLabel}>Mobile number</Text>
                <TextInput
                  keyboardType="phone-pad"
                  onChangeText={setMobileNumber}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#A8A29E"
                  style={styles.input}
                  value={mobileNumber}
                />
              </View>
              {otpSent ? (
                <View>
                  <Text style={styles.inputLabel}>OTP code</Text>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={setMobileOtp}
                    placeholder="Enter 6 digit OTP"
                    placeholderTextColor="#A8A29E"
                    style={styles.input}
                    value={mobileOtp}
                  />
                </View>
              ) : null}
              <Text style={styles.helperText}>
                {otpSent
                  ? "OTP sent. Please verify to open your account."
                  : "We will send an OTP to confirm this is your number."}
              </Text>
            </View>
          ) : (
            <View style={styles.loginForm}>
              <View>
                <Text style={styles.inputLabel}>Email address</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#A8A29E"
                  style={styles.input}
                  value={email}
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#A8A29E"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
              </View>
              <Text style={styles.helperText}>
                Email login works after you verify email and create a password from profile settings.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.trustCard}>
          {trustItems.map((item) => (
            <View key={item} style={styles.trustRow}>
              <CheckCircle2 color="#15803D" size={18} />
              <Text style={styles.trustText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Sai Family has 4 pillars</Text>
          <Text style={styles.sectionText}>
            Tap each card to see how the app supports your daily devotion.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillarScroller}
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
                  {
                    backgroundColor: pillar.background,
                    borderColor: isActive ? pillar.accent : "#E7D7BE",
                  },
                  isActive && styles.pillarCardActive,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.pillarIcon,
                    { backgroundColor: pillar.accent },
                  ]}
                >
                  <Icon
                    color="#FFFFFF"
                    size={24}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.pillarStep}>0{index + 1}</Text>
                <Text
                  numberOfLines={1}
                  style={styles.pillarLabel}
                >
                  {pillar.label}
                </Text>
                <Text numberOfLines={2} style={styles.pillarSmallText}>
                  {pillar.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.previewCard,
            { backgroundColor: active.background, borderColor: active.accent },
          ]}
        >
          <View style={styles.previewIcon}>
            <ActiveIcon color={active.accent} size={25} strokeWidth={2} />
          </View>
          <View style={styles.previewCopy}>
            <Text style={[styles.previewTitle, { color: active.accent }]}>
              {active.title}
            </Text>
            <Text style={styles.previewDescription}>
              {active.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 14,
          },
        ]}
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
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryText}>
                {loginMode === "mobile" ? (otpSent ? "Verify OTP" : "Send OTP") : "Login"}
              </Text>
              <ArrowRight color="#FFFFFF" size={20} />
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

        <Text style={styles.footerText}>Jai Sai Ram</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: "rgba(250,250,249,0.98)",
    borderTopColor: "#E7D7BE",
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    position: "absolute",
    right: 0,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 15,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
  eyebrow: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "900",
  },
  footerText: {
    color: "#78716C",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 10,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    color: "#1F2937",
    fontSize: 19,
    fontWeight: "900",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#7C2D12",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  heroImage: {
    height: 160,
    width: 160,
  },
  heroImageWrap: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    height: 178,
    justifyContent: "center",
  },
  heroText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 25,
    marginTop: 10,
  },
  heroTextWrap: {
    padding: 18,
  },
  heroTitle: {
    color: "#1F2937",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D6C5A8",
    borderRadius: 16,
    borderWidth: 1.2,
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "800",
    height: 58,
    paddingHorizontal: 16,
  },
  inputLabel: {
    color: "#44403C",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
  },
  helperText: {
    color: "#78716C",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
  kicker: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  kickerText: {
    color: "#C2410C",
    fontSize: 12,
    fontWeight: "900",
  },
  pillarCard: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 22,
    borderWidth: 1.5,
    minHeight: 154,
    padding: 16,
    width: 154,
  },
  pillarCardActive: {
    shadowColor: "#7C2D12",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  pillarScroller: {
    gap: 12,
    paddingRight: 16,
  },
  pillarIcon: {
    alignItems: "center",
    backgroundColor: "#F6EFD9",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    marginBottom: 14,
    width: 48,
  },
  pillarLabel: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "900",
  },
  pillarSmallText: {
    color: "#57534E",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 5,
  },
  pillarStep: {
    color: "#A8A29E",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 3,
  },
  loginCard: {
    backgroundColor: "#FFFDF8",
    borderColor: "#E0CFAF",
    borderRadius: 24,
    borderWidth: 1.3,
    marginTop: 16,
    padding: 18,
    shadowColor: "#7C2D12",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  loginForm: {
    gap: 14,
    marginTop: 16,
  },
  loginHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    marginBottom: 14,
  },
  loginSubtitle: {
    color: "#78716C",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 4,
  },
  loginTitle: {
    color: "#1F2937",
    fontSize: 22,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.86,
  },
  previewCard: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 14,
    marginTop: 16,
    padding: 16,
  },
  previewCopy: {
    flex: 1,
  },
  previewDescription: {
    color: "#44403C",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 4,
  },
  previewIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2B1308",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    height: 58,
    justifyContent: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  root: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 16,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "900",
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    height: 48,
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#2B1308",
  },
  segmented: {
    backgroundColor: "#F6EFD9",
    borderRadius: 17,
    flexDirection: "row",
    padding: 4,
  },
  segmentText: {
    color: "#78716C",
    fontSize: 14,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 22,
  },
  sectionText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 22,
    fontWeight: "900",
  },
  secureBadge: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 15,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  trustCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
    padding: 16,
  },
  trustRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  trustText: {
    color: "#1F2937",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
});
