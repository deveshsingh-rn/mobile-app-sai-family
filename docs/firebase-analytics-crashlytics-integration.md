# Firebase Analytics And Crashlytics Integration Plan

This document is the implementation guide for adding Firebase Analytics and Firebase Crashlytics to the Sai Family Expo app.

Current app facts:

- Expo SDK: `~54.0.33`
- React Native: `0.81.5`
- New Architecture: enabled
- iOS bundle id: `com.deveshrn.saifamily`
- Android package: not set yet in `app.json`
- Production API base URL: `https://saifamily.sustaininsight.com`
- EAS project id: `d751b428-eab5-47a0-8ed0-4782b79d0e40`

## Official References

- Expo Firebase guide: https://docs.expo.dev/guides/using-firebase/
- React Native Firebase Expo setup: https://rnfirebase.io/
- React Native Firebase Analytics: https://rnfirebase.io/analytics/usage
- React Native Firebase Analytics screen tracking: https://rnfirebase.io/analytics/screen-tracking
- React Native Firebase Crashlytics: https://rnfirebase.io/crashlytics/usage

## Architecture Decision

Use React Native Firebase, not Firebase JS SDK.

Reason:

- Firebase Analytics and Crashlytics require native Firebase SDK support in a React Native mobile app.
- Firebase JS SDK is useful for web-friendly services like Auth, Firestore, and Storage, but it does not cover native Crashlytics.
- React Native Firebase cannot run inside Expo Go because it needs native code. We must use EAS development builds, preview builds, or production builds.

Target packages:

```bash
npx expo install expo-dev-client
npx expo install @react-native-firebase/app
npx expo install @react-native-firebase/analytics
npx expo install @react-native-firebase/crashlytics
npx expo install expo-build-properties
```

## Phase 0: Firebase Project Setup

Status: Not started

Todo:

- [ ] Create or open the Firebase project for Sai Family.
- [ ] Add an iOS app with bundle id `com.deveshrn.saifamily`.
- [ ] Add an Android app with package name `com.deveshrn.saifamily`.
- [ ] Download `GoogleService-Info.plist` for iOS.
- [ ] Download `google-services.json` for Android.
- [ ] Decide environment split:
  - `development`
  - `preview`
  - `production`

Recommended file structure:

```text
firebase/
  development/
    GoogleService-Info.plist
    google-services.json
  preview/
    GoogleService-Info.plist
    google-services.json
  production/
    GoogleService-Info.plist
    google-services.json
```

Security note:

- Firebase mobile config files are not private secrets, but they identify Firebase projects.
- For enterprise release hygiene, keep separate files per environment and avoid mixing dev analytics with production analytics.

## Phase 1: Expo Config Setup

Status: Not started

Because this app needs environment-specific Firebase files, the cleanest approach is to move from static `app.json` to `app.config.ts`.

Minimum config requirements:

- Add `android.package`.
- Add `android.googleServicesFile`.
- Add `ios.googleServicesFile`.
- Add React Native Firebase config plugins.
- Add `expo-build-properties` for iOS static frameworks and Firebase static linking.

Recommended config shape:

```ts
import type { ExpoConfig } from "expo/config";

const appEnv = process.env.APP_ENV ?? "production";
const firebaseDir = `./firebase/${appEnv}`;

const config: ExpoConfig = {
  name: "sai-family",
  slug: "sai-family",
  version: "1.0.0",
  scheme: "saifamily",
  ios: {
    bundleIdentifier: "com.deveshrn.saifamily",
    googleServicesFile: `${firebaseDir}/GoogleService-Info.plist`,
    supportsTablet: true,
    infoPlist: {
      NSSpeechRecognitionUsageDescription:
        "Allow Sai Family to recognize your speech for search.",
      NSMicrophoneUsageDescription:
        "Allow Sai Family to use the microphone for voice search.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.deveshrn.saifamily",
    googleServicesFile: `${firebaseDir}/google-services.json`,
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-font",
    "expo-notifications",
    "expo-location",
    "@react-native-community/datetimepicker",
    "@react-native-firebase/app",
    "@react-native-firebase/analytics",
    "@react-native-firebase/crashlytics",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
          forceStaticLinking: ["RNFBApp", "RNFBAnalytics", "RNFBCrashlytics"],
        },
      },
    ],
  ],
};

export default config;
```

If we keep `app.json`, we can still add the same fields, but environment switching will be weaker.

## Phase 2: EAS Build Setup

Status: Not started

Update `eas.json` to set `APP_ENV` per profile.

Recommended shape:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "APP_ENV": "preview"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "APP_ENV": "production"
      }
    }
  }
}
```

Build commands:

```bash
eas build --profile development --platform android
eas build --profile development --platform ios
eas build --profile production --platform all
```

Important:

- Expo Go will not work after React Native Firebase is added.
- Use a development build for local testing.
- For Crashlytics native crash testing, Expo dev client can intercept crashes. Final Crashlytics verification should be done on a preview or production-style build.

## Phase 3: Analytics Service Layer

Status: Not started

Create one typed wrapper instead of calling Firebase directly inside screens.

Target file:

```text
services/analytics.ts
```

Responsibilities:

- Track screen views.
- Track typed product events.
- Set authenticated user id.
- Set safe user properties.
- Disable or reduce logging in local development when needed.

Example API:

```ts
export type AnalyticsEventName =
  | "auth_login_started"
  | "auth_login_success"
  | "experience_post_created"
  | "event_rsvp_success"
  | "directory_listing_viewed"
  | "directory_contact_tapped"
  | "sangha_group_joined";

export async function trackEvent(
  name: AnalyticsEventName,
  params?: Record<string, string | number | boolean | null>,
) {
  // Firebase Analytics call lives here.
}

export async function trackScreen(screenName: string) {
  // Firebase screen view call lives here.
}

export async function setAnalyticsIdentity(userId?: string) {
  // setUserId and non-PII user properties live here.
}
```

Privacy rules:

- Do not send OTP values.
- Do not send passwords.
- Do not send raw mobile numbers.
- Do not send raw email addresses.
- Do not send full addresses.
- Do not send push tokens.
- Use internal ids, listing ids, event ids, group ids, category ids, and boolean status flags.

## Phase 4: Crashlytics Service Layer

Status: Not started

Create a crash reporting wrapper.

Target file:

```text
services/crash-reporting.ts
```

Responsibilities:

- Set Crashlytics user id after login.
- Clear user context after logout.
- Add breadcrumbs for major flows.
- Record recoverable errors from API, Redux Saga, media upload, location, and navigation failures.
- Avoid noisy reporting for expected validation errors.

Example API:

```ts
export function setCrashUser(userId?: string) {
  // crashlytics().setUserId(...)
}

export function setCrashContext(key: string, value: string) {
  // crashlytics().setAttribute(...)
}

export function logCrashBreadcrumb(message: string) {
  // crashlytics().log(...)
}

export function recordAppError(error: unknown, context?: Record<string, string>) {
  // crashlytics().recordError(...)
}
```

Do not report these as crashes:

- User enters invalid OTP.
- User submits an incomplete form.
- Backend returns normal `400` validation response.
- User cancels image picker, location permission, or document picker.

Do report these:

- Unexpected saga failure.
- Unexpected navigation failure.
- Media upload crash or timeout loop.
- API response shape mismatch.
- Secure storage read/write failure.
- Native module failure.

## Phase 5: Navigation Screen Tracking

Status: Not started

This app uses Expo Router. Add a small tracker component in root layout.

Target:

```text
app/_layout.tsx
```

Recommended approach:

- Use `usePathname()` from `expo-router`.
- On pathname change, call `trackScreen(pathname)`.
- Keep route params out of screen names unless sanitized.

Example:

```tsx
function AnalyticsRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackScreen(pathname);
  }, [pathname]);

  return null;
}
```

Screen name examples:

- `/auth`
- `/(tabs)/experiences`
- `/experiences/[id]`
- `/(tabs)/events`
- `/events/[id]`
- `/(tabs)/directory`
- `/directory/business-details`
- `/(tabs)/sangha`
- `/group-details`

## Phase 6: Product Event Map

Status: Not started

### Auth

- `auth_screen_viewed`
- `auth_mobile_otp_requested`
- `auth_mobile_login_success`
- `auth_email_login_success`
- `auth_account_create_started`
- `auth_account_create_success`
- `auth_logout`
- `auth_email_verification_requested`
- `auth_password_created`

### Experiences

- `experience_feed_viewed`
- `experience_category_selected`
- `experience_post_opened`
- `experience_post_created`
- `experience_post_liked`
- `experience_post_bookmarked`
- `experience_comment_created`
- `experience_search_submitted`

### Events

- `events_home_viewed`
- `event_opened`
- `event_created`
- `event_edited`
- `event_deleted`
- `event_rsvp_success`
- `event_rsvp_cancelled`
- `event_comment_created`
- `event_review_submitted`
- `event_calendar_date_selected`

### Directory

- `directory_home_viewed`
- `directory_category_opened`
- `directory_listing_opened`
- `directory_search_submitted`
- `directory_listing_created`
- `directory_listing_bookmarked`
- `directory_review_submitted`
- `directory_whatsapp_tapped`
- `directory_call_tapped`
- `directory_map_tapped`

### Sangha

- `sangha_home_viewed`
- `sangha_devotee_profile_opened`
- `sangha_connection_requested`
- `sangha_group_opened`
- `sangha_group_joined`
- `sangha_group_left`
- `sangha_group_post_created`
- `sangha_group_event_created`
- `sangha_group_live_stream_opened`

## Phase 7: Redux Saga Integration

Status: Not started

Rules:

- Track success and failure in sagas, not reducers.
- Reducers must stay pure.
- Avoid duplicate events from both screen and saga for the same action.
- Prefer saga tracking for backend-confirmed events.
- Prefer screen tracking for UI-only events.

Examples:

- Screen logs `directory_search_submitted`.
- Saga logs `directory_listing_created` only after backend success.
- Saga records unexpected failures through Crashlytics.

Recommended helper:

```ts
function* recordSagaError(error: unknown, flowName: string) {
  yield call(recordAppError, error, { flow: flowName });
}
```

## Phase 8: Axios/API Error Breadcrumbs

Status: Not started

Target:

```text
services/api.ts
```

Add lightweight Crashlytics breadcrumbs for API failures.

Record:

- HTTP method
- URL path
- status code
- backend error code
- flow name if available

Do not record:

- Authorization token
- `x-user-id`
- phone number
- email
- request body containing personal details
- media file urls if they are private

Expected validation errors should not become Crashlytics errors. They can be breadcrumbs only.

## Phase 9: Verification Checklist

Status: Not started

Analytics:

- [ ] Install development build.
- [ ] Open app.
- [ ] Login.
- [ ] Open each pillar tab.
- [ ] Create one test event.
- [ ] Open one directory listing.
- [ ] Join one Sangha group.
- [ ] Verify events in Firebase DebugView.
- [ ] Verify production events do not contain PII.

Crashlytics:

- [ ] Add temporary internal test button for `crash()`.
- [ ] Build preview or production-style app.
- [ ] Trigger test crash.
- [ ] Reopen app.
- [ ] Verify crash appears in Firebase Crashlytics.
- [ ] Verify stack traces are symbolicated.
- [ ] Remove test crash button before release.

Build:

- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] `eas build --profile development --platform android`
- [ ] `eas build --profile preview --platform android`
- [ ] `eas build --profile production --platform all`

## Phase 10: Release Policy

Status: Not started

Before production release:

- [ ] Firebase production app files are installed.
- [ ] Analytics debug mode is disabled.
- [ ] Crash test button is removed.
- [ ] No PII is present in analytics params.
- [ ] No validation errors are reported as crashes.
- [ ] User identity is cleared on logout.
- [ ] Crashlytics user id is reset on logout.
- [ ] Dashboard event names are reviewed by product and backend teams.

## Backend/Admin Benefits

Analytics will help answer:

- Which pillar is used most.
- Which onboarding step drops users.
- Which directory categories are most popular.
- Which event types drive RSVP.
- Which Sangha group flows need backend optimization.

Crashlytics will help identify:

- Native module crashes.
- Media upload instability.
- Location permission edge cases.
- Production-only API response shape issues.
- Device-specific memory/performance crashes.

## Implementation Order

Recommended order:

1. Install packages and configure Firebase files.
2. Create `services/analytics.ts`.
3. Create `services/crash-reporting.ts`.
4. Add route screen tracking.
5. Set user identity after login and clear it after logout.
6. Add Crashlytics breadcrumbs in `services/api.ts`.
7. Add saga-level success/failure tracking for each pillar.
8. Verify Analytics DebugView.
9. Verify Crashlytics in preview/production-style build.
10. Remove test crash tools and release.

