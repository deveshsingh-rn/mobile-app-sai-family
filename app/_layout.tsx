import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
import { registerPushTokenRequest } from '@/store/notifications/actions';
import { selectPushToken } from '@/store/notifications/selectors';
import { store } from '@/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const devoteeAccount = useAppSelector(selectDevoteeAccount);
  const hasHydratedDevoteeAccount = useAppSelector(selectHasHydratedDevoteeAccount);
  const pushToken = useAppSelector(selectPushToken);
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
        setShowCreateAccount(false);
      } else {
        // User has logged out, so we need to force the Auth screen to show again
        setShowAuth(true);
      }
    }
  }, [devoteeAccount, hasHydratedDevoteeAccount]);

  useEffect(() => {
    const userId = devoteeAccount?.id || devoteeAccount?.authorId;

    if (
      hasHydratedDevoteeAccount &&
      userId &&
      !pushToken
    ) {
      dispatch(registerPushTokenRequest(userId));
    }
  }, [
    devoteeAccount?.authorId,
    devoteeAccount?.id,
    dispatch,
    hasHydratedDevoteeAccount,
    pushToken,
  ]);

  if (showSplash) {
    return <SaiBabaSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!hasHydratedDevoteeAccount) {
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#FFF7ED',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color="#F97316" size="large" />
      </View>
    );
  }

  if (devoteeAccount && showDevoteeProfile) {
    return <DevoteeProfileScreen account={devoteeAccount} onContinue={() => setShowDevoteeProfile(false)} />;
  }

  if (!devoteeAccount && showOnboarding) {
    return (
      <OnboardingScreen
        onDone={() => {
          setShowOnboarding(false);
          setShowAuth(true);
        }}
      />
    );
  }

  if (!devoteeAccount && showCreateAccount) {
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

  if (!devoteeAccount && showAuth) {
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
        <Stack.Screen name="directory" options={{ headerShown: false }} />
        <Stack.Screen name="events" options={{ headerShown: false }} />
        <Stack.Screen name="sangha-hub" options={{ headerShown: false }} />
        <Stack.Screen name="sangha-hub-list" options={{ headerShown: false }} />
        <Stack.Screen name="sangha-hub-search" options={{ headerShown: false }} />
        <Stack.Screen name="sangha-notifications" options={{ headerShown: false }} />
        <Stack.Screen name="sangha-create-group" options={{ headerShown: false }} />
        <Stack.Screen name="sangha-edit-group" options={{ headerShown: false }} />
        <Stack.Screen name="sangha-list" options={{ headerShown: false }} />
        <Stack.Screen name="sangha-profile" options={{ headerShown: false }} />
        <Stack.Screen name="sangha-chat" options={{ headerShown: false }} />
        <Stack.Screen name="group-details" options={{ headerShown: false }} />
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
