import * as SecureStore from "expo-secure-store";
import axios from "axios";

import { DevoteeAccount } from "@/store/devotee-account/types";
import { apiClient } from "./api";

export const AUTH_SESSION_STORAGE_KEY = "sai-family.auth-session";

export type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
};

export type AuthSession = {
  tokens?: AuthTokens;
  user?: any;
};

type AuthResponse = AuthSession & {
  message?: string;
};

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<any>(error)) {
    return (
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      fallback
    );
  }

  return error instanceof Error ? error.message : fallback;
}

function isRouteNotFound(error: unknown) {
  return (
    axios.isAxiosError<any>(error) &&
    error.response?.status === 404 &&
    error.response?.data?.error?.code === "NOT_FOUND"
  );
}

async function postWithLegacyRouteFallback<TResponse>(
  primaryRoute: string,
  legacyRoute: string,
  body: Record<string, string>
) {
  try {
    const { data } = await apiClient.post<TResponse>(
      primaryRoute,
      body
    );

    return data;
  } catch (error) {
    if (!isRouteNotFound(error)) {
      throw error;
    }

    const { data } = await apiClient.post<TResponse>(
      legacyRoute,
      body
    );

    return data;
  }
}

export function authUserToDevoteeAccount(user: any): DevoteeAccount {
  const profile = user?.profile || {};

  return {
    ...user,
    authorId: user?.id || user?.authorId,
    city: profile.city || user?.city || "",
    completeAddress:
      profile.completeAddress || user?.completeAddress || "",
    country: profile.country || user?.country || "",
    email: user?.email || "",
    language: profile.language || user?.language || "en",
    location:
      [profile.city, profile.state, profile.country]
        .filter(Boolean)
        .join(", ") || user?.location || "",
    memberId: user?.memberId || user?.id || "",
    mobileNumber: user?.mobileNumber || "",
    name: user?.name || profile.name || "Sai Devotee",
    occupation: profile.occupation || user?.occupation || "",
    pincode: profile.pincode || user?.pincode || "",
    profile,
    profileImageUrl:
      user?.profileImageUrl || profile.profileImageUrl,
    state: profile.state || user?.state || "",
  };
}

export async function saveAuthSession(session: AuthSession) {
  const isAvailable = await SecureStore.isAvailableAsync();

  if (!isAvailable) {
    return;
  }

  await SecureStore.setItemAsync(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify(session)
  );
}

export async function getSavedAuthSession() {
  const isAvailable = await SecureStore.isAvailableAsync();

  if (!isAvailable) {
    return null;
  }

  const value = await SecureStore.getItemAsync(
    AUTH_SESSION_STORAGE_KEY
  );

  return value ? (JSON.parse(value) as AuthSession) : null;
}

export async function clearAuthSession() {
  const isAvailable = await SecureStore.isAvailableAsync();

  if (!isAvailable) {
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_SESSION_STORAGE_KEY);
}

export async function sendUserMobileOtp(mobileNumber: string) {
  try {
    const data = await postWithLegacyRouteFallback(
      "/api/auth/mobile/send-otp",
      "/api/auth/user/mobile/send-otp",
      { mobileNumber: mobileNumber.trim() }
    );

    return data;
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, "Unable to send mobile OTP.")
    );
  }
}

export async function verifyUserMobileOtp(
  mobileNumber: string,
  otp: string
) {
  try {
    const data = await postWithLegacyRouteFallback<AuthResponse>(
      "/api/auth/mobile/verify-otp",
      "/api/auth/user/mobile/verify-otp",
      {
        mobileNumber: mobileNumber.trim(),
        otp: otp.trim(),
      }
    );

    await saveAuthSession(data);

    return data;
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, "Unable to verify mobile OTP.")
    );
  }
}

export async function loginUserWithEmail(
  email: string,
  password: string
) {
  try {
    const { data } = await apiClient.post<AuthResponse>(
      "/api/auth/user/email/login",
      {
        email: email.trim().toLowerCase(),
        password,
      }
    );

    await saveAuthSession(data);

    return data;
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, "Unable to login with email.")
    );
  }
}

export async function setupUserEmailPassword(
  email: string,
  password: string
) {
  try {
    const { data } = await apiClient.post(
      "/api/auth/user/email/setup-password",
      {
        email: email.trim().toLowerCase(),
        password,
      }
    );

    return data;
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, "Unable to setup email password.")
    );
  }
}

export async function verifyUserEmail(email: string, otp: string) {
  try {
    const { data } = await apiClient.post<AuthResponse>(
      "/api/auth/user/email/verify",
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      }
    );

    await saveAuthSession(data);

    return data;
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, "Unable to verify email.")
    );
  }
}

export async function resendUserEmailVerification(email: string) {
  try {
    const { data } = await apiClient.post(
      "/api/auth/user/email/resend-verification",
      { email: email.trim().toLowerCase() }
    );

    return data;
  } catch (error) {
    throw new Error(
      getAuthErrorMessage(error, "Unable to resend verification code.")
    );
  }
}
