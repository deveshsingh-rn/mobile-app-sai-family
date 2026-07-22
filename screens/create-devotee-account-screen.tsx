import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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
  Check,
  ChevronDown,
  ChevronLeft,
  Lock,
  MapPin,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react-native";

import {
  loginUserWithMobilePin,
  sendUserMobileOtp,
  setupUserMobilePin,
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

type Country = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

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
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
];

const DEFAULT_COUNTRY = COUNTRIES[0];

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

function CountryPickerModal({
  visible,
  selectedCode,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedCode: string;
  onClose: () => void;
  onSelect: (country: Country) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filteredCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return COUNTRIES;
    }

    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(normalizedQuery) ||
        country.code.toLowerCase().includes(normalizedQuery) ||
        country.dialCode.includes(normalizedQuery)
    );
  }, [query]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropTouch} onPress={handleClose} />
        <View
          style={[
            styles.modalSheet,
            { paddingBottom: insets.bottom + 8 },
          ]}
        >
          <View style={styles.modalGrabber} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select country</Text>
            <Pressable
              hitSlop={10}
              onPress={handleClose}
              style={styles.modalCloseButton}
            >
              <X color={C.inkSecondary} size={15} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View style={styles.countrySearchBox}>
            <Search color={C.inkSecondary} size={16} strokeWidth={2} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search country or code"
              placeholderTextColor={C.inkTertiary}
              returnKeyType="done"
              style={styles.countrySearchInput}
              value={query}
            />
          </View>

          <FlatList
            data={filteredCountries}
            ItemSeparatorComponent={() => (
              <View style={styles.countrySeparator} />
            )}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.code}
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
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryDial}>{item.dialCode}</Text>
                  </View>
                  {isSelected ? (
                    <View style={styles.countryCheck}>
                      <Check color="#FFFFFF" size={12} strokeWidth={2.6} />
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
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(DEFAULT_COUNTRY);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mobilePin, setMobilePin] = useState("");
  const [confirmMobilePin, setConfirmMobilePin] = useState("");
  const [pinMode, setPinMode] = useState<"login" | "setup">("setup");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);
  const sanitizedMobileNumber = form.mobileNumber.replace(/\D/g, "");
  const fullMobileNumber = `${selectedCountry.dialCode}${sanitizedMobileNumber}`;
  const isIndiaMobile = fullMobileNumber.startsWith("+91");

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
      setMobilePin("");
      setConfirmMobilePin("");
    }
  };

  const resetMobileVerification = () => {
    setMobileVerified(false);
    setOtpSent(false);
    setOtp("");
    setMobilePin("");
    setConfirmMobilePin("");
    setPinMode("setup");
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setForm((current) => ({
      ...current,
      country: country.name,
      mobileNumber: "",
    }));
    resetMobileVerification();
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
    dispatch(
      createDevoteeAccountRequest({
        ...form,
        country: form.country || selectedCountry.name,
        mobileNumber: fullMobileNumber,
      })
    );
  };

  const handleSendMobileOtp = async () => {
    if (!sanitizedMobileNumber) {
      Alert.alert("Mobile required", "Please enter your mobile number first.");
      return;
    }
    try {
      setIsVerifyingMobile(true);
      await sendUserMobileOtp(fullMobileNumber);
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
    if (!sanitizedMobileNumber || !otp.trim()) {
      Alert.alert("OTP required", "Please enter mobile number and OTP.");
      return;
    }
    try {
      setIsVerifyingMobile(true);
      await verifyUserMobileOtp(fullMobileNumber, otp);
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

  const validateMobilePin = () => {
    if (!sanitizedMobileNumber) {
      Alert.alert("Mobile required", "Please enter your mobile number first.");
      return false;
    }

    if (!/^\d{6}$/.test(mobilePin.trim())) {
      Alert.alert(
        "PIN required",
        "Please enter a secure 6 digit mobile PIN."
      );
      return false;
    }

    if (
      pinMode === "setup" &&
      mobilePin.trim() !== confirmMobilePin.trim()
    ) {
      Alert.alert(
        "PIN does not match",
        "Please enter the same PIN in both fields."
      );
      return false;
    }

    return true;
  };

  const handleMobilePinSubmit = async () => {
    if (!validateMobilePin()) {
      return;
    }

    try {
      setIsVerifyingMobile(true);
      if (pinMode === "setup") {
        await setupUserMobilePin(fullMobileNumber, mobilePin);
      } else {
        await loginUserWithMobilePin(fullMobileNumber, mobilePin);
      }

      setMobileVerified(true);
      Alert.alert("Mobile verified", "You can now create your account.");
    } catch (err) {
      Alert.alert(
        pinMode === "setup" ? "PIN setup failed" : "PIN login failed",
        err instanceof Error
          ? err.message
          : "Unable to verify mobile PIN."
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
            <View style={styles.phoneInputWrap}>
              <Pressable
                disabled={mobileVerified}
                onPress={() => setShowCountryPicker(true)}
                style={({ pressed }) => [
                  styles.countryPill,
                  pressed && styles.buttonPressed,
                  mobileVerified && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.countryPillFlag}>
                  {selectedCountry.flag}
                </Text>
                <Text style={styles.countryPillCode}>
                  {selectedCountry.dialCode}
                </Text>
                <ChevronDown
                  color={C.inkSecondary}
                  size={13}
                  strokeWidth={2.2}
                />
              </Pressable>
              <View style={styles.phoneDivider} />
              <TextInput
                editable={!mobileVerified}
                keyboardType="phone-pad"
                maxLength={15}
                onChangeText={(v) => updateField("mobileNumber", v)}
                placeholder="98765 43210"
                placeholderTextColor={C.inkTertiary}
                returnKeyType="done"
                style={styles.phoneInput}
                value={form.mobileNumber}
              />
            </View>

            <Text style={styles.mobileHint}>
              {isIndiaMobile
                ? "India numbers verify with OTP."
                : "Non-India numbers verify with a secure 6 digit PIN."}
            </Text>

            {!mobileVerified && isIndiaMobile ? (
              <>
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

                {otpSent ? (
                  <>
                    <Text style={[styles.label, { marginTop: 12 }]}>
                      ONE-TIME PASSWORD<Text style={styles.required}> *</Text>
                    </Text>
                    <View style={styles.otpRow}>
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={6}
                        onChangeText={setOtp}
                        placeholder="6-digit code"
                        placeholderTextColor={C.inkTertiary}
                        returnKeyType="done"
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
              </>
            ) : null}

            {!mobileVerified && !isIndiaMobile ? (
              <View style={styles.pinPanel}>
                <View style={styles.pinModeRow}>
                  {(["setup", "login"] as const).map((mode) => {
                    const activePinMode = pinMode === mode;

                    return (
                      <Pressable
                        key={mode}
                        onPress={() => {
                          setPinMode(mode);
                          setMobilePin("");
                          setConfirmMobilePin("");
                        }}
                        style={[
                          styles.pinModeButton,
                          activePinMode && styles.pinModeButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pinModeText,
                            activePinMode && styles.pinModeTextActive,
                          ]}
                        >
                          {mode === "setup" ? "Create PIN" : "I have PIN"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.label}>
                  {pinMode === "setup"
                    ? "CREATE 6 DIGIT PIN"
                    : "ENTER 6 DIGIT PIN"}
                  <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={setMobilePin}
                  placeholder="123456"
                  placeholderTextColor={C.inkTertiary}
                  returnKeyType="done"
                  secureTextEntry
                  style={styles.input}
                  value={mobilePin}
                />

                {pinMode === "setup" ? (
                  <>
                    <Text style={styles.label}>
                      CONFIRM PIN<Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      keyboardType="number-pad"
                      maxLength={6}
                      onChangeText={setConfirmMobilePin}
                      placeholder="Re-enter PIN"
                      placeholderTextColor={C.inkTertiary}
                      returnKeyType="done"
                      secureTextEntry
                      style={styles.input}
                      value={confirmMobilePin}
                    />
                  </>
                ) : null}

                <Pressable
                  disabled={isVerifyingMobile}
                  onPress={handleMobilePinSubmit}
                  style={({ pressed }) => [
                    styles.otpButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  {isVerifyingMobile ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.otpButtonText}>
                      {pinMode === "setup"
                        ? "Create PIN & Verify"
                        : "Verify PIN"}
                    </Text>
                  )}
                </Pressable>
              </View>
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

      <CountryPickerModal
        onClose={() => setShowCountryPicker(false)}
        onSelect={handleCountrySelect}
        selectedCode={selectedCountry.code}
        visible={showCountryPicker}
      />
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
  phoneInputWrap: {
    alignItems: "center",
    backgroundColor: "rgba(120,120,128,0.08)",
    borderRadius: 12,
    flexDirection: "row",
    minHeight: 50,
    overflow: "hidden",
  },
  countryPill: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  countryPillFlag: {
    fontSize: 18,
  },
  countryPillCode: {
    color: C.ink,
    fontSize: 15,
    fontWeight: "700",
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
    minHeight: 50,
    paddingHorizontal: 14,
  },
  mobileHint: {
    color: C.inkSecondary,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    marginTop: 8,
  },
  pinPanel: {
    backgroundColor: C.saffronBg,
    borderColor: C.saffronBorder,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
    padding: 12,
  },
  pinModeRow: {
    backgroundColor: "rgba(194,65,12,0.1)",
    borderRadius: 12,
    flexDirection: "row",
    padding: 3,
  },
  pinModeButton: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  pinModeButtonActive: {
    backgroundColor: C.surface,
    shadowColor: "#7C2D12",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  pinModeText: {
    color: C.saffronText,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  pinModeTextActive: {
    color: C.ink,
    fontWeight: "700",
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
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.32)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "78%",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  modalGrabber: {
    alignSelf: "center",
    backgroundColor: C.separator,
    borderRadius: 100,
    height: 5,
    marginBottom: 14,
    width: 42,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "700",
  },
  modalCloseButton: {
    alignItems: "center",
    backgroundColor: "rgba(120,120,128,0.1)",
    borderRadius: 100,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  countrySearchBox: {
    alignItems: "center",
    backgroundColor: "rgba(120,120,128,0.08)",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  countrySearchInput: {
    color: C.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  countrySeparator: {
    backgroundColor: C.separator,
    height: 1,
    marginLeft: 52,
  },
  countryRow: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  countryRowSelected: {
    backgroundColor: C.saffronBg,
  },
  countryRowPressed: {
    opacity: 0.75,
  },
  countryFlag: {
    fontSize: 24,
    width: 30,
  },
  countryName: {
    color: C.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  countryDial: {
    color: C.inkSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  countryCheck: {
    alignItems: "center",
    backgroundColor: C.saffron,
    borderRadius: 100,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
});
