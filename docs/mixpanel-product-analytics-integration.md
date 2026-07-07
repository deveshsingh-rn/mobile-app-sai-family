# Mixpanel Product Analytics Integration Plan

This document is the product analytics implementation guide for Sai Family.

Mixpanel should answer product questions. Firebase Crashlytics should answer stability questions. Firebase Analytics can cover basic app analytics, but Mixpanel will be our deeper product analytics layer for funnels, retention, cohorts, feature adoption, and pillar-level behavior.

Current app facts:

- Expo SDK: `~54.0.33`
- React Native: `0.81.5`
- App pillars:
  - Experiences
  - Events
  - Directory
  - Sangha
- Auth persistence: handled in app storage/session flow
- Production API base URL: `https://saifamily.sustaininsight.com`

## Official References

- Mixpanel React Native SDK: https://docs.mixpanel.com/docs/tracking-methods/sdks/react-native
- Mixpanel what to track: https://docs.mixpanel.com/docs/what-to-track
- Mixpanel identity management: https://docs.mixpanel.com/docs/tracking-methods/id-management/identifying-users-simplified
- Mixpanel debugging and data validation: https://docs.mixpanel.com/docs/tracking-best-practices/debugging
- Mixpanel privacy and opt-out: https://docs.mixpanel.com/docs/privacy/protecting-user-data

## Architecture Decision

Use `mixpanel-react-native` through one app-level analytics wrapper.

Recommended mode:

- Use JavaScript mode for Expo compatibility unless we intentionally move to native Mixpanel mode.
- Disable automatic legacy mobile events.
- Keep all event names and properties typed in TypeScript.
- Send only product-safe IDs and category/status metadata.
- Do not send PII.

Why not call Mixpanel directly inside screens:

- It creates duplicate tracking.
- It makes event names inconsistent.
- It increases PII risk.
- It makes future migration to server-side analytics harder.

## Phase 0: Product Analytics Goals

Status: Not started

Primary business questions:

- How many users complete onboarding and account creation?
- Which pillar is used most by active devotees?
- Which actions create the strongest retention?
- Which directory categories drive business discovery?
- Which event types drive RSVP and attendance?
- Which Sangha flows create real community engagement?
- Where do 40+ age users drop off or get confused?

Core product funnels:

- Install/open -> onboarding completed -> account created -> first pillar action
- Directory home -> category opened -> listing opened -> contact tapped
- Events home -> event opened -> RSVP completed -> event comment/review
- Experiences feed -> post opened -> like/comment/bookmark/post created
- Sangha home -> group opened -> join requested/completed -> group post/comment/event

## Phase 1: Mixpanel Project Setup

Status: Not started

Todo:

- [ ] Create Mixpanel organization/project.
- [ ] Create separate projects:
  - `Sai Family Development`
  - `Sai Family Preview`
  - `Sai Family Production`
- [ ] Copy each project token.
- [ ] Confirm data residency:
  - US: `https://api.mixpanel.com`
  - EU: `https://api-eu.mixpanel.com`
  - India: `https://api-in.mixpanel.com`
- [ ] Decide whether India residency is required for this app.
- [ ] Add tokens to environment config, not hardcoded screen files.

Recommended `.env` values:

```bash
EXPO_PUBLIC_MIXPANEL_TOKEN=replace-with-token
EXPO_PUBLIC_MIXPANEL_SERVER_URL=https://api-in.mixpanel.com
EXPO_PUBLIC_ANALYTICS_ENABLED=true
```

## Phase 2: Package Installation

Status: Not started

Install:

```bash
npm install mixpanel-react-native
npx expo install @react-native-async-storage/async-storage
```

Why AsyncStorage:

- Mixpanel JavaScript mode needs storage for distinct id, opt-out state, and queued data.
- Expo projects should use JavaScript mode unless native mode is intentionally configured.

If we later use native Mixpanel mode:

- Rebuild with EAS/dev client.
- Verify iOS pods/native dependencies.
- Re-test app startup, logout reset, and event flushing.

## Phase 3: Analytics Service Layer

Status: Not started

Create:

```text
services/product-analytics.ts
```

Responsibilities:

- Initialize Mixpanel once.
- Track typed events.
- Track screen views.
- Identify user after login/account creation.
- Reset identity on logout.
- Register safe super properties.
- Support opt-in/opt-out.
- Flush key events when needed.

Recommended public API:

```ts
export type ProductAnalyticsEventName =
  | "App Opened"
  | "Onboarding Completed"
  | "Account Created"
  | "Login Completed"
  | "Experience Post Created"
  | "Event RSVP Completed"
  | "Directory Listing Opened"
  | "Directory Contact Tapped"
  | "Sangha Group Joined";

export type ProductAnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export async function initProductAnalytics(): Promise<void>;

export function trackProductEvent(
  name: ProductAnalyticsEventName,
  properties?: ProductAnalyticsProperties,
): void;

export function trackProductScreen(screenName: string): void;

export function identifyProductUser(userId: string): void;

export function resetProductAnalytics(): void;

export function setProductAnalyticsOptOut(isOptedOut: boolean): void;
```

Implementation notes:

- Initialize with `trackAutomaticEvents = false`.
- Prefer `useNative = false` for Expo JavaScript mode.
- Use `serverURL` from environment.
- Register app-level super properties once:
  - `app_name`
  - `app_version`
  - `build_profile`
  - `platform`
  - `api_env`
  - `source`

## Phase 4: Identity Management

Status: Not started

Rules:

- Do not call `identify()` for anonymous users.
- Call `identify(userId)` after login or successful account creation.
- Track at least one event after identify so anonymous and logged-in activity can merge.
- Call `reset()` on logout.
- Use backend user id/member id, not mobile number or email.

Allowed user profile properties:

- `role`
- `language`
- `country`
- `city`
- `account_status`
- `created_at`
- `email_verified`
- `push_enabled`

Blocked user profile properties:

- Raw mobile number
- Raw email
- OTP
- Password
- Full address
- Push token
- Access token
- Refresh token
- Government id or sensitive documents

## Phase 5: Privacy And Consent

Status: Not started

This app serves families and older users, so analytics must be respectful and transparent.

Rules:

- No PII in events.
- No raw search text if it may contain personal details.
- No full address.
- No phone/email.
- No file URLs if private.
- No GPS coordinates unless rounded or explicitly needed.
- Disable IP-based geolocation if product does not need it.

Recommended:

- Add an analytics preference in Profile -> Settings.
- Default tracking behavior should follow legal/product policy.
- If consent is required, initialize opted out by default and call opt-in after consent.

Methods to support:

- `optOutTracking()`
- `optInTracking()`
- `setUseIpAddressForGeolocation(false)`

## Phase 6: Event Naming Standard

Status: Not started

Use Object Action format:

```text
Object Action
```

Examples:

- `Account Created`
- `Directory Listing Opened`
- `Event RSVP Completed`
- `Sangha Group Joined`

Naming rules:

- Keep names short.
- Use Title Case.
- Do not mix snake_case and Title Case.
- Do not rename events after release unless migration is planned.
- Avoid UI implementation words like button, modal, card unless tracking the UI itself matters.
- Use properties for detail, not event name explosion.

Bad:

- `click_on_red_button_directory_whatsapp`
- `directory_listing_opened_v2`
- `user_did_the_rsvp_from_event_detail_screen`

Good:

- `Directory Contact Tapped`
- `Event RSVP Completed`
- `Event Detail Viewed`

## Phase 7: Global Event Properties

Status: Not started

Every event should include a stable base context.

Recommended super properties:

```ts
{
  app_name: "Sai Family",
  app_platform: "ios" | "android" | "web",
  app_version: string,
  build_profile: "development" | "preview" | "production",
  api_env: "development" | "production",
  analytics_source: "mobile_app"
}
```

Recommended user-safe properties:

```ts
{
  user_role?: "devotee" | "mandir_admin" | "super_admin",
  language?: string,
  country?: string,
  city?: string,
  is_logged_in: boolean
}
```

## Phase 8: Pillar Event Map

Status: Not started

### App And Onboarding

| Event | When | Key properties |
| --- | --- | --- |
| `App Opened` | App starts | `launch_source`, `is_logged_in` |
| `Splash Completed` | Splash flow ends | `duration_ms` |
| `Onboarding Started` | First onboarding screen visible | `screen_count` |
| `Onboarding Slide Viewed` | Slide changes | `slide_index`, `slide_key` |
| `Onboarding Completed` | User finishes onboarding | `duration_ms` |

### Auth

| Event | When | Key properties |
| --- | --- | --- |
| `Login Started` | User starts login | `method` |
| `OTP Requested` | Mobile OTP requested | `country_code`, `flow` |
| `OTP Verified` | OTP verified | `flow` |
| `Login Completed` | User logged in | `method` |
| `Account Creation Started` | Create account flow starts | `source` |
| `Account Created` | Backend account success | `has_profile_image`, `language` |
| `Email Verification Requested` | User requests email verify | `source` |
| `Password Created` | Password setup success | `source` |
| `Logout Completed` | Logout success | `source` |

### Experiences

| Event | When | Key properties |
| --- | --- | --- |
| `Experience Feed Viewed` | Feed opens | `category_id` |
| `Experience Category Selected` | Category filter changes | `category_id`, `category_name` |
| `Experience Post Opened` | Post detail opens | `post_id`, `post_type` |
| `Experience Post Created` | Create post success | `post_type`, `category_id`, `has_media` |
| `Experience Post Liked` | Like success | `post_id` |
| `Experience Post Bookmarked` | Bookmark success | `post_id` |
| `Experience Comment Created` | Comment success | `post_id` |
| `Experience Search Submitted` | Search submitted | `has_query`, `result_count` |

### Events

| Event | When | Key properties |
| --- | --- | --- |
| `Events Home Viewed` | Events tab opens | `selected_filter` |
| `Event Detail Viewed` | Event detail opens | `event_id`, `event_type` |
| `Event Created` | Create success | `event_id`, `event_type`, `has_banner` |
| `Event Edited` | Edit success | `event_id` |
| `Event Deleted` | Delete success | `event_id` |
| `Event RSVP Completed` | RSVP success | `event_id`, `event_type` |
| `Event RSVP Cancelled` | RSVP cancel success | `event_id` |
| `Event Comment Created` | Comment success | `event_id` |
| `Event Review Submitted` | Review success | `event_id`, `rating` |
| `Event Calendar Date Selected` | Calendar date selected | `date_has_events` |

### Directory

| Event | When | Key properties |
| --- | --- | --- |
| `Directory Home Viewed` | Directory tab opens | `category_count` |
| `Directory Category Opened` | Category opened | `category_id`, `category_slug` |
| `Directory Listing Opened` | Business detail opens | `listing_id`, `category_id`, `is_featured` |
| `Directory Search Submitted` | Search submitted | `has_query`, `category_id`, `result_count` |
| `Directory Listing Created` | Create listing success | `listing_id`, `category_id`, `has_images` |
| `Directory Listing Bookmarked` | Bookmark success | `listing_id` |
| `Directory Review Submitted` | Review success | `listing_id`, `rating` |
| `Directory Contact Tapped` | Phone/WhatsApp/email/map tapped | `listing_id`, `contact_type` |
| `Directory Collection Viewed` | Featured/trending/nearby list opens | `collection_type` |

### Sangha

| Event | When | Key properties |
| --- | --- | --- |
| `Sangha Home Viewed` | Sangha tab opens | `filter` |
| `Sangha Devotee Profile Opened` | Devotee profile opens | `devotee_id` |
| `Sangha Connection Requested` | Connection request success | `devotee_id` |
| `Sangha Group Opened` | Group detail opens | `group_id`, `group_type` |
| `Sangha Group Joined` | Join success | `group_id` |
| `Sangha Group Left` | Leave success | `group_id` |
| `Sangha Group Post Created` | Group post success | `group_id`, `post_type` |
| `Sangha Group Event Created` | Group event success | `group_id`, `event_type` |
| `Sangha Live Stream Opened` | Live stream opens | `group_id`, `stream_id` |

## Phase 9: Screen Tracking

Status: Not started

Target:

```text
app/_layout.tsx
```

Use Expo Router pathname tracking.

Recommended screen names:

- `Splash`
- `Onboarding`
- `Auth`
- `Experiences Feed`
- `Experience Detail`
- `Experience Search`
- `Events Home`
- `Event Detail`
- `Event Calendar`
- `Create Event`
- `Directory Home`
- `Directory Category`
- `Directory Listing Detail`
- `Directory Search`
- `Create Directory Listing`
- `Sangha Home`
- `Sangha Hub`
- `Sangha Group Detail`
- `Profile`

Do not send raw route params as screen names. Send ids as properties only when needed.

## Phase 10: Redux Saga Integration

Status: Not started

Rules:

- Track backend-confirmed product events inside sagas.
- Track UI-only events inside screens/components.
- Do not track from reducers.
- Do not track optimistic actions as success until backend confirms.

Examples:

- Create directory listing screen starts timer.
- Directory saga logs `Directory Listing Created` on success.
- Directory saga logs a non-PII failure property only if product needs failure analytics.

Recommended flow:

```text
Screen action -> Redux action -> Saga API call -> Success action -> Mixpanel success event
```

## Phase 11: Server-Side Analytics Strategy

Status: Not started

Mixpanel recommends server-side tracking for data accuracy. For Sai Family, use a hybrid approach.

Client-side events:

- Screen views
- UI taps
- Search submitted
- Filter changes
- Start of flow

Server-side events:

- Account created
- Event created
- RSVP completed
- Directory listing created
- Review submitted
- Sangha group joined
- Payment/donation events if added later

Why:

- Backend-confirmed events are more accurate.
- Ad blockers are less relevant on native mobile, but retries/offline states can still create duplicates.
- Server-side events are better for critical business metrics.

Backend requirement later:

- Add analytics event publishing after successful mutations.
- Include idempotency keys for important actions.
- Respect user analytics opt-out server side.

## Phase 12: Performance Rules

Status: Not started

Do:

- Batch through SDK defaults.
- Flush after high-value events like account creation.
- Keep properties small.
- Use ids instead of large objects.
- Track one event per meaningful action.

Do not:

- Track every scroll frame.
- Track every keystroke.
- Track every render.
- Send full API responses.
- Send media payloads.
- Send large arrays.

High-risk screens:

- Experience feed scroll
- Directory search
- Event calendar
- Sangha group feed

For these screens, track intent and outcome, not every UI movement.

## Phase 13: Debugging And QA

Status: Not started

Development validation:

- [ ] Use Mixpanel Development project token.
- [ ] Enable SDK logging only in development.
- [ ] Trigger `App Opened`.
- [ ] Login and verify identity is set.
- [ ] Logout and verify identity resets.
- [ ] Trigger one event from each pillar.
- [ ] Verify events in Mixpanel Events view.
- [ ] Confirm event/property casing.
- [ ] Confirm no PII.
- [ ] Confirm India/EU endpoint if selected.

Production validation:

- [ ] Use production token.
- [ ] Disable debug logs.
- [ ] Verify only production build sends to production Mixpanel.
- [ ] Verify events are not duplicated.
- [ ] Verify opt-out setting prevents events.
- [ ] Verify logout calls reset.

## Phase 14: Dashboards And Product Reports

Status: Not started

Create Mixpanel boards:

### Executive Overview

- Daily active users
- Weekly active users
- New accounts
- Retention by week
- Pillar usage split

### Onboarding And Auth

- Onboarding completion rate
- OTP request to verified rate
- Create account completion rate
- Login method split

### Experiences

- Feed viewers
- Post creators
- Commenters
- Likes/bookmarks
- Search usage

### Events

- Event detail views
- RSVP conversion
- Event create conversion
- Calendar engagement
- Reviews submitted

### Directory

- Category opens
- Listing detail views
- Contact taps
- Listing creation
- Reviews submitted

### Sangha

- Group opens
- Group joins
- Group posts
- Live stream opens
- Member engagement

## Phase 15: Implementation Order

Status: Not started

Recommended order:

1. Create Mixpanel projects and tokens.
2. Add env variables.
3. Install `mixpanel-react-native` and AsyncStorage.
4. Create `services/product-analytics.ts`.
5. Initialize analytics from root layout/app bootstrap.
6. Add route screen tracking.
7. Identify user after login/account creation.
8. Reset on logout.
9. Track onboarding and auth.
10. Track one high-value action per pillar.
11. Add saga-level success tracking for create/RSVP/review/join flows.
12. Add Profile setting for analytics opt-out.
13. Validate development project data.
14. Promote to preview.
15. Promote to production.

## Open Product Decisions

- Should analytics be opt-in or opt-out by default?
- Should India data residency be mandatory?
- Should backend also send server-side product analytics?
- What is the official "value moment" for Sai Family?
  - First experience post?
  - First RSVP?
  - First directory contact tap?
  - First Sangha group join?
- Which events are required for leadership dashboards on day one?

