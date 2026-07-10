import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Mixpanel } from "mixpanel-react-native";

export type ProductAnalyticsEventName =
  | "App Opened"
  | "Screen Viewed"
  | "Onboarding Completed"
  | "OTP Requested"
  | "Login Completed"
  | "Logout Completed"
  | "Account Created"
  | "Devotee Question Asked"
  | "Devotee Answer Spoken"
  | "Devotee Answer Feedback Sent"
  | "Devotee Conversation Deleted"
  | "Devotee Conversation Opened"
  | "Experience Post Created"
  | "Event RSVP Completed"
  | "Directory Listing Opened"
  | "Directory Contact Tapped"
  | "Sangha Group Joined";

export type ProductAnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

const MIXPANEL_PLACEHOLDER_TOKEN = "replace-with-token";
const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
const MIXPANEL_SERVER_URL =
  process.env.EXPO_PUBLIC_MIXPANEL_SERVER_URL ||
  "https://api.mixpanel.com";
const ANALYTICS_ENABLED =
  process.env.EXPO_PUBLIC_ANALYTICS_ENABLED !== "false";

let mixpanelInstance: Mixpanel | null = null;
let initPromise: Promise<Mixpanel | null> | null = null;
let lastScreenName: string | null = null;

function hasUsableToken() {
  return Boolean(
    MIXPANEL_TOKEN &&
      MIXPANEL_TOKEN.trim() &&
      MIXPANEL_TOKEN !== MIXPANEL_PLACEHOLDER_TOKEN
  );
}

function shouldTrack() {
  return ANALYTICS_ENABLED && hasUsableToken();
}

function getAppVersion() {
  return (
    Constants.expoConfig?.version ||
    Constants.manifest2?.extra?.expoClient?.version ||
    "unknown"
  );
}

function getBuildProfile() {
  return process.env.APP_ENV || process.env.NODE_ENV || "development";
}

function sanitizeProperties(
  properties?: ProductAnalyticsProperties
) {
  if (!properties) {
    return {};
  }

  return Object.entries(properties).reduce<Record<string, string | number | boolean | null>>(
    (safeProperties, [key, value]) => {
      if (value === undefined) {
        return safeProperties;
      }

      safeProperties[key] = value;
      return safeProperties;
    },
    {}
  );
}

function getSuperProperties() {
  return {
    app_name: "Sai Family",
    app_platform: Platform.OS,
    app_version: getAppVersion(),
    build_profile: getBuildProfile(),
    analytics_source: "mobile_app",
  };
}

async function getMixpanel() {
  if (!shouldTrack()) {
    return null;
  }

  if (mixpanelInstance) {
    return mixpanelInstance;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const mixpanel = new Mixpanel(
          MIXPANEL_TOKEN as string,
          false,
          false,
          AsyncStorage
        );

        mixpanel.setServerURL(MIXPANEL_SERVER_URL);
        mixpanel.setUseIpAddressForGeolocation(false);
        mixpanel.setLoggingEnabled(__DEV__);

        await mixpanel.init(false, getSuperProperties(), MIXPANEL_SERVER_URL);

        mixpanelInstance = mixpanel;
        return mixpanel;
      } catch (error) {
        console.warn("[Mixpanel] Initialization failed", error);
        initPromise = null;
        return null;
      }
    })();
  }

  return initPromise;
}

export async function initProductAnalytics() {
  const mixpanel = await getMixpanel();

  if (!mixpanel) {
    return;
  }

  trackProductEvent("App Opened", {
    is_development: __DEV__,
  });
}

export function trackProductEvent(
  name: ProductAnalyticsEventName,
  properties?: ProductAnalyticsProperties
) {
  if (!shouldTrack()) {
    return;
  }

  void getMixpanel().then((mixpanel) => {
    if (!mixpanel) {
      return;
    }

    mixpanel.track(name, sanitizeProperties(properties));
  });
}

export function trackProductScreen(
  screenName: string,
  properties?: ProductAnalyticsProperties
) {
  if (!screenName || lastScreenName === screenName) {
    return;
  }

  lastScreenName = screenName;

  trackProductEvent("Screen Viewed", {
    screen_name: screenName,
    ...properties,
  });
}

export async function identifyProductUser(
  userId: string,
  properties?: ProductAnalyticsProperties
) {
  if (!userId || !shouldTrack()) {
    return;
  }

  const mixpanel = await getMixpanel();

  if (!mixpanel) {
    return;
  }

  try {
    await mixpanel.identify(userId);

    const safeProperties = sanitizeProperties(properties);

    if (Object.keys(safeProperties).length > 0) {
      mixpanel.getPeople().set(safeProperties);
    }
  } catch (error) {
    console.warn("[Mixpanel] Identify failed", error);
  }
}

export function resetProductAnalytics() {
  if (!shouldTrack()) {
    lastScreenName = null;
    return;
  }

  void getMixpanel().then((mixpanel) => {
    if (!mixpanel) {
      return;
    }

    mixpanel.track("Logout Completed");
    mixpanel.reset();
    lastScreenName = null;
  });
}

export function setProductAnalyticsOptOut(isOptedOut: boolean) {
  if (!shouldTrack()) {
    return;
  }

  void getMixpanel().then((mixpanel) => {
    if (!mixpanel) {
      return;
    }

    if (isOptedOut) {
      mixpanel.optOutTracking();
      return;
    }

    mixpanel.optInTracking();
  });
}

export function flushProductAnalytics() {
  if (!shouldTrack()) {
    return;
  }

  void getMixpanel().then((mixpanel) => {
    mixpanel?.flush();
  });
}
