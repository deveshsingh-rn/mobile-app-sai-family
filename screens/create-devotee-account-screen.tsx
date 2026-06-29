import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  CheckCircle2,
  ShieldCheck,
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
import { DevoteeAccount, DevoteeAccountForm } from "@/store/devotee-account/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

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

type CreateDevoteeAccountScreenProps = {
  onBack: () => void;
  onCreated: (account: DevoteeAccount) => void;
};

type FieldConfig = {
  key: keyof Omit<DevoteeAccountForm, "profileImage">;
  label: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  multiline?: boolean;
};

const FIELDS: FieldConfig[] = [
  { key: "name", label: "Full name" },
  { key: "email", label: "Email", keyboardType: "email-address" },
  { key: "mobileNumber", label: "Mobile number", keyboardType: "phone-pad" },
  { key: "completeAddress", label: "Complete address", multiline: true },
  { key: "pincode", label: "Pincode", keyboardType: "number-pad" },
  { key: "occupation", label: "Occupation" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "country", label: "Country" },
  { key: "language", label: "Language code" },
];

export default function CreateDevoteeAccountScreen({ onBack, onCreated }: CreateDevoteeAccountScreenProps) {
  const dispatch = useAppDispatch();
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
    if (form.completeAddress.trim() && form.city.trim() && form.state.trim()) count += 1;

    return count;
  }, [form, mobileVerified]);

  const updateField = (key: keyof Omit<DevoteeAccountForm, "profileImage">, value: string) => {
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
      Alert.alert("Permission needed", "Please allow photo access to upload a profile image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ["images"],
      quality: 0.82,
    });

    if (result.canceled) {
      return;
    }

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
      Alert.alert("Missing information", "Please fill all required devotee details and verify your mobile number.");
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
    } catch (error) {
      Alert.alert("OTP failed", error instanceof Error ? error.message : "Unable to send OTP.");
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
    } catch (error) {
      Alert.alert("Verification failed", error instanceof Error ? error.message : "Unable to verify OTP.");
    } finally {
      setIsVerifyingMobile(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <Text style={styles.brand}>SAI FAMILY</Text>
        </View>

        <View style={styles.heroPanel}>
          <View style={styles.heroIcon}>
            <UserRound color="#8e5d10" size={26} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Create Devotee Account</Text>
            <Text style={styles.description}>
              Verify mobile, complete profile, and receive your Sai Family member ID.
            </Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          {[
            { label: "Details", done: completedSteps >= 1 },
            { label: "Mobile OTP", done: mobileVerified },
            { label: "Profile", done: completedSteps >= 3 },
          ].map((step, index) => (
            <View key={step.label} style={styles.stepItem}>
              <View style={[styles.stepDot, step.done && styles.stepDotDone]}>
                {step.done ? (
                  <CheckCircle2 color="#FFFFFF" size={15} />
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.imagePicker} onPress={pickImage}>
          {form.profileImage ? (
            <Image source={{ uri: form.profileImage.uri }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>Upload profile image</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.form}>
          <View style={styles.securityCard}>
            <ShieldCheck color="#15803d" size={22} />
            <Text style={styles.securityText}>
              Mobile verification is required before account creation.
            </Text>
          </View>
          {FIELDS.map((field) => (
            <View key={field.key} style={styles.field}>
              <Text style={styles.label}>
                {field.label}
                {["name", "email", "mobileNumber", "completeAddress", "pincode", "city", "state"].includes(field.key) ? (
                  <Text style={styles.required}> *</Text>
                ) : null}
              </Text>
              <TextInput
                autoCapitalize={field.keyboardType === "email-address" ? "none" : "words"}
                keyboardType={field.keyboardType || "default"}
                multiline={field.multiline}
                onChangeText={(value) => updateField(field.key, value)}
                placeholder={field.label}
                placeholderTextColor="#b79b61"
                style={[styles.input, field.multiline && styles.textArea]}
                value={form[field.key]}
              />
              {field.key === "mobileNumber" ? (
                <View style={styles.otpBox}>
                  <Pressable
                    disabled={isVerifyingMobile || mobileVerified}
                    onPress={handleSendMobileOtp}
                    style={[
                      styles.otpButton,
                      mobileVerified && styles.otpButtonVerified,
                    ]}
                  >
                    {isVerifyingMobile && !otpSent ? (
                      <ActivityIndicator color="#fffaf0" />
                    ) : (
                      <Text style={styles.otpButtonText}>
                        {mobileVerified ? "Mobile Verified" : otpSent ? "Resend OTP" : "Send OTP"}
                      </Text>
                    )}
                  </Pressable>
                  {otpSent && !mobileVerified ? (
                    <View style={styles.otpRow}>
                      <TextInput
                        keyboardType="number-pad"
                        onChangeText={setOtp}
                        placeholder="OTP"
                        placeholderTextColor="#b79b61"
                        style={[styles.input, styles.otpInput]}
                        value={otp}
                      />
                      <Pressable
                        disabled={isVerifyingMobile}
                        onPress={handleVerifyMobileOtp}
                        style={styles.verifyButton}
                      >
                        {isVerifyingMobile ? (
                          <ActivityIndicator color="#fffaf0" />
                        ) : (
                          <Text style={styles.otpButtonText}>Verify</Text>
                        )}
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <Pressable
          disabled={!canSubmit || isSubmitting}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            (!canSubmit || isSubmitting) && styles.submitDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          {isSubmitting ? <ActivityIndicator color="#fffaf0" /> : <Text style={styles.submitText}>Create Account</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },
  content: {
    paddingBottom: 46,
    paddingHorizontal: 18,
    paddingTop: 54,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  back: {
    color: "#2B1308",
    fontSize: 15,
    fontWeight: "900",
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  brand: {
    color: "#6d4810",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
  },
  title: {
    color: "#2B1308",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 34,
  },
  description: {
    color: "#6B5B47",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 23,
    marginTop: 7,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 18,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  heroPanel: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
    shadowColor: "#7C2D12",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  imagePicker: {
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#d9bd7a",
    borderRadius: 62,
    borderStyle: "dashed",
    borderWidth: 1.4,
    height: 124,
    justifyContent: "center",
    width: 124,
  },
  imageText: {
    color: "#8e5d10",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 18,
    textAlign: "center",
  },
  otpBox: {
    marginTop: 10,
  },
  otpButton: {
    alignItems: "center",
    backgroundColor: "#8e5d10",
    borderRadius: 16,
    height: 50,
    justifyContent: "center",
  },
  otpButtonText: {
    color: "#fffaf0",
    fontSize: 14,
    fontWeight: "900",
  },
  otpButtonVerified: {
    backgroundColor: "#15803d",
  },
  otpInput: {
    flex: 1,
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  verifyButton: {
    alignItems: "center",
    backgroundColor: "#4e3309",
    borderRadius: 16,
    height: 54,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  profileImage: {
    borderColor: "#d9bd7a",
    borderRadius: 62,
    borderWidth: 2,
    height: 124,
    width: 124,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    color: "#44403C",
    fontSize: 14,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "#FAFAF9",
    borderColor: "#D6C5A8",
    borderRadius: 16,
    borderWidth: 1.2,
    color: "#2B1308",
    fontSize: 16,
    fontWeight: "700",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  required: {
    color: "#C2410C",
  },
  securityCard: {
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  securityText: {
    color: "#166534",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  stepDot: {
    alignItems: "center",
    backgroundColor: "#E7D7BE",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  stepDotDone: {
    backgroundColor: "#15803d",
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
    gap: 7,
  },
  stepLabel: {
    color: "#57534E",
    fontSize: 12,
    fontWeight: "900",
  },
  stepNumber: {
    color: "#2B1308",
    fontSize: 13,
    fontWeight: "900",
  },
  stepRow: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    padding: 14,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 13,
    textAlignVertical: "top",
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#2B1308",
    borderRadius: 18,
    height: 58,
    justifyContent: "center",
    marginTop: 28,
  },
  submitDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  submitText: {
    color: "#fffaf0",
    fontSize: 17,
    fontWeight: "900",
  },
});
