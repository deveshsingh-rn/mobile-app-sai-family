import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const DEVOTEE_ACCOUNT_STORAGE_KEY = "sai-family.devotee-account";

export type DevoteeAccountForm = {
  name: string;
  email: string;
  mobileNumber: string;
  completeAddress: string;
  pincode: string;
  occupation: string;
  city: string;
  state: string;
  country: string;
  language: string;
  profileImage?: {
    fileName?: string | null;
    mimeType?: string | null;
    uri: string;
  };
};

export type DevoteeAccount = DevoteeAccountForm & {
  id?: string;
  memberId: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CreateDevoteeAccountResponse = {
  account?: DevoteeAccount;
  message?: string;
};

const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:4000",
  default: "http://localhost:4000",
});

export async function createDevoteeAccount(form: DevoteeAccountForm) {
  const body = new FormData();

  body.append("name", form.name.trim());
  body.append("email", form.email.trim());
  body.append("mobileNumber", form.mobileNumber.trim());
  body.append("completeAddress", form.completeAddress.trim());
  body.append("pincode", form.pincode.trim());
  body.append("occupation", form.occupation.trim());
  body.append("city", form.city.trim());
  body.append("state", form.state.trim());
  body.append("country", form.country.trim());
  body.append("language", form.language.trim() || "en");

  if (form.profileImage) {
    const fileName = form.profileImage.fileName || `profile-${Date.now()}.jpg`;
    const type = form.profileImage.mimeType || "image/jpeg";

    body.append("profileImage", {
      name: fileName,
      type,
      uri: form.profileImage.uri,
    } as unknown as Blob);
  }

  const response = await fetch(`${API_BASE_URL}/accounts`, {
    method: "POST",
    body,
  });

  const json = (await response.json().catch(() => ({}))) as CreateDevoteeAccountResponse;

  if (!response.ok || !json.account) {
    throw new Error(json.message || "Unable to create devotee account.");
  }

  await saveDevoteeAccount(json.account);
  return json.account;
}

export async function saveDevoteeAccount(account: DevoteeAccount) {
  const isSecureStoreAvailable = await SecureStore.isAvailableAsync();

  if (!isSecureStoreAvailable) {
    return;
  }

  await SecureStore.setItemAsync(DEVOTEE_ACCOUNT_STORAGE_KEY, JSON.stringify(account));
}

export async function getSavedDevoteeAccount() {
  const isSecureStoreAvailable = await SecureStore.isAvailableAsync();

  if (!isSecureStoreAvailable) {
    return null;
  }

  const value = await SecureStore.getItemAsync(DEVOTEE_ACCOUNT_STORAGE_KEY);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as DevoteeAccount;
}
