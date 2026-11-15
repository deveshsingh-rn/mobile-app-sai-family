# CLAUDE.md — Sai Family (mobile app)

Rules for Claude (and any AI agent) working in this repo. These override default behaviour.
Backend lives in `/Users/developer/Desktop/backend-sai-family`; its `CLAUDE.md` has the full rule set.

## 1. Production data and users — NEVER damage

> Ek line mein: production ka data aur live users ko kabhi nuksaan nahi.

- `.env` `EXPO_PUBLIC_API_BASE_URL` and `app.json` `extra.apiBaseUrl` point to the **production API** (`https://saifamily.sustaininsight.com`).
  Any test that creates/deletes posts, accounts, listings, events or messages hits real data. Use a local/staging backend for destructive testing, or ask Devesh first.
- Never run `eas build`, `eas submit`, `eas update` (OTA to live users) or change `eas.json` channels without explicit approval.
- Never delete AsyncStorage/SecureStore keys in a migration without a fallback for existing installs.
- Never commit secrets: `*.p12`, `credentials.json`, `saikifamily-*.json`, `.env`. Never commit or push unless asked.

## 2. Document everything

Every change gets an entry in the shared panel workspace (local only, not in git):

```
/Users/developer/Desktop/backend-sai-family/engineering-panel/app-docs/
```

- `app-docs/CHANGELOG.md` — date, area (`mobile`), what, why, files, how to verify, rollback.
- `app-docs/modules/<module>.md` — screens, store slice, API calls, navigation.

## 3. Panel-first for every feature

Follow `/Users/developer/Desktop/backend-sai-family/engineering-panel/00-PANEL-CHARTER.md`:
panel discussion → final decision → HLD/LLD → Devesh approval → implement → document.

## 4. Scale and smoothness target

50,000 MAU, mid-range Android on 4G must feel smooth:
- Long lists use `@shopify/flash-list`, never `ScrollView` + `.map` for feeds/comments/chat.
- Images via `expo-image` with sized thumbnails; compress before upload.
- Paginate everything; no polling loops without backoff; no duplicate requests on focus.
- Memoized selectors; don't copy the same entity into many slices.

## 5. Repo facts

- Expo 54, RN 0.81 (new arch, React Compiler), expo-router, Redux + redux-saga, axios (`services/api.ts`).
- Routes in `app/`, UI in `screens/` + `components/`, API in `services/`, state in `store/<feature>/`.
- Real store root: `store/index.ts` → `root-reducer.ts`, `root-saga.ts`. (`store/rootReducer.ts`, `store/rootSaga.ts`, `store/devotee-account/jjjjjjj.ts` are dead files.)
- Checks: `npx tsc --noEmit`, `node --test utils/*.test.mjs`.
