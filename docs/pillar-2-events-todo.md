# Pillar 2 Events Todo

## Status

- Current pillar: Events
- Parent UI entry: `app/(tabs)/events.tsx`
- Current next step: Todo 2, implement Events API service and saga workers

## Todo List

### 1. Create File Structure

Status: Completed

- [x] Create `services/events.ts`
- [x] Create `store/events/types.ts`
- [x] Create `store/events/actions.ts`
- [x] Create `store/events/reducer.ts`
- [x] Create `store/events/saga.ts`
- [x] Create `store/events/selectors.ts`
- [x] Create `store/events/index.ts`
- [x] Connect `eventsReducer` to `store/root-reducer.ts`
- [x] Connect `eventsSaga` to `store/root-saga.ts`
- [x] Add route placeholder `app/events/[id].tsx`
- [x] Add route placeholder `app/events/create.tsx`
- [x] Add route placeholder `app/events/calendar.tsx`
- [x] Add route placeholder `app/events/my-events.tsx`
- [x] Add route placeholder `app/events/rsvps.tsx`

### 2. Implement Events API Service And Saga

Status: Next

- [ ] Normalize event API response shapes
- [ ] Implement `GET /api/events`
- [ ] Implement `GET /api/events/:id`
- [ ] Implement `POST /api/events`
- [ ] Implement `PATCH /api/events/:id`
- [ ] Implement `DELETE /api/events/:id`
- [ ] Implement `POST /api/events/:id/rsvp`
- [ ] Implement `DELETE /api/events/:id/rsvp`
- [ ] Implement `GET /api/users/me/rsvps`
- [ ] Implement `GET /api/users/me/events`
- [ ] Implement `GET /api/events/calendar?month=YYYY-MM`
- [ ] Implement `GET /api/events/:id/comments`
- [ ] Implement `POST /api/events/:id/comments`
- [ ] Implement `POST /api/media/upload`

### 3. Frontend Validation

Status: Pending

- [ ] Validate title min 3 characters
- [ ] Validate description min 10 characters
- [ ] Validate start and end date/time
- [ ] Validate `endAt >= startAt`
- [ ] Validate address min 5 characters
- [ ] Validate latitude range `-90..90`
- [ ] Validate longitude range `-180..180`
- [ ] Validate event type enum
- [ ] Validate comment content 1-1000 characters
- [ ] Validate banner upload MIME type

### 4. Parent Events UI

Status: Pending

- [ ] Upgrade `app/(tabs)/events.tsx` from placeholder to Events hub
- [ ] Add discovery feed section
- [ ] Add event type filters
- [ ] Add quick actions for create, calendar, RSVPs, and my events
- [ ] Add loading, empty, and error states

### 5. Event Screens

Status: Pending

- [ ] Build event detail screen
- [ ] Build create event screen
- [ ] Build edit event flow
- [ ] Build my RSVPs screen
- [ ] Build my events screen
- [ ] Build calendar screen
- [ ] Build event comments section

### 6. RSVP And Comments

Status: Pending

- [ ] Add RSVP button states
- [ ] Add cancel RSVP behavior
- [ ] Show RSVP count
- [ ] Load event comments
- [ ] Add comment input
- [ ] Add comment submit loading and error states

### 7. Media Upload

Status: Pending

- [ ] Add event banner picker
- [ ] Upload banner through `POST /api/media/upload`
- [ ] Use returned URL as `bannerUrl`
- [ ] Add upload progress/loading state

### 8. Backend Testing

Status: Pending

- [ ] Test event discovery
- [ ] Test event create
- [ ] Test event update
- [ ] Test event delete
- [ ] Test RSVP and cancel RSVP
- [ ] Test my RSVPs
- [ ] Test my events
- [ ] Test calendar endpoint
- [ ] Test comments
- [ ] Test media upload

## Backend Validation Notes

- JSON endpoints need `Content-Type: application/json`
- Auth endpoints need `x-user-id`
- Event `type` must be one of `bhajan`, `pooja`, `seva`, `medical`, `satsang`, `darshan`, `general`
- `endAt` must not be before `startAt`
- Event comments must be non-empty and max 1000 characters
- Media upload accepts `file` or `files`, max 10 files, max 150MB each
