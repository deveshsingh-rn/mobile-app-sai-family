import { useEffect, useMemo, useState } from "react";
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
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  Lock,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react-native";

import {
  sendUserMobileOtp,
  verifyUserMobileOtp,
} from "@/services/auth";
import {
  clearDevoteeAccountError,
  createDevoteeAccountRequest,
} from "@/store/devotee-account/actions";
import {
  selectDevoteeAccount,
  selectDevoteeAccountError,
  selectIsCreatingDevoteeAccount,
} from "@/store/devotee-account/selectors";
import {
  DevoteeAccount,
  DevoteeAccountForm,
} from "@/store/devotee-account/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/* ─── Theme tokens ───────────────────────────────────────── */
const C = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  ink: "#1C1917",
  inkSecondary: "#57534E",
  inkTertiary: "#A8A29E",
  separator: "#EFEAE0",
  separatorSoft: "#F5EFE3",
  saffron: "#C2410C",
  saffronText: "#9A3412",
  saffronBg: "#FFF7ED",
  saffronBorder: "#FED7AA",
  maroon: "#2B1308",
  green: "#15803D",
  greenBg: "#ECFDF5",
  greenBorder: "#BBF7D0",
};

/* ─── Form config ────────────────────────────────────────── */
const INITIAL_FORM: DevoteeAccountForm = {
  name: "",
  email: "",
  mobileNumber: "",
  completeAddress: "",
  pincode: "",
  occupation: "",
  city: "",
  state: "",
  country: "India",
  language: "en",
};

type FieldConfig = {
  key: keyof Omit<DevoteeAccountForm, "profileImage">;
  label: string;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  multiline?: boolean;
  required?: boolean;
};

type FieldGroup = {
  title: string;
  subtitle?: string;
  Icon: React.ComponentType<{
    color?: string;
    size?: number;
    strokeWidth?: number;
  }>;
  iconColor: string;
  iconBg: string;
  fields: FieldConfig[];
};

/* Grouped visually — same form state under the hood */
const FIELD_GROUPS: FieldGroup[] = [
  {
    title: "Personal Information",
    subtitle: "Tell us about yourself",
    Icon: UserRound,
    iconColor: C.saffron,
    iconBg: C.saffronBg,
    fields: [
      { key: "name", label: "Full name", placeholder: "Your full name", required: true },
      {
        key: "email",
        label: "Email",
        placeholder: "your@email.com",
        keyboardType: "email-address",
        required: true,
      },
    ],
  },
  {
    title: "Address",
    subtitle: "Where you live",
    Icon: MapPin,
    iconColor: "#0F766E",
    iconBg: "#ECFDF5",
    fields: [
      {
        key: "completeAddress",
        label: "Complete address",
        placeholder: "House no., street, area",
        multiline: true,
        required: true,
      },
      {
        key: "pincode",
        label: "Pincode",
        placeholder: "6-digit pincode",
        keyboardType: "number-pad",
        required: true,
      },
      { key: "city", label: "City", placeholder: "City", required: true },
      { key: "state", label: "State", placeholder: "State", required: true },
      { key: "country", label: "Country", placeholder: "Country" },
    ],
  },
  {
    title: "Additional Details",
    subtitle: "Optional information",
    Icon: Sparkles,
    iconColor: "#7C3AED",
    iconBg: "#F5F3FF",
    fields: [
      { key: "occupation", label: "Occupation", placeholder: "What you do" },
      { key: "language", label: "Language code", placeholder: "e.g. en, hi, te" },
    ],
  },
];

type CreateDevoteeAccountScreenProps = {
  onBack: () => void;
  onCreated: (account: DevoteeAccount) => void;
};

/* ═══════════════════════════════════════════════════════════ */
export default function CreateDevoteeAccountScreen({
  onBack,
  onCreated,
}: CreateDevoteeAccountScreenProps) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const account = useAppSelector(selectDevoteeAccount);
  const error = useAppSelector(selectDevoteeAccountError);
  const isSubmitting = useAppSelector(selectIsCreatingDevoteeAccount);

  const [form, setForm] = useState<DevoteeAccountForm>(INITIAL_FORM);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.name.trim() &&
          form.email.trim() &&
          form.mobileNumber.trim() &&
          form.completeAddress.trim() &&
          form.pincode.trim() &&
          form.city.trim() &&
          form.state.trim() &&
          mobileVerified
      ),
    [form, mobileVerified]
  );

  const completedSteps = useMemo(() => {
    let count = 0;
    if (form.name.trim() && form.email.trim()) count += 1;
    if (mobileVerified) count += 1;
    if (form.completeAddress.trim() && form.city.trim() && form.state.trim())
      count += 1;
    return count;
  }, [form, mobileVerified]);

  const updateField = (
    key: keyof Omit<DevoteeAccountForm, "profileImage">,
    value: string
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "mobileNumber") {
      setMobileVerified(false);
      setOtpSent(false);
      setOtp("");
    }
  };

  useEffect(() => {
    if (hasSubmitted && account) {
      onCreated(account);
    }
  }, [account, hasSubmitted, onCreated]);

  useEffect(() => {
    if (error) {
      Alert.alert("Account creation failed", error);
      dispatch(clearDevoteeAccountError());
    }
  }, [dispatch, error]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to upload a profile image."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ["images"],
      quality: 0.82,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setForm((current) => ({
      ...current,
      profileImage: {
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        uri: asset.uri,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      Alert.alert(
        "Missing information",
        "Please fill all required devotee details and verify your mobile number."
      );
      return;
    }
    setHasSubmitted(true);
    dispatch(createDevoteeAccountRequest(form));
  };

  const handleSendMobileOtp = async () => {
    if (!form.mobileNumber.trim()) {
      Alert.alert("Mobile required", "Please enter your mobile number first.");
      return;
    }
    try {
      setIsVerifyingMobile(true);
      await sendUserMobileOtp(form.mobileNumber);
      setOtpSent(true);
      Alert.alert("OTP sent", "Please enter the OTP sent to your mobile.");
    } catch (err) {
      Alert.alert(
        "OTP failed",
        err instanceof Error ? err.message : "Unable to send OTP."
      );
    } finally {
      setIsVerifyingMobile(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (!form.mobileNumber.trim() || !otp.trim()) {
      Alert.alert("OTP required", "Please enter mobile number and OTP.");
      return;
    }
    try {
      setIsVerifyingMobile(true);
      await verifyUserMobileOtp(form.mobileNumber, otp);
      setMobileVerified(true);
      Alert.alert("Mobile verified", "You can now create your account.");
    } catch (err) {
      Alert.alert(
        "Verification failed",
        err instanceof Error ? err.message : "Unable to verify OTP."
      );
    } finally {
      setIsVerifyingMobile(false);
    }
  };

  const progressPct = (completedSteps / 3) * 100;

  /* ═════════════════════════════════════════════════════════ */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <StatusBar backgroundColor={C.bg} barStyle="dark-content" />

      {/* ─── Sticky header ─── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <ChevronLeft color={C.maroon} size={22} strokeWidth={2.3} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.brand}>SAI FAMILY</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─── */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>Create your devotee account</Text>
          <Text style={styles.description}>
            Verify mobile, complete your profile, and receive your Sai Family
            member ID.
          </Text>
        </View>

        {/* ─── Progress strip ─── */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>YOUR PROGRESS</Text>
            <Text style={styles.progressCount}>{completedSteps} of 3</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progressPct}%` }]}
            />
          </View>
          <View style={styles.stepRow}>
            {[
              { label: "Details", done: completedSteps >= 1 },
              { label: "Mobile", done: mobileVerified },
              { label: "Address", done: completedSteps >= 3 },
            ].map((step, idx) => (
              <View key={step.label} style={styles.stepItem}>
                <View
                  style={[styles.stepDot, step.done && styles.stepDotDone]}
                >
                  {step.done ? (
                    <CheckCircle2 color="#FFFFFF" size={14} strokeWidth={2.4} />
                  ) : (
                    <Text style={styles.stepNumber}>{idx + 1}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    step.done && { color: C.green },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Profile image ─── */}
        <View style={styles.imageWrap}>
          <Pressable style={styles.imagePicker} onPress={pickImage}>
            {form.profileImage ? (
              <Image
                source={{ uri: form.profileImage.uri }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera color={C.saffron} size={28} strokeWidth={1.8} />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Camera color="#FFFFFF" size={13} strokeWidth={2.3} />
            </View>
          </Pressable>
          <Text style={styles.imageLabel}>
            {form.profileImage ? "Tap to change photo" : "Add profile photo"}
          </Text>
          <Text style={styles.imageSubLabel}>Optional</Text>
        </View>

        {/* ─── Security notice ─── */}
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Lock color={C.green} size={14} strokeWidth={2.3} />
          </View>
          <Text style={styles.securityText}>
            Mobile verification is required before your account is created.
          </Text>
        </View>

        {/* ─── Personal Information group ─── */}
        {renderGroup(FIELD_GROUPS[0], form, updateField)}

        {/* ─── Mobile Verification group ─── */}
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <View
              style={[styles.groupIcon, { backgroundColor: C.saffronBg }]}
            >
              <ShieldDot color={C.saffron} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupTitle}>Mobile Verification</Text>
              <Text style={styles.groupSubtitle}>
                Required to create your account
              </Text>
            </View>
            {mobileVerified ? (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 color={C.green} size={13} strokeWidth={2.3} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.groupBody}>
            <Text style={styles.label}>
              MOBILE NUMBER<Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              keyboardType="phone-pad"
              onChangeText={(v) => updateField("mobileNumber", v)}
              placeholder="+91 98765 43210"
              placeholderTextColor={C.inkTertiary}
              style={styles.input}
              value={form.mobileNumber}
              editable={!mobileVerified}
            />

            {!mobileVerified ? (
              <Pressable
                disabled={isVerifyingMobile}
                onPress={handleSendMobileOtp}
                style={({ pressed }) => [
                  styles.otpButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                {isVerifyingMobile && !otpSent ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.otpButtonText}>
                    {otpSent ? "Resend OTP" : "Send OTP"}
                  </Text>
                )}
              </Pressable>
            ) : null}

            {otpSent && !mobileVerified ? (
              <>
                <Text style={[styles.label, { marginTop: 6 }]}>
                  ONE-TIME PASSWORD<Text style={styles.required}> *</Text>
                </Text>
                <View style={styles.otpRow}>
                  <TextInput
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={setOtp}
                    placeholder="6-digit code"
                    placeholderTextColor={C.inkTertiary}
                    style={[styles.input, { flex: 1 }]}
                    value={otp}
                  />
                  <Pressable
                    disabled={isVerifyingMobile}
                    onPress={handleVerifyMobileOtp}
                    style={({ pressed }) => [
                      styles.verifyButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    {isVerifyingMobile ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.otpButtonText}>Verify</Text>
                    )}
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* ─── Address group ─── */}
        {renderGroup(FIELD_GROUPS[1], form, updateField)}

        {/* ─── Additional group ─── */}
        {renderGroup(FIELD_GROUPS[2], form, updateField)}

        <Text style={styles.footnote}>
          By creating an account, you agree to receive devotional updates from
          Sai Family. You can opt out anytime from settings.
        </Text>
      </ScrollView>

      {/* ─── Sticky submit ─── */}
      <View
        style={[
          styles.submitBar,
          { paddingBottom: insets.bottom + 14 },
        ]}
      >
        <Pressable
          disabled={!canSubmit || isSubmitting}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            (!canSubmit || isSubmitting) && styles.submitDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>
              {canSubmit ? "Create Account" : "Complete all fields to continue"}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ─── Helper: render a field group ───────────────────────── */
function renderGroup(
  group: FieldGroup,
  form: DevoteeAccountForm,
  updateField: (
    key: keyof Omit<DevoteeAccountForm, "profileImage">,
    value: string
  ) => void
) {
  const Icon = group.Icon;
  return (
    <View style={styles.groupCard} key={group.title}>
      <View style={styles.groupHeader}>
        <View style={[styles.groupIcon, { backgroundColor: group.iconBg }]}>
          <Icon color={group.iconColor} size={18} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          {group.subtitle ? (
            <Text style={styles.groupSubtitle}>{group.subtitle}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.groupBody}>
        {group.fields.map((field, idx) => (
          <View key={field.key}>
            <Text style={styles.label}>
              {field.label.toUpperCase()}
              {field.required ? (
                <Text style={styles.required}> *</Text>
              ) : null}
            </Text>
            <TextInput
              autoCapitalize={
                field.keyboardType === "email-address" ? "none" : "words"
              }
              keyboardType={field.keyboardType || "default"}
              multiline={field.multiline}
              onChangeText={(value) => updateField(field.key, value)}
              placeholder={field.placeholder || field.label}
              placeholderTextColor={C.inkTertiary}
              style={[styles.input, field.multiline && styles.textArea]}
              value={form[field.key]}
            />
            {idx < group.fields.length - 1 ? (
              <View style={{ height: 14 }} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/* Small green-dotted shield icon for verification group */
function ShieldDot({ color }: { color: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: color,
        borderRadius: 100,
        height: 18,
        justifyContent: "center",
        width: 18,
      }}
    >
      <Lock color="#FFFFFF" size={10} strokeWidth={2.5} />
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  root: { backgroundColor: C.bg, flex: 1 },

  /* Top bar */
  topBar: {
    alignItems: "center",
    backgroundColor: C.bg,
    borderBottomColor: C.separator,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  backText: { color: C.maroon, fontSize: 16, fontWeight: "500" },
  brand: {
    color: C.saffronText,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
  },

  content: { paddingHorizontal: 18, paddingTop: 18 },

  /* Hero */
  heroSection: { marginBottom: 18 },
  title: {
    color: C.ink,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  description: {
    color: C.inkSecondary,
    fontSize: 14.5,
    fontWeight: "400",
    lineHeight: 21,
    marginTop: 6,
  },

  /* Progress */
  progressCard: {
    backgroundColor: C.surface,
    borderColor: C.separator,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: {
    color: C.inkSecondary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  progressCount: {
    color: C.maroon,
    fontSize: 13,
    fontWeight: "700",
  },
  progressTrack: {
    backgroundColor: C.separatorSoft,
    borderRadius: 100,
    height: 5,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: C.green,
    borderRadius: 100,
    height: "100%",
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepItem: { alignItems: "center", flex: 1, gap: 5 },
  stepDot: {
    alignItems: "center",
    backgroundColor: C.separatorSoft,
    borderRadius: 100,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  stepDotDone: { backgroundColor: C.green },
  stepNumber: { color: C.inkSecondary, fontSize: 11, fontWeight: "700" },
  stepLabel: {
    color: C.inkSecondary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  /* Image */
  imageWrap: { alignItems: "center", marginBottom: 20 },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },
  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 56,
    borderStyle: "dashed",
    borderWidth: 1.5,
    height: 112,
    justifyContent: "center",
    width: 112,
  },
  profileImage: {
    borderColor: C.saffronBorder,
    borderRadius: 56,
    borderWidth: 2,
    height: 112,
    width: 112,
  },
  cameraBadge: {
    alignItems: "center",
    backgroundColor: C.maroon,
    borderColor: C.bg,
    borderRadius: 100,
    borderWidth: 3,
    bottom: -2,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 30,
  },
  imageLabel: {
    color: C.ink,
    fontSize: 13.5,
    fontWeight: "600",
  },
  imageSubLabel: {
    color: C.inkTertiary,
    fontSize: 11.5,
    fontWeight: "500",
    marginTop: 1,
  },

  /* Security card */
  securityCard: {
    alignItems: "center",
    backgroundColor: C.greenBg,
    borderColor: C.greenBorder,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    padding: 12,
  },
  securityIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  securityText: {
    color: "#166534",
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },

  /* Group card */
  groupCard: {
    backgroundColor: C.surface,
    borderColor: C.separator,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  groupHeader: {
    alignItems: "center",
    borderBottomColor: C.separator,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  groupIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  groupTitle: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  groupSubtitle: {
    color: C.inkSecondary,
    fontSize: 12.5,
    fontWeight: "400",
    marginTop: 1,
  },
  groupBody: { padding: 16, paddingTop: 14 },
  verifiedBadge: {
    alignItems: "center",
    backgroundColor: C.greenBg,
    borderRadius: 100,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    color: C.green,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  /* Inputs */
  label: {
    color: C.inkSecondary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  required: { color: C.saffron, fontWeight: "700" },
  input: {
    backgroundColor: "rgba(120,120,128,0.08)",
    borderColor: "transparent",
    borderRadius: 12,
    borderWidth: 1.2,
    color: C.ink,
    fontSize: 16,
    fontWeight: "500",
    minHeight: 50,
    paddingHorizontal: 14,
  },
  textArea: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  /* OTP */
  otpButton: {
    alignItems: "center",
    backgroundColor: C.saffron,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    marginTop: 12,
  },
  otpButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
  },
  verifyButton: {
    alignItems: "center",
    backgroundColor: C.maroon,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  /* Footer note */
  footnote: {
    color: C.inkSecondary,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 17,
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 4,
    textAlign: "center",
  },

  /* Press */
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  /* Submit bar */
  submitBar: {
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
  submitButton: {
    alignItems: "center",
    backgroundColor: C.maroon,
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
  },
  submitDisabled: {
    backgroundColor: C.inkTertiary,
    opacity: 0.7,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});