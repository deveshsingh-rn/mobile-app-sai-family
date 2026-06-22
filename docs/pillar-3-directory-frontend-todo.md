# Pillar 3 Directory Frontend Todo

Source API collection: `postman-api-collection.json`, folder `Directory API`
Backend status: `/Users/developer/Desktop/backend-sai-family/docs/pillar-3-directory-todo.md`
Frontend root: `app/(tabs)/directory.tsx`
Directory routes: `app/directory/*`

## Current Status

- Backend Directory APIs are present in Postman.
- Current Directory UI is polished but static.
- Frontend Directory Redux/Saga module is created and wired globally.
- Goal is the same as Events: API-backed data first, then remove static UI data after each screen has loading, error, empty, and success states.

## API Coverage From Postman

### Public Discovery

- [x] `GET /api/directory/categories`
- [x] `GET /api/directory/home`
- [x] `GET /api/directory/listings`
- [x] `GET /api/directory/listings/:id`
- [x] `GET /api/directory/search`
- [x] `GET /api/directory/search/suggestions`

### User Search

- [x] `GET /api/users/me/directory/recent-searches`
- [x] `POST /api/users/me/directory/recent-searches`
- [x] `DELETE /api/users/me/directory/recent-searches`

### Listing Management

- [x] `POST /api/directory/listings`
- [x] `PATCH /api/directory/listings/:id`
- [x] `DELETE /api/directory/listings/:id`
- [x] `GET /api/users/me/directory/listings`
- [ ] `POST /api/directory/listing-drafts` (not used after removing autosave)
- [ ] `PATCH /api/directory/listing-drafts/:id` (not used after removing autosave)
- [ ] `POST /api/directory/listing-drafts/:id/publish`
- [x] `POST /api/media/upload` with `context=directory`

### Trust And Actions

- [x] `POST /api/directory/listings/:id/bookmark`
- [x] `DELETE /api/directory/listings/:id/bookmark`
- [x] `GET /api/users/me/directory/bookmarks`
- [x] `POST /api/directory/listings/:id/recommend`
- [x] `DELETE /api/directory/listings/:id/recommend`
- [x] `POST /api/directory/listings/:id/contact`
- [x] `POST /api/directory/listings/:id/share`
- [x] `POST /api/directory/listings/:id/view`
- [x] `POST /api/directory/listings/:id/report`

### Reviews

- [x] `GET /api/directory/listings/:id/reviews`
- [x] `POST /api/directory/listings/:id/reviews`
- [x] `PATCH /api/directory/reviews/:id`
- [x] `DELETE /api/directory/reviews/:id`
- [x] `POST /api/directory/reviews/:id/vote`
- [x] `DELETE /api/directory/reviews/:id/vote`

## Frontend Phases

### Phase 0: Contract Audit

Status: In progress

- [x] Review Directory Postman folder.
- [x] Review backend Directory todo.
- [x] Review current Directory UI routes and screens.
- [ ] Record real response shapes from backend smoke output if available.
- [ ] Confirm media flow remains upload-first, JSON listing create/update with media URLs.
- [ ] Confirm create listing default status is `pending_review`.
- [ ] Confirm review gating behavior from backend response: `canReview` and `reviewGateReason`.

### Phase 1: Module Foundation

Status: Completed

- [x] Create `services/directory.ts`.
- [x] Create `store/directory/types.ts`.
- [x] Create `store/directory/actions.ts`.
- [x] Create `store/directory/reducer.ts`.
- [x] Create `store/directory/saga.ts`.
- [x] Create `store/directory/selectors.ts`.
- [x] Create `store/directory/validation.ts`.
- [x] Create `store/directory/index.ts`.
- [x] Connect `directoryReducer` to `store/root-reducer.ts`.
- [x] Connect `directorySaga` to `store/root-saga.ts`.
- [x] Add `DirectoryAction` to `store/types.ts`.

### Phase 2: Directory Home

- [x] Fetch categories on Directory home.
- [x] Fetch home aggregation.
- [x] Replace static category grid.
- [x] Replace featured businesses.
- [x] Replace devotees near you.
- [x] Add pull-to-refresh.
- [x] Keep empty states when backend returns empty.
- [x] Remove static fallback only after API is stable.

### Phase 3: Category And Search

- [x] Wire category screen to `GET /api/directory/listings`.
- [x] Wire search input to search and suggestions.
- [x] Wire recent searches.
- [x] Wire clear recent searches.
- [x] Wire popular categories.
- [x] Wire trending listings.
- [x] Add pagination.

### Phase 4: Business Detail

- [x] Fetch listing detail by ID.
- [x] Track view on open.
- [x] Wire bookmark button.
- [x] Wire share button.
- [x] Wire call/WhatsApp/enquiry contact tracking.
- [x] Wire recommend CTA.
- [x] Wire report listing CTA.
- [x] Wire recent work gallery.
- [x] Wire owner summary.
- [x] Wire similar listings if exposed.

### Phase 5: Create Listing

- [x] Validate multi-step form locally.
- [x] Upload images through `POST /api/media/upload` with `context=directory`.
- [x] Submit listing JSON with `logoUrl`, `bannerUrl`, `galleryUrls`.
- [x] Remove draft autosave so APIs run only on final submit.
- [ ] Add draft publish flow if product wants publish-from-draft instead of direct submit.
- [x] Add success screen or navigate to My Listings/detail.

### Phase 6: Reviews

- [x] Fetch review summary and list.
- [x] Wire filters: all, highest, lowest.
- [x] Show `canReview` and `reviewGateReason`.
- [x] Create review when backend allows.
- [x] Wire helpful/not helpful vote.
- [x] Add edit/delete own review later if product exposes it.

### Phase 7: Saved And My Listings

- [x] Create saved listings route/screen if needed.
- [x] Create my listings route/screen if needed.
- [x] Wire owner listing statuses: pending, published, rejected, suspended.
- [x] Add edit owner action after create listing supports edit-mode hydration.
- [x] Add delete owner action.

### Phase 8: Hardcoded Data Removal

- [x] Audit static arrays in Directory files.
- [x] Replace static arrays with selectors.
- [x] Keep only intentional empty states.
- [x] Verify no production user flow depends on sample data.

Audit notes:

- No sample business, category, review, or listing arrays are currently driving Directory production UI.
- Remaining constants are UI-only: icon/color mappings, form step labels, filter labels, contact action labels, and empty-state copy.
- Directory data flows now come from Redux selectors backed by Directory APIs, with intentional fallbacks only for missing fields or empty states.

### Phase 9: Manual QA

- [ ] Directory home loads backend data.
- [ ] Category browsing works.
- [ ] Search works.
- [ ] Recent searches work.
- [ ] Create listing works with media.
- [ ] Detail opens from cards with correct ID.
- [ ] Bookmark/recommend/contact/share/view/report work.
- [ ] Reviews load and vote works.
- [ ] Empty, loading, error states look polished.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run lint` passes.

## Immediate Next Step

Start with Phase 1 module foundation. Do not change the polished UI yet.
