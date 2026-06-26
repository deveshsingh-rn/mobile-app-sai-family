# iOS Expo EAS Deployment Steps

This document records the deployment preparation steps for the Sai Family Expo app.

## Current App Identity

- Expo owner: `devesh-rn`
- Expo account email: `devesh.singh@fundenflo.com`
- Apple ID: `devesh7664@gmail.com`
- iOS bundle identifier: `com.deveshrn.saifamily`
- App version: `1.0.0`
- EAS project ID: `d751b428-eab5-47a0-8ed0-4782b79d0e40`

## Important Production Note

The current API base URL in `app.json` is:

```txt
http://192.168.1.7:4000
```

This is a local/private network URL. It can work during development on the same network, but it will not work for TestFlight or App Store users.

Before a real production release, replace it with a public HTTPS backend URL, preferably through an EAS environment variable:

```txt
EXPO_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

The app reads the API URL in this order:

1. `EXPO_PUBLIC_API_BASE_URL`
2. `expo.extra.apiBaseUrl` from `app.json`
3. Fallback value inside `services/api.ts`

## Preflight Checks Already Run

### 1. Confirm Expo Config

Command:

```bash
npx expo config --type public
```

Verified:

- Owner is `devesh-rn`
- iOS bundle identifier is `com.deveshrn.saifamily`
- EAS project ID is configured
- Expo SDK resolves correctly

### 2. Check Expo Login

Command:

```bash
npx eas-cli@latest whoami
```

Result:

```txt
devesh-rn
devesh.singh@fundenflo.com
```

### 3. Run Lint

Command:

```bash
npm run lint
```

Result: passed.

### 4. Run TypeScript Check

Command:

```bash
npx tsc --noEmit
```

Result: passed.

### 5. Run Project Verifier

Command:

```bash
npm run verify
```

Result: passed.

Warning:

```txt
Could not reach backend at http://192.168.1.7:4000
```

This is expected if the backend is not running or not reachable from the machine/network.

## Start Production iOS Build

Command:

```bash
npx eas-cli@latest build --platform ios --profile production
```

Expected config from `eas.json`:

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

During the build, EAS will:

1. Resolve the production build profile.
2. Auto-increment the iOS build number.
3. Use Expo remote iOS credentials if they already exist.
4. Ask whether to log in to Apple if credentials need to be generated or validated.

When prompted:

```txt
Do you want to log in to your Apple account?
```

Choose:

```txt
Y
```

Apple ID:

```txt
devesh7664@gmail.com
```

Then enter the Apple ID password and complete two-factor authentication directly in your terminal.

Do not paste the Apple password into chat or commit it anywhere.

## Current Build Attempt Status

An interactive build was started, but it reached the Apple password prompt. That step must be completed directly by the Apple account owner.

A non-interactive build was also tested with:

```bash
npx eas-cli@latest build --platform ios --profile production --non-interactive
```

Result:

```txt
Failed to set up credentials.
Credentials are not set up. Run this command again in interactive mode.
```

EAS did confirm it is using Expo remote iOS credentials, but the distribution certificate could not be validated in non-interactive mode.

The remote iOS build number was auto-incremented during attempts:

```txt
3 -> 4
```

Next required step:

```bash
npx eas-cli@latest build --platform ios --profile production
```

Use Apple ID:

```txt
devesh7664@gmail.com
```

Complete password and two-factor authentication in the terminal.

## Fix: Missing Apple Bundle ID

Latest build error:

```txt
Failed to create Apple provisioning profile
Failed to set up credentials.
Failed to find Bundle ID item with identifier "com.deveshrn.saifamily"
```

Meaning:

The Apple distribution certificate exists, but Apple Developer does not yet have an App Identifier registered for:

```txt
com.deveshrn.saifamily
```

Fix this in Apple Developer:

1. Open Apple Developer:

   ```txt
   https://developer.apple.com/account/resources/identifiers/list
   ```

2. Sign in with Apple ID:

   ```txt
   devesh7664@gmail.com
   ```

3. Click `+`.
4. Select `App IDs`.
5. Select `App`.
6. Description:

   ```txt
   Sai Family
   ```

7. Bundle ID type:

   ```txt
   Explicit
   ```

8. Bundle ID:

   ```txt
   com.deveshrn.saifamily
   ```

9. Enable capabilities needed by the app:

   ```txt
   Push Notifications
   ```

   Keep other capabilities disabled unless the app specifically uses them.

10. Register the identifier.

After registering the Bundle ID, rerun:

```bash
npx eas-cli@latest build --platform ios --profile production
```

When prompted:

```txt
Reuse this distribution certificate?
```

Choose:

```txt
yes
```

When prompted:

```txt
Generate a new Apple Provisioning Profile?
```

Choose:

```txt
yes
```

EAS should then create a provisioning profile for `com.deveshrn.saifamily`.

## Submit Build to App Store Connect

After the EAS build succeeds, submit it with:

```bash
npx eas-cli@latest submit --platform ios --profile production
```

If EAS asks for Apple login again, use:

```txt
devesh7664@gmail.com
```

## Recommended Release Checklist

- Confirm final bundle identifier before first App Store upload.
- Replace local API URL with public HTTPS production API.
- Confirm app icon and splash screen are final.
- Confirm microphone, speech recognition, location, and notification permission text is accurate.
- Confirm Apple Developer account has an active paid membership.
- Confirm App Store Connect app exists for `com.deveshrn.saifamily`, or allow EAS to create/register it if prompted.
- Test with a production-like backend before submitting for review.
- Upload to TestFlight before App Store review.

## Useful Commands

Check current Expo login:

```bash
npx eas-cli@latest whoami
```

Inspect resolved Expo config:

```bash
npx expo config --type public
```

Start iOS production build:

```bash
npx eas-cli@latest build --platform ios --profile production
```

List recent EAS builds:

```bash
npx eas-cli@latest build:list --platform ios
```

Submit latest iOS build:

```bash
npx eas-cli@latest submit --platform ios --profile production
```
