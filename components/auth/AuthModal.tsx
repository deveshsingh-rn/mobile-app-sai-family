import React from "react";
import { Modal } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AuthScreen from "@/screens/authscreen";
import CreateDevoteeAccountScreen from "@/screens/create-devotee-account-screen";
import { trackProductEvent } from "@/services/product-analytics";
import { closeAuth, openAuth, useLoginPrompt } from "@/services/login-prompt";

/**
 * Guest mode: the existing login / create-account screens, opened over whatever the guest was
 * looking at. When the login succeeds the root layout sees the member account and closes this,
 * so the devotee is back on the same screen, now signed in.
 */
export function AuthModal() {
  const { authMode } = useLoginPrompt();

  return (
    <Modal animationType="slide" onRequestClose={closeAuth} presentationStyle="fullScreen" visible={authMode !== null}>
      {/* A Modal is a separate native window: it needs its own safe-area context. */}
      <SafeAreaProvider>
        {authMode === "create" ? (
          <CreateDevoteeAccountScreen
            onBack={() => openAuth("login")}
            onCreated={(account) => {
              void trackProductEvent("Account Created", { from_guest: true, has_profile_image: Boolean(account.profileImageUrl) });
              closeAuth();
            }}
          />
        ) : (
          <AuthScreen
            guestLabel="Continue without logging in"
            onContinue={closeAuth}
            onContinueAsGuest={closeAuth}
            onCreateAccount={() => openAuth("create")}
          />
        )}
      </SafeAreaProvider>
    </Modal>
  );
}
