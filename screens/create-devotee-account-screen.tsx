import { useMemo, useState } from "react";
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
  DevoteeAccount,
  DevoteeAccountForm,
  createDevoteeAccount,
} from "@/services/devotee-account";

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
  const [form, setForm] = useState<DevoteeAccountForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      form.name.trim() &&
      form.email.trim() &&
      form.mobileNumber.trim() &&
      form.completeAddress.trim() &&
      form.pincode.trim() &&
      form.city.trim() &&
      form.state.trim(),
    [form]
  );

  const updateField = (key: keyof Omit<DevoteeAccountForm, "profileImage">, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

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
      Alert.alert("Missing information", "Please fill all required devotee details.");
      return;
    }

    try {
      setIsSubmitting(true);
      const account = await createDevoteeAccount(form);
      onCreated(account);
    } catch (error) {
      Alert.alert("Account creation failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <Text style={styles.brand}>SAI FAMILY</Text>
        </View>

        <Text style={styles.title}>Create Devotee Account</Text>
        <Text style={styles.description}>Enter your details to receive your Sai Family member ID.</Text>

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
          {FIELDS.map((field) => (
            <View key={field.key} style={styles.field}>
              <Text style={styles.label}>{field.label}</Text>
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
          {isSubmitting ? <ActivityIndicator color="#fffaf0" /> : <Text style={styles.submitText}>Submit Account</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf0",
  },
  content: {
    paddingBottom: 42,
    paddingHorizontal: 24,
    paddingTop: 58,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  back: {
    color: "#8e5d10",
    fontSize: 15,
    fontWeight: "800",
  },
  brand: {
    color: "#6d4810",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
  },
  title: {
    color: "#4e3309",
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 38,
  },
  description: {
    color: "#79571b",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 23,
    marginTop: 10,
  },
  imagePicker: {
    alignSelf: "center",
    marginBottom: 28,
    marginTop: 28,
  },
  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#d9bd7a",
    borderRadius: 70,
    borderStyle: "dashed",
    borderWidth: 1.4,
    height: 140,
    justifyContent: "center",
    width: 140,
  },
  imageText: {
    color: "#8e5d10",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 18,
    textAlign: "center",
  },
  profileImage: {
    borderColor: "#d9bd7a",
    borderRadius: 70,
    borderWidth: 2,
    height: 140,
    width: 140,
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 7,
  },
  label: {
    color: "#6d4810",
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 8,
    borderWidth: 1,
    color: "#3f2b0c",
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 13,
    textAlignVertical: "top",
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#8e5d10",
    borderRadius: 8,
    height: 54,
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
    fontSize: 16,
    fontWeight: "800",
  },
});
