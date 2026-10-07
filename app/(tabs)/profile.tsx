import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Bell,
  ChevronRight,
  Languages,
  LogOut,
  Moon,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react-native";

import { removeDevoteeAccountStorage } from "@/services/devotee-account";
import {
  logoutRequest,
} from "@/store/devotee-account/actions";
import { selectDevoteeAccount } from "@/store/devotee-account/selectors";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { MorningSaiAlarmCard } from "@/components/profile/MorningSaiAlarmCard";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";

type ProfileTab = "details" | "settings";

type DetailRowProps = {
  label: string;
  value?: string | null;
};

type SettingRowProps = {
  description: string;
  grouped?: boolean;
  hideComingSoon?: boolean;
  icon: React.ReactNode;
  isDestructive?: boolean;
  onPress?: () => void;
  title: string;
};

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("settings");
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectDevoteeAccount);
  const accountAny = account as any;
  const profileImageUri =
    account?.profileImage?.uri ||
    account?.profileImageUrl ||
    account?.profile?.profileImageUrl;
  const isEmailVerified = Boolean(
    accountAny?.emailVerified ||
      accountAny?.isEmailVerified ||
      accountAny?.emailVerifiedAt ||
      accountAny?.verifiedEmailAt
  );

  const initials = useMemo(() => {
    const name = account?.name || "Devotee";

    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [account?.name]);

  const profileStats = useMemo(
    () => [
      {
        label: "Membership",
        value: account?.memberId ? "Active" : "Pending",
      },
      {
        label: "Email",
        value: isEmailVerified ? "Verified" : "Pending",
      },
      {
        label: "Language",
        value: String(
          account?.profile?.language || account?.language || "EN"
        ).toUpperCase(),
      },
    ],
    [account?.language, account?.memberId, account?.profile?.language, isEmailVerified]
  );

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        {
          style: "cancel",
          text: "Cancel",
        },
        {
          onPress: async () => {
            await removeDevoteeAccountStorage();
            dispatch(logoutRequest());
          },
          style: "destructive",
          text: "Log Out",
        },
      ]
    );
  };

  return (<SafeAreaView style={styles.container}>
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SAI FAMILY</Text>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>Your Account, Preferences and Daily Practice</Text>
        </View>

        <View style={styles.headerBadge}>
          <ShieldCheck color={EXPERIENCE_THEME.heading} size={21} />
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}

          <View style={styles.summaryText}>
            <View style={styles.nameRow}>
              <Text numberOfLines={1} style={styles.name}>
                {account?.name || "Devotee Profile"}
              </Text>
              <View style={styles.verifiedBadge}>
                <Sparkles color="#F97316" size={13} />
              </View>
            </View>
            <Text style={styles.memberId}>
              {account?.memberId || "Create Account to Get Your ID"}
            </Text>
            <Text numberOfLines={1} style={styles.location}>
              {account?.location ||
                account?.profile?.city ||
                account?.city ||
                "Sai Family Member"}
            </Text>
          </View>
        </View>

        {/* <View style={styles.statGrid}>
          {profileStats.map((item) => (
            <View key={item.label} style={styles.statBox}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View> */}
      </View>

      <View style={styles.segment}>
       
        <SegmentButton
          isActive={activeTab === "settings"}
          label="Settings"
          onPress={() => setActiveTab("settings")}
        />
         <SegmentButton
          isActive={activeTab === "details"}
          label="My Details"
          onPress={() => setActiveTab("details")}
        />
      </View>

      {activeTab === "details" ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personal information</Text>
          <View style={styles.detailCard}>
            <DetailRow label="Mobile" value={account?.mobileNumber} />
            <DetailRow label="Email" value={account?.email} />
            
            <DetailRow
              label="Language"
              value={(
                account?.profile?.language ||
                account?.language
              )?.toUpperCase()}
            />
          </View>

          {/* <Text style={styles.sectionLabel}>Coming later</Text>
          <View style={styles.scoreBox}>
            <View style={styles.scoreIcon}>
              <Star size={20} color="#F97316" fill="#FDBA74" />
            </View>
            <View style={styles.scoreTextWrap}>
              <Text style={styles.scoreTitle}>Devotion Score</Text>
              <Text style={styles.scoreDescription}>
                Future feature for seva, activity, and participation points.
              </Text>
            </View>
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          </View> */}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Daily practice</Text>
          <MorningSaiAlarmCard devoteeName={account?.name} />
          {/* <View style={styles.securityCard}> */}
            {/* <View style={styles.securityHeader}>
              <View style={styles.securityIcon}>
                <KeyRound color="#F97316" size={22} />
              </View>
              <View style={styles.securityTitleWrap}>
                <Text style={styles.securityTitle}>Email Login</Text>
                <Text style={styles.securityDescription}>
                  Verify your email and create a password for easy login.
                </Text>
              </View>
              <View
                style={[
                  styles.securityStatus,
                  hasEmailLoginReady && styles.securityStatusVerified,
                ]}
              >
                <Text
                  style={[
                    styles.securityStatusText,
                    hasEmailLoginReady &&
                      styles.securityStatusTextVerified,
                  ]}
                >
                  {hasEmailLoginReady ? "Verified" : "Pending"}
                </Text>
              </View>
            </View> */}

            {/* <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputShell}>
                <Mail color="#A8A29E" size={18} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={setSecurityEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#A8A29E"
                  style={styles.securityInput}
                  value={securityEmail}
                />
              </View>
            </View> */}

            {/* {!hasEmailLoginReady && (
              <>
                <View style={styles.passwordGrid}>
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Create Password</Text>
                    <View style={styles.inputShell}>
                      <KeyRound color="#A8A29E" size={18} />
                      <TextInput
                        onChangeText={setSecurityPassword}
                        placeholder="Minimum 8 characters"
                        placeholderTextColor="#A8A29E"
                        secureTextEntry
                        style={styles.securityInput}
                        value={securityPassword}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>
                      Confirm Password
                    </Text>
                    <View style={styles.inputShell}>
                      <ShieldCheck color="#A8A29E" size={18} />
                      <TextInput
                        onChangeText={setSecurityConfirmPassword}
                        placeholder="Repeat password"
                        placeholderTextColor="#A8A29E"
                        secureTextEntry
                        style={styles.securityInput}
                        value={securityConfirmPassword}
                      />
                    </View>
                  </View>
                </View>

                <Pressable
                  disabled={securityAction === "setup"}
                  onPress={handleSetupEmailPassword}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.rowPressed,
                    securityAction === "setup" &&
                      styles.disabledButton,
                  ]}
                >
                  <Send color="#FFFFFF" size={18} />
                  <Text style={styles.primaryButtonText}>
                    {securityAction === "setup"
                      ? "Sending Code..."
                      : "Send Verification Code"}
                  </Text>
                </Pressable>

                {hasSentEmailOtp && (
                  <View style={styles.otpPanel}>
                    <Text style={styles.inputLabel}>
                      Email Verification Code
                    </Text>
                    <View style={styles.inputShell}>
                      <CheckCircle2 color="#A8A29E" size={18} />
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={8}
                        onChangeText={setEmailOtp}
                        placeholder="Enter code"
                        placeholderTextColor="#A8A29E"
                        style={styles.securityInput}
                        value={emailOtp}
                      />
                    </View>

                    <View style={styles.inlineActions}>
                      <Pressable
                        disabled={securityAction === "verify"}
                        onPress={handleVerifyEmail}
                        style={({ pressed }) => [
                          styles.verifyButton,
                          pressed && styles.rowPressed,
                          securityAction === "verify" &&
                            styles.disabledButton,
                        ]}
                      >
                        <Text style={styles.verifyButtonText}>
                          {securityAction === "verify"
                            ? "Verifying..."
                            : "Verify Email"}
                        </Text>
                      </Pressable>

                      <Pressable
                        disabled={securityAction === "resend"}
                        onPress={handleResendEmailVerification}
                        style={({ pressed }) => [
                          styles.resendButton,
                          pressed && styles.rowPressed,
                          securityAction === "resend" &&
                            styles.disabledButton,
                        ]}
                      >
                        <Text style={styles.resendButtonText}>
                          {securityAction === "resend"
                            ? "Sending..."
                            : "Resend"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </>
            )} */}

            {/* {hasEmailLoginReady && (
              <View style={styles.verifiedPanel}>
                <CheckCircle2 color="#15803D" size={18} />
                <Text style={styles.verifiedPanelText}>
                  Email and password login is active for this account.
                </Text>
              </View>
            )} */}
          {/* </View> */}
          {/* <Text style={styles.sectionLabel}>Account & app</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              description="Prayer, event and family update alerts."
              grouped
              icon={<Bell size={21} color={EXPERIENCE_THEME.heading} />}
              title="Notifications"
            />
            <SettingRow
              description="Light, dark and system appearance."
              grouped
              icon={<Moon size={21} color={EXPERIENCE_THEME.heading} />}
              title="Appearance"
            />
            <SettingRow
              description="Your preferred app language."
              grouped
              icon={<Languages size={21} color={EXPERIENCE_THEME.heading} />}
              title="Language"
            />
          </View> */}

          <Text style={styles.sectionLabel}>Account access</Text>
          <SettingRow
            description="Safely Sign Out Of This Device."
            hideComingSoon
            icon={<LogOut size={21} color="#DC2626" />}
            isDestructive
            onPress={handleLogout}
            title="Log Out"
          />
         
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

function SegmentButton({
  isActive,
  label,
  onPress,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segmentButton,
        isActive && styles.segmentButtonActive,
      ]}
    >
      <Text
        style={[
          styles.segmentText,
          isActive && styles.segmentTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "Not added"}</Text>
    </View>
  );
}

function SettingRow({
  description,
  grouped,
  hideComingSoon,
  icon,
  isDestructive,
  onPress,
  title,
}: SettingRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "text"}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        grouped && styles.settingRowGrouped,
        pressed && onPress && styles.rowPressed,
      ]}
    >
      <View
        style={[
          styles.settingIcon,
          isDestructive && styles.settingIconDestructive,
        ]}
      >
        {icon}
      </View>
      <View style={styles.settingCopy}>
        <Text
          style={[
            styles.settingTitle,
            isDestructive && styles.settingTitleDestructive,
          ]}
        >
          {title}
        </Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {!hideComingSoon && (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}
      {onPress ? (
        <ChevronRight
          color={isDestructive ? "#DC2626" : "#A8A29E"}
          size={18}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderColor: "#F4C98D",
    borderRadius: 42,
    borderWidth: 3,
    height: 84,
    width: 84,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#FFF1D9",
    borderColor: "#F4C98D",
    borderRadius: 42,
    borderWidth: 2,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
  avatarInitials: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 26,
    fontWeight: "900",
  },
  comingSoon: {
    backgroundColor: "#FFF4E8",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  comingSoonText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 11,
    fontWeight: "900",
  },
  container: {
    backgroundColor: EXPERIENCE_THEME.background,
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  detailLabel: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  detailRow: {
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  detailValue: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
  },
  disabledButton: {
    opacity: 0.62,
  },
  eyebrow: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: "900",
  },
  formGroup: {
    gap: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 4,
  },
  headerBadge: {
    alignItems: "center",
    backgroundColor: "#FFF1D9",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
    padding: 18,
    shadowColor: EXPERIENCE_THEME.heading,
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  location: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  memberId: {
    color: "#A34A0A",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  name: {
    color: EXPERIENCE_THEME.heading,
    flex: 1,
    fontSize: 23,
    fontWeight: "900",
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  inputLabel: {
    color: "#57534E",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: "#FFFBF5",
    borderColor: "#E7D7BE",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 13,
  },
  otpPanel: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
    padding: 12,
  },
  passwordGrid: {
    gap: 12,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 12,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 50,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  resendButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#FED7AA",
    borderRadius: 11,
    borderWidth: 1,
    flex: 0.42,
    justifyContent: "center",
    minHeight: 46,
  },
  resendButtonText: {
    color: "#C2410C",
    fontSize: 13,
    fontWeight: "900",
  },
  rowPressed: {
    opacity: 0.84,
  },
  scoreBox: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 15,
  },
  scoreDescription: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 3,
  },
  scoreIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  scoreTextWrap: {
    flex: 1,
  },
  scoreTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "900",
  },
  section: {
    gap: 15,
  },
  sectionLabel: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    marginLeft: 2,
    textTransform: "uppercase",
  },
  segment: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
    padding: 5,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    height: 46,
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: EXPERIENCE_THEME.heading,
  },
  segmentText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  settingCopy: {
    flex: 1,
  },
  settingsGroup: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingDescription: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 3,
  },
  settingIcon: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 13,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  settingIconDestructive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  settingRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    padding: 14,
  },
  settingRowGrouped: {
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 0,
    borderWidth: 0,
  },
  settingTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "900",
  },
  settingTitleDestructive: {
    color: "#DC2626",
  },
  securityCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 15,
  },
  securityDescription: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 3,
  },
  securityHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  securityIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 13,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  securityInput: {
    color: "#1F2937",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    minHeight: 48,
    paddingVertical: 0,
  },
  securityStatus: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  securityStatusText: {
    color: "#C2410C",
    fontSize: 11,
    fontWeight: "900",
  },
  securityStatusTextVerified: {
    color: "#15803D",
  },
  securityStatusVerified: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  securityTitle: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "900",
  },
  securityTitleWrap: {
    flex: 1,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 66,
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  statGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  statLabel: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  statValue: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 14,
    fontWeight: "900",
  },
  summaryText: {
    flex: 1,
  },
  title: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  verifiedPanel: {
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 12,
  },
  verifiedPanelText: {
    color: "#166534",
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  verifiedBadge: {
    alignItems: "center",
    backgroundColor: "#FFF1D9",
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  verifyButton: {
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 11,
    flex: 0.58,
    justifyContent: "center",
    minHeight: 46,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
