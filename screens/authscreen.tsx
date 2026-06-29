import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
    description:
      "Share prayers, miracles, dreams, darshan stories, and blessings.",
    Icon: MessageCircleHeart,
    id: "experiences",
    label: "Leela Feed",
    title: "Divine experiences",
  },
  {
    description:
      "Discover bhajans, pooja, seva, satsang, and community gatherings.",
    Icon: CalendarDays,
    id: "events",
    label: "Events",
    title: "Sacred gatherings",
  },
  {
    description:
      "Find devotee businesses and trusted services from your community.",
    Icon: Building2,
    id: "directory",
    label: "Directory",
    title: "Devotee services",
  },
  {
    description:
      "Join circles, groups, and seva communities with shared purpose.",
    Icon: Users,
    id: "sangha",
    label: "Sangha",
    title: "Community circles",
  },
];

const trustItems = [
  "Secure devotee profile",
  "Family-first community",
  "Event reminders and updates",
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
    <View style={styles.root}>
      <StatusBar
        backgroundColor="#FAFAF9"
        barStyle="dark-content"
      />

      <ScrollView
        bounces
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 154,
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
              <Text style={styles.kickerText}>Welcome home</Text>
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

        <View style={styles.trustCard}>
          {trustItems.map((item) => (
            <View key={item} style={styles.trustRow}>
              <CheckCircle2 color="#F97316" size={17} />
              <Text style={styles.trustText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore the app</Text>
          <Text style={styles.sectionText}>
            Tap a pillar to preview what you can do.
          </Text>
        </View>

        <View style={styles.pillarGrid}>
          {PILLARS.map((pillar) => {
            const isActive = activePillar === pillar.id;
            const Icon = pillar.Icon;

            return (
              <Pressable
                key={pillar.id}
                onPress={() => setActivePillar(pillar.id)}
                style={({ pressed }) => [
                  styles.pillarCard,
                  isActive && styles.pillarCardActive,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.pillarIcon,
                    isActive && styles.pillarIconActive,
                  ]}
                >
                  <Icon
                    color={isActive ? "#FFFFFF" : "#1F2937"}
                    size={20}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.pillarLabel,
                    isActive && styles.pillarLabelActive,
                  ]}
                >
                  {pillar.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewIcon}>
            <ActiveIcon color="#F97316" size={23} strokeWidth={2} />
          </View>
          <View style={styles.previewCopy}>
            <Text style={styles.previewTitle}>{active.title}</Text>
            <Text style={styles.previewDescription}>
              {active.description}
            </Text>
          </View>
        </View>

        <View style={styles.loginCard}>
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
              <TextInput
                keyboardType="phone-pad"
                onChangeText={setMobileNumber}
                placeholder="+919876543210"
                placeholderTextColor="#A8A29E"
                style={styles.input}
                value={mobileNumber}
              />
              {otpSent ? (
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={setMobileOtp}
                  placeholder="Enter OTP"
                  placeholderTextColor="#A8A29E"
                  style={styles.input}
                  value={mobileOtp}
                />
              ) : null}
              <Pressable
                disabled={isSubmitting}
                onPress={otpSent ? handleMobileLogin : handleSendOtp}
                style={({ pressed }) => [
                  styles.loginAction,
                  pressed && styles.buttonPressed,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginActionText}>
                    {otpSent ? "Verify & Login" : "Send OTP"}
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.loginForm}>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#A8A29E"
                style={styles.input}
                value={email}
              />
              <TextInput
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#A8A29E"
                secureTextEntry
                style={styles.input}
                value={password}
              />
              <Pressable
                disabled={isSubmitting}
                onPress={handleEmailLogin}
                style={({ pressed }) => [
                  styles.loginAction,
                  pressed && styles.buttonPressed,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginActionText}>Login</Text>
                )}
              </Pressable>
            </View>
          )}
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
          <Text style={styles.primaryText}>
            {loginMode === "mobile" ? (otpSent ? "Verify OTP" : "Send OTP") : "Login"}
          </Text>
          <ArrowRight color="#FFFFFF" size={18} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: "rgba(250,250,249,0.97)",
    borderTopColor: "#E7D7BE",
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    position: "absolute",
    right: 0,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
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
    fontSize: 12,
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
    fontSize: 18,
    fontWeight: "900",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 18,
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
    height: 180,
    width: 180,
  },
  heroImageWrap: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    height: 210,
    justifyContent: "center",
  },
  heroText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 23,
    marginTop: 10,
  },
  heroTextWrap: {
    padding: 16,
  },
  heroTitle: {
    color: "#1F2937",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 31,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FAFAF9",
    borderColor: "#E7D7BE",
    borderRadius: 12,
    borderWidth: 1,
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "800",
    height: 48,
    paddingHorizontal: 14,
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
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 92,
    minWidth: "47%",
    padding: 12,
  },
  pillarCardActive: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
  },
  pillarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pillarIcon: {
    alignItems: "center",
    backgroundColor: "#F6EFD9",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    marginBottom: 9,
    width: 42,
  },
  pillarIconActive: {
    backgroundColor: "#F97316",
  },
  pillarLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "900",
  },
  pillarLabelActive: {
    color: "#1F2937",
  },
  loginAction: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
  },
  loginActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  loginForm: {
    gap: 10,
    marginTop: 12,
  },
  pressed: {
    opacity: 0.86,
  },
  previewCard: {
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    padding: 15,
  },
  previewCopy: {
    flex: 1,
  },
  previewDescription: {
    color: "#D6D3D1",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 4,
  },
  previewIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 13,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  previewTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    height: 52,
    justifyContent: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
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
    borderRadius: 12,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryText: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    height: 38,
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#1F2937",
  },
  segmented: {
    backgroundColor: "#F6EFD9",
    borderRadius: 12,
    flexDirection: "row",
    padding: 4,
  },
  segmentText: {
    color: "#78716C",
    fontSize: 12,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 18,
  },
  sectionText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
  },
  secureBadge: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  trustCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginTop: 14,
    padding: 14,
  },
  trustRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  trustText: {
    color: "#1F2937",
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
  },
});
