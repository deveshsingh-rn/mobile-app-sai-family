# Mobile App Store Deployment Runbook

Last reviewed: 2026-09-02

This is the reusable release and account-handover guide for Expo React Native
applications deployed with EAS Build and EAS Submit. A junior developer should
be able to follow it without receiving an owner's personal passwords or private
signing files through chat or email.

Official references:

- [Expo: create an EAS build](https://docs.expo.dev/build/setup/)
- [Expo: submit to app stores](https://docs.expo.dev/deploy/submit-to-app-stores/)
- [Expo: iOS submission](https://docs.expo.dev/submit/ios/)
- [Expo: Android submission](https://docs.expo.dev/submit/android/)
- [Expo: EAS environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: app credentials](https://docs.expo.dev/app-signing/app-credentials/)
- [Apple: App Store Connect roles](https://developer.apple.com/help/app-store-connect/manage-your-team/overview-of-accounts-and-roles)
- [Apple: app transfer overview](https://developer.apple.com/help/app-store-connect/transfer-an-app/overview-of-app-transfer/)
- [Google Play: transfer an app](https://support.google.com/googleplay/android-developer/answer/6230247)
- [Google Play: protect the developer account](https://support.google.com/googleplay/android-developer/answer/2543765)

## 1. Understand The Four Independent Accounts

Do not treat these as one login:

| System | Purpose | Recommended owner |
| --- | --- | --- |
| GitHub/Git provider | Source code, reviews, CI | Company organization |
| Expo/EAS | Cloud builds, EAS credentials, environment variables | Company Expo organization |
| Apple Developer and App Store Connect | iOS signing, TestFlight, App Store | Company Apple organization account |
| Google Play Console and Google Cloud | Android signing, testing, Play release | Company Google Play organization account |

Changing the Apple or Google account does not require changing the Expo account.
Changing the Expo owner does not transfer an already published store app.

Never share an owner password. Invite each developer with their own account and
least-privilege role. Require two-factor authentication for every owner/admin.

## 2. Decide: New App Or Existing Published App

This decision must happen before changing `app.json` or creating store records.

### Path A: The app has never been uploaded to either store

1. Create the app record under the new company Apple/Google account.
2. Confirm the final identifiers before the first upload.
3. Generate new signing credentials under the company accounts.
4. Build and submit using the procedures below.

### Path B: The app already exists in TestFlight, App Store, or Google Play

Do not create a second app with a new identifier. Transfer the existing app.

- iOS keeps its existing bundle identifier after an App Store transfer.
- Android keeps its existing package/application ID after a Play transfer.
- Store users, ratings, and updates must continue under the same identifiers.
- Back up metadata, reports, credentials inventory, and integration details first.
- Reconfigure push notification credentials, API keys, service accounts, CI, and
  analytics integrations after transfer.

Stop if nobody can confirm whether the app was previously uploaded. Check App
Store Connect, Play Console, and EAS build history before proceeding.

## 3. Sai Family Current Configuration

As of the review date:

```text
Git branch: main
Expo owner: devesh-rn
Expo slug: sai-family
EAS project ID: d751b428-eab5-47a0-8ed0-4782b79d0e40
iOS bundle ID: com.deveshrn.saifamily
Android package: com.deveshrn.saifamily
App version: 1.0.0
Version source: remote
Expo SDK: 54
```

Available EAS profiles:

| Profile | Output/use |
| --- | --- |
| `development` | Internal development-client build |
| `development-main` | Internal development-client build using EAS `development` environment |
| `preview` | Internal Android APK/device testing |
| `production` | Store-ready IPA/AAB with automatic build-number increment |

For an already uploaded Sai Family app, preserve
`com.deveshrn.saifamily` on both stores during account migration.

## 4. Company Account Setup And Access

### 4.1 Expo/EAS

1. Create or select the company Expo organization.
2. Add developers as organization members using their own Expo accounts.
3. Decide whether the existing EAS project remains under `devesh-rn` or is
   transferred to the organization.
4. Prefer transferring the existing EAS project. Do not run `eas init` with a
   new project ID unless intentionally creating a different app.
5. After transfer, update `expo.owner` only to the actual Expo owner and retain
   the transferred project's exact `extra.eas.projectId`.

Verify login and project ownership:

```bash
npx eas-cli@latest logout
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest project:info
```

Expected result: the logged-in user can access the owner/project shown by
`project:info`. An owner mismatch error means `owner` and `projectId` belong to
different Expo accounts. Do not keep changing IDs until it builds.

### 4.2 Apple Developer And App Store Connect

The Apple Account Holder should:

1. Finish organization verification, agreements, tax, and banking requirements.
2. Enable two-factor authentication.
3. Invite the release engineer in App Store Connect `Users and Access`.
4. Grant `App Manager` or `Admin` only when needed.
5. Grant Certificates, Identifiers, and Profiles access to the person managing
   signing. Individual Apple memberships have more limited team access than
   organization memberships.
6. Confirm the correct Apple team before EAS creates credentials.

For an existing app, the old Account Holder initiates App Transfer and the new
Account Holder accepts it. Complete Apple's current transfer eligibility checks
first. Record the recipient Team ID and App Store Connect Apple ID.

After an Apple transfer:

- create/use distribution credentials from the recipient Apple team;
- create a new APNs key or certificate under the recipient team and update the
  push provider/EAS credentials;
- verify associated domains, Sign in with Apple, Apple Pay, iCloud, keychain
  groups, and other entitlements separately;
- verify TestFlight groups and App Store metadata access.

### 4.3 Google Play Console

The Play Console owner should:

1. Complete identity/organization verification and required payments profile.
2. Enable two-factor authentication.
3. Invite developers through `Users and permissions`; do not share Gmail login.
4. Grant app-scoped Release Manager permissions where possible.
5. Confirm policy status and that no unresolved account warnings block release.

For an existing app, request an app transfer to the new developer account. Keep
the package name unchanged. Download historical reports before transfer because
some financial/reporting information does not move.

After a Google Play transfer:

- verify Play App Signing and the upload certificate;
- create a new Google Cloud service account for EAS Submit;
- grant that service account access to the transferred app in Play Console;
- verify Firebase, OAuth clients, Maps, Play Integrity, subscriptions, and other
  Google Cloud projects because they are not automatically the same as Play
  Console ownership;
- confirm internal testers and release tracks.

## 5. Credential Security Rules

- Never commit `.env`, `.p8`, `.p12`, `.mobileprovision`, `.jks`, `.keystore`, or
  Google service-account JSON files.
- Store recovery material in a company password manager with audit history.
- Keep at least two trusted account admins, but only one controlled release path.
- Record certificate/key name, owner, creation date, expiration, and usage. Do
  not record private key contents in this document.
- Reuse a valid Apple distribution certificate when appropriate. Apple limits
  active distribution certificates; do not revoke an unknown certificate during
  an interactive EAS prompt without checking which apps/CI jobs use it.
- Prefer Play App Signing. Back up the Android upload key securely.
- Rotate credentials immediately after staff departure or suspected compromise.

Credential inventory template:

| Credential | Account/team | Identifier | Expires | Storage owner | Rotation note |
| --- | --- | --- | --- | --- | --- |
| Apple distribution certificate |  |  |  |  |  |
| iOS provisioning profile |  |  |  |  |  |
| App Store Connect API key |  |  |  |  |  |
| APNs key |  |  |  |  |  |
| Android upload keystore |  |  |  |  |  |
| Google service account |  |  |  |  |  |
| Expo access token (CI only) |  |  |  |  |  |

## 6. Environment Configuration

Local `.env` files are not automatically available to remote EAS builds.
Configure EAS environments in the Expo dashboard or EAS CLI.

For Sai Family production, review at least:

```text
EXPO_PUBLIC_API_BASE_URL=https://saifamily.sustaininsight.com
EXPO_PUBLIC_ANALYTICS_ENABLED=true
EXPO_PUBLIC_MIXPANEL_TOKEN=<production-token>
EXPO_PUBLIC_MIXPANEL_SERVER_URL=https://api-in.mixpanel.com
EXPO_PUBLIC_MIXPANEL_DEBUG_LOGS=false
EXPO_PUBLIC_AI_VOICE_ENABLED=true
EXPO_PUBLIC_VOICE_AI_ENABLED=true
EXPO_PUBLIC_AI_VOICE_PROVIDER=elevenlabs
```

Important: every `EXPO_PUBLIC_*` value is embedded in the client and is not a
secret. Never put backend API keys, Apple private keys, ElevenLabs private keys,
database credentials, JWT secrets, or service-account JSON in an
`EXPO_PUBLIC_*` variable.

Inspect EAS variables:

```bash
npx eas-cli@latest env:list --environment development
npx eas-cli@latest env:list --environment preview
npx eas-cli@latest env:list --environment production
```

Maintain separate backend URLs and analytics projects for development and
production. A release engineer must verify the environment displayed by EAS at
the beginning of every build.

## 7. One-Time Project Configuration

1. Confirm `app.json` app name, slug, scheme, icon, and permissions.
2. Confirm immutable store identifiers.
3. Confirm `eas.json` profiles and `appVersionSource`.
4. Link the repository to the correct existing EAS project.
5. Configure EAS environment variables.
6. Configure signing credentials.
7. Create store app records and complete required store questionnaires.

Do not run `eas build:configure`, `eas init`, or accept a credential-generation
prompt blindly on an established production app. Review the generated diff and
the selected account/team first.

## 8. iOS Signing Setup

Run interactively on a trusted machine:

```bash
npx eas-cli@latest credentials --platform ios
```

1. Select the production profile.
2. Log in with the invited Apple account, not a shared owner password.
3. Select the correct Apple team.
4. Confirm the App ID matches the existing bundle ID.
5. Reuse a valid company distribution certificate or let EAS create one only
   after checking Apple's certificate limit.
6. Create/update the provisioning profile.
7. Configure push notification credentials.
8. Configure an App Store Connect API key for non-interactive submission/CI.

Record the App Store Connect numeric Apple ID in `eas.json` as `ascAppId` when
the team wants deterministic submissions. Never confuse it with bundle ID,
Apple Account email, Team ID, or EAS project ID.

## 9. Android Signing And Submit Setup

Run:

```bash
npx eas-cli@latest credentials --platform android
```

1. Select the production profile.
2. For an existing app, use its existing upload keystore/certificate. Do not
   generate an unrelated key.
3. For a new app, let EAS generate the upload keystore and enable Play App
   Signing during the first Play release.
4. Back up the keystore and passwords in the company password manager.
5. Create a Google Cloud service account for Play submission.
6. Enable Google Play Android Developer API where required.
7. Invite/grant the service account app-level release permissions in Play
   Console.
8. Upload the service-account JSON through EAS Credentials, then securely delete
   local temporary copies.

## 10. Pre-Release Quality Gate

Start from a reviewed release commit with a clean worktree:

```bash
git checkout main
git pull --ff-only
git status --short
npm ci
npx expo-doctor
npx tsc --noEmit
npm run lint
npx eas-cli@latest whoami
npx eas-cli@latest project:info
```

Do not release if tests/types/lint fail, credentials are uncertain, the worktree
contains unexplained changes, or production environment variables are missing.

Minimum device checks:

- fresh install, onboarding, login, logout, and persistent session;
- permissions denied/allowed flows;
- API authentication and media upload;
- push notification receipt and navigation;
- deep links;
- critical business flows;
- offline/slow-network/error states;
- crash-free cold start on supported iOS and Android versions;
- analytics and crash reporting in the production project;
- privacy deletion/support paths.

## 11. Development And Internal Builds

iOS development client:

```bash
npx eas-cli@latest build --platform ios --profile development-main \
  --message "Development validation before release"
```

Android development client:

```bash
npx eas-cli@latest build --platform android --profile development \
  --message "Development validation before release"
```

Install on registered devices and run Metro cleanly:

```bash
npx expo start --dev-client --clear
```

Android installable preview APK:

```bash
npx eas-cli@latest build --platform android --profile preview \
  --message "QA preview"
```

Internal builds are not store-production binaries. An iOS internal distribution
build also requires registered test devices/provisioning.

## 12. Production Build

Tag or record the exact release commit first:

```bash
git rev-parse HEAD
```

Build separately so a platform failure is easier to diagnose:

```bash
npx eas-cli@latest build --platform ios --profile production \
  --message "Production release X.Y.Z"

npx eas-cli@latest build --platform android --profile production \
  --message "Production release X.Y.Z"
```

Expected artifacts:

- iOS: signed `.ipa` for App Store Connect/TestFlight.
- Android: signed `.aab` for Google Play. APK is for device testing, not Play
  production submission.

Monitor builds:

```bash
npx eas-cli@latest build:list
```

Never submit merely because compilation succeeded. Install through TestFlight
and Play internal testing and execute the release checklist first.

## 13. Submit iOS To TestFlight And App Store

```bash
npx eas-cli@latest submit --platform ios --profile production --latest
```

Then in App Store Connect:

1. Wait for build processing and export-compliance checks.
2. Add the build to an internal TestFlight group.
3. Run smoke/regression testing.
4. For external testing, provide beta review information and submit for beta
   review when required.
5. Complete app description, keywords, screenshots, support URL, privacy policy,
   age rating, App Privacy, pricing/availability, review notes, and demo login.
6. Select the tested build for the App Store version.
7. Choose manual, automatic, or phased release according to release approval.
8. Submit for App Review.

Uploading to TestFlight does not publish the app to the App Store.

## 14. Submit Android To Play Console

```bash
npx eas-cli@latest submit --platform android --profile production --latest
```

For a new app, ensure the Play Console app record and service-account access are
ready first. Start on internal testing.

In Play Console complete:

1. Main store listing, screenshots, icon, feature graphic, contact details.
2. Privacy policy, Data safety, App access/demo credentials, Ads declaration,
   content rating, target audience, news/health/financial declarations if
   applicable.
3. Internal testing and automated pre-launch report.
4. Closed/open testing requirements shown for the account type.
5. Countries/regions, pricing, and managed publishing decision.
6. Production release notes and staged rollout percentage.

Promote the same tested artifact through tracks when possible. Do not rebuild
between final QA and production unless the rebuild is tested again.

## 15. Post-Release Monitoring

For at least 24-72 hours:

- watch App Store Connect and Play Console crash/ANR dashboards;
- watch Crashlytics/native crash reporting and backend error rates;
- verify login, push, deep links, media, payments (if any), and critical APIs;
- verify analytics events and release version/build dimensions;
- monitor reviews/support messages;
- record rollout percentage, build IDs, commit SHA, and approver.

Release record template:

```text
App/version:
Git commit/tag:
EAS iOS build ID:
EAS Android build ID:
App Store Connect build:
Play version code:
Environment verified by:
QA approved by:
Release approved by:
Rollout started:
Rollout completed:
Known issues:
```

## 16. Rollback And Hotfix

- Stop or pause staged rollout when the store supports it.
- If a bad build is already released, prepare a higher build number/version code;
  stores do not accept replacing a released binary with the same number.
- Use EAS Update only when the project has a reviewed `runtimeVersion`, update
  channels, and rollback policy. Native-module, permission, entitlement, or
  dependency changes require a new store binary.
- Disable a dangerous server-side feature with a controlled feature flag when
  available; do not silently break older app versions.
- Preserve logs and write a short incident review after recovery.

## 17. Common Failures

### Expo owner does not match EAS project owner

`expo.owner` and `extra.eas.projectId` refer to different Expo accounts/projects.
Log in to the correct account or transfer/link the existing project. Do not
create random project IDs.

### Apple maximum distribution certificates reached

Do not revoke one blindly. Identify which certificate is held by EAS/CI and
which apps use it. Reuse a valid certificate or have the Apple Account Holder
revoke an obsolete one after verification.

### iOS internal build has no suitable credentials

Run interactively so Apple credentials and device provisioning can be created,
or provide reviewed local credentials. Non-interactive builds cannot invent
missing internal-distribution credentials.

### Google service account permission denied

Confirm the service account is added in Play Console, has permission for the
specific app, the API is enabled, and EAS stores the matching JSON key.

### Package/bundle identifier already exists

For an existing published app, transfer/access the existing record. Do not alter
the identifier to bypass ownership, because existing users will not receive it
as an update.

### Build uses local/development API URL

EAS did not receive the intended production environment. Stop submission,
correct EAS environment variables/profile mapping, and rebuild.

## 18. Junior Developer Release Checklist

- [ ] Release ticket and approved commit are recorded.
- [ ] Correct Git, Expo, Apple, and Google accounts are confirmed.
- [ ] Store identifiers match existing records.
- [ ] EAS project owner/project ID match.
- [ ] Production environment variables are reviewed without exposing secrets.
- [ ] TypeScript, lint, tests, and Expo Doctor pass.
- [ ] Development/internal builds pass device testing.
- [ ] Production IPA/AAB build succeeds.
- [ ] TestFlight and Play internal track testing pass.
- [ ] Store metadata, privacy forms, screenshots, and review access are complete.
- [ ] Release approver authorizes submission/rollout.
- [ ] Staged rollout and monitoring are active.
- [ ] Release record and credential inventory are updated.

## 19. Organization Policy For Future Apps

1. Create source repository, Expo project, Apple app, Google Play app, analytics,
   backend environments, and credentials under organization-owned accounts.
2. Use unique reverse-domain identifiers owned by the company, for example
   `com.company.product`.
3. Separate development, preview/staging, and production environments.
4. Require pull-request review and a release approval.
5. Automate builds only after manual release steps are proven and documented.
6. Keep signing and store ownership independent from any one employee.
7. Review this runbook every quarter and after major Expo/store policy changes.
