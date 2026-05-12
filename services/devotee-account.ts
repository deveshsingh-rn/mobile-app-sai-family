import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Platform } from "react-native";

import { DevoteeAccount, DevoteeAccountForm } from "@/store/devotee-account/types";
import { apiClient } from "./api";

export const DEVOTEE_ACCOUNT_STORAGE_KEY = "sai-family.devotee-account";

type CreateDevoteeAccountResponse = {
  account?: DevoteeAccount;
  message?: string;
};

function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<CreateDevoteeAccountResponse>(error)) {
    return error.response?.data?.message || error.message || "Unable to create devotee account.";
  }

  return error instanceof Error ? error.message : "Unable to create devotee account.";
}

export async function createDevoteeAccount(
  form: DevoteeAccountForm
) {
  const body = new FormData();

  body.append("name", form.name.trim());
  body.append("email", form.email.trim());
  body.append(
    "mobileNumber",
    form.mobileNumber.trim()
  );
  body.append(
    "completeAddress",
    form.completeAddress.trim()
  );
  body.append("pincode", form.pincode.trim());
  body.append(
    "occupation",
    form.occupation.trim()
  );
  body.append("city", form.city.trim());
  body.append("state", form.state.trim());
  body.append("country", form.country.trim());
  body.append(
    "language",
    form.language.trim() || "en"
  );

  console.log(
    "PROFILE IMAGE =>",
    JSON.stringify(form.profileImage, null, 2)
  );

  if (
    form.profileImage?.uri &&
    form.profileImage.uri.length > 0
  ) {
    body.append("profileImage", {
      uri: form.profileImage.uri,
      name:
        form.profileImage.fileName ||
        `profile-${Date.now()}.jpg`,
      type:
        form.profileImage.mimeType ||
        "image/jpeg",
    } as any);
  }

  for (const pair of body.entries()) {
    console.log(
      "FORM DATA =>",
      pair[0],
      pair[1]
    );
  }

  try {
    const response =
      await apiClient.post<CreateDevoteeAccountResponse>(
        "/accounts",
        body
      );

    if (!response.data.account) {
      throw new Error(
        response.data.message ||
          "Unable to create devotee account."
      );
    }

    return response.data.account;
  } catch (error) {
    console.log(
      "BACKEND ERROR =>",
      JSON.stringify(
        axios.isAxiosError(error)
          ? error.response?.data
          : error,
        null,
        2
      )
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
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

export async function clearSavedDevoteeAccount() {
  const isSecureStoreAvailable = await SecureStore.isAvailableAsync();

  if (!isSecureStoreAvailable) {
    return;
  }

  await SecureStore.deleteItemAsync(DEVOTEE_ACCOUNT_STORAGE_KEY);
}

export async function updateDevoteeSettings(accountId: string, settings: Partial<DevoteeAccount>) {
  try {
    const response = await apiClient.patch<{ account: DevoteeAccount; message?: string }>(`/accounts/${accountId}/settings`, settings);

    if (!response.data.account) {
      throw new Error(response.data.message || "Unable to update settings.");
    }

    return response.data.account;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}


export async function removeDevoteeAccountStorage() {
  const isSecureStoreAvailable = await SecureStore.isAvailableAsync();

  if (!isSecureStoreAvailable) {
    return;
  }

  await SecureStore.deleteItemAsync(
    DEVOTEE_ACCOUNT_STORAGE_KEY
  );
}