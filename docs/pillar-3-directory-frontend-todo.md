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

- [ ] `GET /api/directory/categories`
- [ ] `GET /api/directory/home`
- [ ] `GET /api/directory/listings`
- [ ] `GET /api/directory/listings/:id`
- [ ] `GET /api/directory/search`
- [ ] `GET /api/directory/search/suggestions`

### User Search

- [ ] `GET /api/users/me/directory/recent-searches`
- [ ] `POST /api/users/me/directory/recent-searches`
- [ ] `DELETE /api/users/me/directory/recent-searches`

### Listing Management

- [ ] `POST /api/directory/listings`
- [ ] `PATCH /api/directory/listings/:id`
- [ ] `DELETE /api/directory/listings/:id`
- [ ] `GET /api/users/me/directory/listings`
- [ ] `POST /api/directory/listing-drafts`
- [ ] `PATCH /api/directory/listing-drafts/:id`
- [ ] `POST /api/directory/listing-drafts/:id/publish`
- [ ] `POST /api/media/upload` with `context=directory`

### Trust And Actions

- [ ] `POST /api/directory/listings/:id/bookmark`
- [ ] `DELETE /api/directory/listings/:id/bookmark`
- [ ] `GET /api/users/me/directory/bookmarks`
- [ ] `POST /api/directory/listings/:id/recommend`
- [ ] `DELETE /api/directory/listings/:id/recommend`
- [ ] `POST /api/directory/listings/:id/contact`
- [ ] `POST /api/directory/listings/:id/share`
- [ ] `POST /api/directory/listings/:id/view`
- [ ] `POST /api/directory/listings/:id/report`

### Reviews

- [ ] `GET /api/directory/listings/:id/reviews`
- [ ] `POST /api/directory/listings/:id/reviews`
- [ ] `PATCH /api/directory/reviews/:id`
- [ ] `DELETE /api/directory/reviews/:id`
- [ ] `POST /api/directory/reviews/:id/vote`
- [ ] `DELETE /api/directory/reviews/:id/vote`

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
- [ ] Remove static fallback only after API is stable.

### Phase 3: Category And Search

- [x] Wire category screen to `GET /api/directory/listings`.
- [ ] Wire search input to search and suggestions.
- [ ] Wire recent searches.
- [ ] Wire clear recent searches.
- [ ] Wire popular categories.
- [ ] Wire trending listings.
- [ ] Add pagination.

### Phase 4: Business Detail

- [ ] Fetch listing detail by ID.
- [ ] Track view on open.
- [ ] Wire bookmark button.
- [ ] Wire share button.
- [ ] Wire call/WhatsApp/enquiry contact tracking.
- [ ] Wire recommend CTA.
- [ ] Wire recent work gallery.
- [ ] Wire owner summary.
- [ ] Wire similar listings if exposed.

### Phase 5: Create Listing

- [ ] Validate multi-step form locally.
- [ ] Upload images through `POST /api/media/upload` with `context=directory`.
- [ ] Submit listing JSON with `logoUrl`, `bannerUrl`, `galleryUrls`.
- [ ] Add draft create/update autosave.
- [ ] Add draft publish flow.
- [ ] Add success screen or navigate to My Listings/detail.

### Phase 6: Reviews

- [ ] Fetch review summary and list.
- [ ] Wire filters: all, highest, lowest.
- [ ] Show `canReview` and `reviewGateReason`.
- [ ] Create review when backend allows.
- [ ] Wire helpful/not helpful vote.
- [ ] Add edit/delete own review later if product exposes it.

### Phase 7: Saved And My Listings

- [ ] Create saved listings route/screen if needed.
- [ ] Create my listings route/screen if needed.
- [ ] Wire owner listing statuses: pending, published, rejected, suspended.
- [ ] Add edit/delete owner actions.

### Phase 8: Hardcoded Data Removal

- [ ] Audit static arrays in Directory files.
- [ ] Replace static arrays with selectors.
- [ ] Keep only intentional empty states.
- [ ] Verify no production user flow depends on sample data.

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
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run lint` passes.

## Immediate Next Step

Start with Phase 1 module foundation. Do not change the polished UI yet.
