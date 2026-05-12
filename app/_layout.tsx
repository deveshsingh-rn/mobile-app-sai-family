import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthScreen from '@/screens/authscreen';
import CreateDevoteeAccountScreen from '@/screens/create-devotee-account-screen';
import DevoteeProfileScreen from '@/screens/devotee-profile-screen';
import OnboardingScreen from '@/screens/onboarding';
import SaiBabaSplashScreen from '@/screens/splashscreen';
import { loadSavedDevoteeAccountRequest } from '@/store/devotee-account/actions';
import {
  selectDevoteeAccount,
  selectHasHydratedDevoteeAccount,
} from '@/store/devotee-account/selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const devoteeAccount = useAppSelector(selectDevoteeAccount);
  const hasHydratedDevoteeAccount = useAppSelector(selectHasHydratedDevoteeAccount);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showAuth, setShowAuth] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showDevoteeProfile, setShowDevoteeProfile] = useState(false);

  useEffect(() => {
    dispatch(loadSavedDevoteeAccountRequest());
  }, [dispatch]);

  useEffect(() => {
    if (hasHydratedDevoteeAccount) {
      if (devoteeAccount) {
        setShowOnboarding(false);
        setShowAuth(false);
        setShowDevoteeProfile(false);
      } else {
        // User has logged out, so we need to force the Auth screen to show again
        setShowAuth(true);
      }
    }
  }, [devoteeAccount, hasHydratedDevoteeAccount]);

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

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppLayoutContent />
    </Provider>
  );
}
