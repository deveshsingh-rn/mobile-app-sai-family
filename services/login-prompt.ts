import { useSyncExternalStore } from "react";

import type { AccountAction } from "@/utils/login-prompt";

/**
 * Guest mode: the "log in to continue" sheet and the login screen opened over the current screen.
 *
 *   if (!requireAccount("like")) return;   // guests see the sheet, members continue
 *
 * The API client also opens the sheet when the backend answers ACCOUNT_REQUIRED, so an action that
 * was missed here still ends in the sheet instead of an error.
 * No imports from the API client or the store (both import this module).
 */

export type AuthMode = "login" | "create";
type State = { promptAction: AccountAction | null; authMode: AuthMode | null };

let state: State = { promptAction: null, authMode: null };
/** Kept in sync by the root layout: true when a member account is signed in. */
let memberSignedIn = false;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function setMemberSignedIn(value: boolean) {
  memberSignedIn = value;
  if (value && (state.promptAction || state.authMode)) set({ authMode: null, promptAction: null });
}

export const isMemberSignedIn = () => memberSignedIn;

/** Shows the sheet for `action`. Ignored while the login screen is already open. */
export function promptLogin(action: AccountAction = "default") {
  if (memberSignedIn || state.authMode) return;
  set({ promptAction: action });
}

/** True for a signed-in member. For a guest: opens the sheet and returns false. */
export function requireAccount(action: AccountAction = "default") {
  if (memberSignedIn) return true;
  promptLogin(action);
  return false;
}

export const dismissLoginPrompt = () => set({ promptAction: null });

export function openAuth(mode: AuthMode) {
  set({ authMode: mode, promptAction: null });
}

export const closeAuth = () => set({ authMode: null });

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getState = () => state;

export function useLoginPrompt() {
  return useSyncExternalStore(subscribe, getState, getState);
}
