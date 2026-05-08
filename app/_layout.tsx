import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DevoteeAccount, getSavedDevoteeAccount } from '@/services/devotee-account';
import AuthScreen from '@/screens/authscreen';
import CreateDevoteeAccountScreen from '@/screens/create-devotee-account-screen';
import DevoteeProfileScreen from '@/screens/devotee-profile-screen';
import OnboardingScreen from '@/screens/onboarding';
import SaiBabaSplashScreen from '@/screens/splashscreen';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showAuth, setShowAuth] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showDevoteeProfile, setShowDevoteeProfile] = useState(false);
  const [devoteeAccount, setDevoteeAccount] = useState<DevoteeAccount | null>(null);

  useEffect(() => {
    getSavedDevoteeAccount().then((account) => {
      if (account) {
        setDevoteeAccount(account);
        setShowOnboarding(false);
        setShowAuth(false);
        setShowDevoteeProfile(false);
      }
    });
  }, []);

  if (showSplash) {
    return <SaiBabaSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;
  }

  if (devoteeAccount && showDevoteeProfile) {
    return <DevoteeProfileScreen account={devoteeAccount} onContinue={() => setShowDevoteeProfile(false)} />;
  }

  if (showCreateAccount) {
    return (
      <CreateDevoteeAccountScreen
        onBack={() => setShowCreateAccount(false)}
        onCreated={(account) => {
          setDevoteeAccount(account);
          setShowCreateAccount(false);
          setShowAuth(false);
          setShowDevoteeProfile(true);
        }}
      />
    );
  }

  if (showAuth) {
    return (
      <AuthScreen
        onContinue={() => setShowAuth(false)}
        onCreateAccount={() => setShowCreateAccount(true)}
      />
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
