import { useSyncExternalStore } from "react";

import { apiClient } from "./api";
import { deleteGuestSession, readGuestSession, writeGuestSession } from "./guest-tokens";

/**
 * Guest mode on the phone: whether this device is exploring without an account.
 * Starting asks the backend for a guest account (POST /api/auth/guest) and keeps its tokens.
 */

type GuestState = { hydrated: boolean; guestId: string | null };

let state: GuestState = { guestId: null, hydrated: false };
const listeners = new Set<() => void>();

function set(next: GuestState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export async function hydrateGuestSession() {
  const saved = await readGuestSession();
  set({ guestId: saved?.guestId ?? null, hydrated: true });
}

export class GuestModeUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuestModeUnavailableError";
  }
}

export async function startGuestSession() {
  try {
    const { data } = await apiClient.post<{
      user: { id: string };
      tokens: { accessToken: string; refreshToken: string };
    }>("/api/auth/guest", {});
    await writeGuestSession({ guestId: data.user.id, tokens: data.tokens });
    set({ guestId: data.user.id, hydrated: true });
  } catch (error) {
    const response = (error as { response?: { status?: number; data?: { error?: { message?: string } } } })?.response;
    throw new GuestModeUnavailableError(
      response?.status === 404
        ? "Exploring without an account is not available yet. Please log in or create an account."
        : response?.data?.error?.message || "Could not start. Please check your connection and try again."
    );
  }
}

/** After a member logs in (the backend has moved the guest's Ask Sai history to the account). */
export async function endGuestSession() {
  await deleteGuestSession();
  set({ guestId: null, hydrated: true });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getState = () => state;

export function useGuestSession() {
  return useSyncExternalStore(subscribe, getState, getState);
}
