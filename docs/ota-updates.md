# OTA updates (EAS Update)

Last updated: 2026-11-27

A JS-only change reaches installed apps without a store release. That covers screens, logic, text, and images imported in code.

```bash
npm run ota -- "Fix event date format"           # production builds (App Store / Play Store)
npm run ota:preview -- "Try new card"            # preview (internal) builds only
```

The app checks for an update on every launch. It downloads the update in the background and applies it on the **next** launch.

## Compatibility rule

- `runtimeVersion` uses the `appVersion` policy. An update reaches only builds with the same `version` as in `app.json` (now `1.1.0`).
- **Native change → bump the version + store build.** Native changes include:
  - a new native package;
  - an Expo SDK upgrade;
  - the icon or splash;
  - permissions;
  - native settings in `app.json` / `app.config.js`.
- Never publish an OTA update across a native change.
- Channels (from `eas.json`): store builds use `production`; `preview` builds use `preview`; dev clients use `development`.

## Rollback

```bash
npx eas-cli update:list --branch production         # find the bad update group
npx eas-cli update:rollback                         # interactive: roll back to the previous update or to the store build
```

Or republish the previous good commit: `git checkout <good-commit> && npm run ota -- "Rollback"`.

## Plan and cost

- The production project's Expo account is on the **Free plan**: **1,000 monthly users who download an update**.
- Above that, the other users keep running their current version; they are not broken, they just do not get the update.
- When the app has more monthly users than that, upgrade to Starter ($19 + $0.005 per extra user), or move to the GCP setup below.
- Estimate: 20,000 MAU on Starter = 19 + (20,000 − 3,000) × 0.005 ≈ **$104/month**.

## Later: GCP (Hot Updater on Firebase)

Prepared but not active: `docs/devops-ota-setup.md` has the DevOps steps. Moving means:

1. removing `expo-updates`;
2. adding Hot Updater;
3. making a new store build.

The two systems must not be installed together, because both replace the app's JS bundle loader.

## Apple / Google rules

Use OTA for bug fixes and small improvements, not to change the app's main purpose (App Store Review Guidelines 2.5.2 / 3.3.1(b)).
