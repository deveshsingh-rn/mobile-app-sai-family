# EAS Main/Develop Account Strategy

## Goal

Use one codebase with two clean build lanes:

- `main` -> production Expo account/org -> App Store/TestFlight
- `develop` -> development Expo account/org -> internal testing

This keeps Apple/Google identifiers, credentials, push notifications, and EAS projects separate.

## App Variants

The app uses `APP_VARIANT` from `eas.json`.

| EAS profile | APP_VARIANT | App name | iOS bundle id | Android package |
| --- | --- | --- | --- | --- |
| `production` | `production` | `Sai Family` | `com.deveshrn.saifamily` | `com.deveshrn.saifamily` |
| `development` | `development` | `Sai Family Dev` | `com.deveshrn.saifamily.dev` | `com.deveshrn.saifamily.dev` |
| `preview` | `development` | `Sai Family Dev` | `com.deveshrn.saifamily.dev` | `com.deveshrn.saifamily.dev` |

Config source:

- `app.config.js`
- `eas.json`

## EAS Project IDs

| Variant | EAS project id |
| --- | --- |
| Production | `d751b428-eab5-47a0-8ed0-4782b79d0e40` |
| Development | `9bac67f9-6593-4c9b-b54f-f9cec26f2dda` |

## Production Account

Use on `main`.

```bash
git checkout main
eas whoami
eas build -p ios --profile production
eas build -p android --profile production
```

Production keeps the current EAS project id from `app.json`.

## Development Account

Use on `develop`.

```bash
git checkout develop
eas login
eas init
eas build -p ios --profile development
eas build -p android --profile preview
```

Important: the development Expo account/org uses its own EAS project id through `app.config.js`.
Do not reuse the production project id in the development account.

## Rules

- Do not use `com.deveshrn.saifamily` outside production.
- Do not use the same push credentials between prod and dev.
- Do not submit `.dev` builds to the real App Store listing.
- Keep native dependency changes grouped before cloud builds.
- Use local Metro/dev client for UI-only work where possible.

## Validation Commands

Production config:

```bash
APP_VARIANT=production npx expo config --type public
```

Development config:

```bash
APP_VARIANT=development npx expo config --type public
```

Check these values before building:

- `name`
- `slug`
- `scheme`
- `ios.bundleIdentifier`
- `android.package`
- `extra.appVariant`
