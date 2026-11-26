import * as SecureStore from "expo-secure-store";

/**
 * Guest-mode tokens on the phone. Kept apart from a member's login ("sai-family.auth-session"),
 * so logging out of an account never brings back an old guest by accident.
 * No imports from the API client: api.ts reads these on every request.
 */
export const GUEST_SESSION_STORAGE_KEY = "sai-family.guest-session";

export type GuestTokens = { accessToken?: string; refreshToken?: string };
export type StoredGuestSession = { guestId: string; tokens: GuestTokens };

export async function readGuestSession(): Promise<StoredGuestSession | null> {
  try {
    if (!(await SecureStore.isAvailableAsync())) return null;
    const raw = await SecureStore.getItemAsync(GUEST_SESSION_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredGuestSession) : null;
    return parsed?.guestId ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeGuestSession(session: StoredGuestSession) {
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(GUEST_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function deleteGuestSession() {
  try {
    if (await SecureStore.isAvailableAsync()) await SecureStore.deleteItemAsync(GUEST_SESSION_STORAGE_KEY);
  } catch {
    // Nothing to remove.
  }
}
