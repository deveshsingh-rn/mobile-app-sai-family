import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import '@/utils/disable-font-scaling';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthScreen from '@/screens/authscreen';
import CreateDevoteeAccountScreen from '@/screens/create-devotee-account-screen';
import DevoteeProfileScreen from '@/screens/devotee-profile-screen';
import OnboardingScreen from '@/screens/onboarding';
import SaiBabaSplashScreen from '@/screens/splashscreen';
import {
  identifyProductUser,
  initProductAnalytics,
  trackProductEvent,
  trackProductScreen,
} from '@/services/product-analytics';
import { loadSavedDevoteeAccountRequest } from '@/store/devotee-account/actions';
import {
  selectDevoteeAccount,
  selectHasHydratedDevoteeAccount,
} from '@/store/devotee-account/selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerPushTokenRequest } from '@/store/notifications/actions';
import { selectPushToken } from '@/store/notifications/selectors';
import { store } from '@/store';
import { refreshMorningSaiAlarm } from '@/services/morning-sai-alarm';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppLayoutContent() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const router = useRouter();
  const handledNotificationIdRef = useRef<string | null>(null);
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
    void initProductAnalytics();
  }, []);

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
    if (!hasHydratedDevoteeAccount || !devoteeAccount) {
      return;
    }

    const userId = devoteeAccount.id || devoteeAccount.authorId;

    if (!userId) {
      return;
    }

    void identifyProductUser(userId, {
      account_status: "active",
      city: devoteeAccount.city || null,
      country: devoteeAccount.country || null,
      email_verified: Boolean(
        devoteeAccount.emailVerified ||
          devoteeAccount.isEmailVerified
      ),
      language: devoteeAccount.language || null,
    });
  }, [
    devoteeAccount,
    hasHydratedDevoteeAccount,
  ]);

  useEffect(() => {
    if (hasHydratedDevoteeAccount && devoteeAccount?.name) {
      void refreshMorningSaiAlarm(devoteeAccount.name);
    }
  }, [devoteeAccount?.name, hasHydratedDevoteeAccount]);

  useEffect(() => {
    if (!devoteeAccount) return;

    const openNotification = (response: Notifications.NotificationResponse) => {
      const request = response.notification.request;
      if (handledNotificationIdRef.current === request.identifier) return;
      handledNotificationIdRef.current = request.identifier;

      const data = request.content.data || {};

      if (data.feature === 'morning-sai') {
        router.push('/(tabs)/experiences/ask-sai' as never);
        return;
      }

      if (
        data.feature === 'sangha' ||
        data.kind === 'sangha_message' ||
        data.type === 'sangha_message'
      ) {
        if (typeof data.conversationId === 'string') {
          router.push({
            pathname: '/sangha-chat',
            params: { conversationId: data.conversationId },
          } as never);
          return;
        }

        if (typeof data.senderUserId === 'string') {
          router.push({
            pathname: '/sangha-profile',
            params: { id: data.senderUserId },
          } as never);
        }
      }
    };

    const subscription =
      Notifications.addNotificationResponseReceivedListener(openNotification);
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openNotification(response);
    });

    return () => subscription.remove();
  }, [devoteeAccount, router]);

  useEffect(() => {
    let screenName = "App";

    if (showSplash) {
      screenName = "Splash";
    } else if (!hasHydratedDevoteeAccount) {
      screenName = "Auth Hydration";
    } else if (devoteeAccount && showDevoteeProfile) {
      screenName = "Devotee Profile Intro";
    } else if (!devoteeAccount && showOnboarding) {
      screenName = "Onboarding";
    } else if (!devoteeAccount && showCreateAccount) {
      screenName = "Create Devotee Account";
    } else if (!devoteeAccount && showAuth) {
      screenName = "Auth";
    } else if (pathname) {
      screenName = pathname;
    }

    trackProductScreen(screenName, {
      is_logged_in: Boolean(devoteeAccount),
    });
  }, [
    devoteeAccount,
    hasHydratedDevoteeAccount,
    pathname,
    showAuth,
    showCreateAccount,
    showDevoteeProfile,
    showOnboarding,
    showSplash,
  ]);

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
          trackProductEvent("Onboarding Completed");
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
          trackProductEvent("Account Created", {
            has_profile_image: Boolean(account.profileImageUrl),
          });
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
        <Stack.Screen
          name="naam-jap"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
            headerShown: false,
          }}
        />
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
