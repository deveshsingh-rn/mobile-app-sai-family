


# Pillar 3 Directory API Requirements

Source UI routes:

- `app/(tabs)/directory.tsx`
- `app/directory/business-details.tsx`
- `app/directory/business-review.tsx`
- `app/directory/business-search.tsx`
- `app/directory/category.tsx`
- `app/directory/create-listing.tsx`

Source UI screens:

- `screens/business-details.tsx`
- `screens/business-category-screen.tsx`
- `screens/business-search-screen.tsx`
- `screens/bussiness-review-screen.tsx`
- `screens/create-listing.tsx`

## Product Goal

Pillar 3 is the Sai Directory: a trusted community marketplace where devotees can discover services, list their own businesses, contact providers, recommend trustworthy businesses, and review verified experiences.

The Directory should feel community-first, not like a generic classifieds app. Trust signals, devotee identity, verification, recommendations, and moderation are core product requirements.

## Current UI Flow Review

### Directory Home

Route: `app/(tabs)/directory.tsx`

Visible product areas:

- Header: Sai Directory
- Add listing button
- Search box
- Filter/options button
- Category grid
- Featured Businesses horizontal carousel
- Devotees Near You vertical cards
- Business detail navigation
- Category navigation
- Search screen navigation

Backend needs:

- Home aggregation API.
- Categories API.
- Featured listings API.
- Nearby listings API.
- Search/filter metadata.
- Saved/bookmarked state per listing.

### Category Listing

Route: `app/directory/category.tsx`

Visible product areas:

- Category title and listing count
- Category-specific business cards
- Verified badge
- Rating
- Distance
- Tags
- Business detail navigation

Backend needs:

- Category detail/listing API.
- Listing pagination.
- Sorting and filtering.
- Location-aware distance support.

### Business Search

Route: `app/directory/business-search.tsx`

Visible product areas:

- Search input
- Recent searches
- Clear recent searches
- Popular categories
- Trending this week

Backend needs:

- Full-text search.
- Recent search persistence per user.
- Popular categories.
- Trending listings/searches.
- Search suggestions/autocomplete.

### Business Detail

Route: `app/directory/business-details.tsx`

Visible product areas:

- Banner image
- Business logo
- Bookmark button
- Share button
- Business title and tagline
- Verified status
- Recommendation/endorsement count
- Rating and review count
- Specialties
- Description with read more
- Contact actions: call, WhatsApp, enquiry
- Owner card
- Owner devotee badge/member since
- Response time
- Community trust section
- Recommend business CTA
- Recent work gallery
- Reviews navigation

Backend needs:

- Listing detail API with rich fields.
- Bookmark/unbookmark.
- Share tracking.
- Contact/enquiry tracking.
- Recommendation/endorsement API.
- Recent work/gallery API.
- Review summary and reviews API.
- Owner/devotee profile summary.

### Create Listing

Route: `app/directory/create-listing.tsx`

Visible form steps:

- Step 1 Identity:
  - business name
  - category
  - tagline
- Step 2 Details:
  - description
  - years of experience
  - home service available
- Step 3 Contact:
  - phone number
  - WhatsApp number
  - address
  - city
- Step 4 Media:
  - up to 4 image upload slots
  - community recommendation enabled toggle
  - submit listing

Backend needs:

- Create listing API.
- Update draft listing API or save-progress API.
- Media upload API for images.
- Category validation.
- Listing moderation workflow.
- Listing owner permission model.

### Reviews And Ratings

Route: `app/directory/business-review.tsx`

Visible product areas:

- Review summary rating
- Rating distribution bars
- Verified reviews only notice
- Send enquiry first gating
- Review filters: all, highest rated, lowest rated
- Review list
- Reviewer devotee identity
- Reviewer location
- Star rating
- Review content
- Helpful vote
- Not helpful vote

Backend needs:

- Review summary API.
- Review list API.
- Create review API gated by enquiry/verified interaction.
- Helpful/not helpful vote API.
- Review moderation/reporting.
- Sort/filter support.

## Recommended Frontend Module Structure

Follow the same module pattern used for Events:

```txt
services/directory.ts
store/directory/types.ts
store/directory/actions.ts
store/directory/reducer.ts
store/directory/saga.ts
store/directory/selectors.ts
store/directory/validation.ts
store/directory/index.ts
```

Recommended screen-level routes already exist:

```txt
app/(tabs)/directory.tsx
app/directory/_layout.tsx
app/directory/business-details.tsx
app/directory/business-review.tsx
app/directory/business-search.tsx
app/directory/category.tsx
app/directory/create-listing.tsx
```

## Core Domain Models

### Directory Category

```ts
type DirectoryCategory = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  iconFamily?: string | null;
  color?: string | null;
  listingCount: number;
  isActive: boolean;
  sortOrder: number;
};
```

Required seed categories from current UI:

- Healthcare
- Education
- Technology
- Retail
- Food
- Services
- Spiritual Goods
- Real Estate

Optional future categories from search UI:

- Temples
- Organic
- Yoga Centers
- Spiritual Retreats

### Business Listing

```ts
type BusinessListing = {
  id: string;
  ownerUserId: string;
  ownerMemberId?: string | null;
  ownerName: string;
  ownerAvatarUrl?: string | null;
  ownerDevoteeBadge?: string | null;
  ownerMemberSince?: string | null;

  businessName: string;
  slug: string;
  tagline?: string | null;
  description: string;
  categoryId: string;
  categoryName: string;
  subcategories: string[];
  specialties: string[];
  tags: string[];

  yearsOfExperience?: number | null;
  homeServiceAvailable: boolean;
  communityRecommendationEnabled: boolean;

  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  websiteUrl?: string | null;

  address: string;
  city: string;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;

  logoUrl?: string | null;
  bannerUrl?: string | null;
  gallery: BusinessMedia[];

  status: "draft" | "pending_review" | "published" | "rejected" | "suspended" | "archived";
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  verifiedAt?: string | null;
  verifiedBy?: string | null;

  averageRating: number;
  reviewCount: number;
  recommendationCount: number;
  enquiryCount?: number;
  viewCount?: number;
  shareCount?: number;
  bookmarkCount?: number;

  responseTimeLabel?: string | null;
  openingHours?: BusinessOpeningHours[] | null;
  serviceAreas?: string[];

  bookmarkedByMe?: boolean;
  recommendedByMe?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canVerify?: boolean;

  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};
```

### Business Media

```ts
type BusinessMedia = {
  id: string;
  listingId: string;
  url: string;
  type: "logo" | "banner" | "gallery";
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  createdAt: string;
};
```

### Business Opening Hours

```ts
type BusinessOpeningHours = {
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  opensAt?: string | null;
  closesAt?: string | null;
  closed: boolean;
};
```

### Business Review

```ts
type BusinessReview = {
  id: string;
  listingId: string;
  reviewerUserId: string;
  reviewerName: string;
  reviewerAvatarUrl?: string | null;
  reviewerCity?: string | null;
  reviewerBadge?: string | null;
  reviewerMemberSince?: string | null;
  rating: number;
  content: string;
  status: "pending" | "published" | "hidden" | "rejected";
  verifiedInteraction: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  myVote?: "helpful" | "not_helpful" | null;
  createdAt: string;
  updatedAt: string;
};
```

### Enquiry

```ts
type BusinessEnquiry = {
  id: string;
  listingId: string;
  userId: string;
  channel: "call" | "whatsapp" | "email" | "in_app";
  message?: string | null;
  status: "sent" | "responded" | "closed" | "spam";
  createdAt: string;
};
```

## User API Requirements

All protected endpoints require `x-user-id`.

### Home And Discovery

#### `GET /api/directory/home`

Query:

- `lat` optional number
- `lng` optional number
- `city` optional string
- `limit` optional number, default `10`

Response:

```json
{
  "categories": [],
  "featuredListings": [],
  "nearbyListings": [],
  "popularCategories": [],
  "trendingListings": [],
  "stats": {
    "totalListings": 0,
    "verifiedListings": 0,
    "categories": 0
  }
}
```

Used by:

- `app/(tabs)/directory.tsx`

#### `GET /api/directory/categories`

Query:

- `includeCounts` optional boolean

Response:

```json
{
  "categories": [],
  "pagination": null
}
```

#### `GET /api/directory/listings`

Query:

- `page` optional number
- `limit` optional number
- `offset` optional number
- `categoryId` optional string
- `categorySlug` optional string
- `q` optional string
- `city` optional string
- `state` optional string
- `lat` optional number
- `lng` optional number
- `radiusKm` optional number
- `verified` optional boolean
- `homeServiceAvailable` optional boolean
- `minRating` optional number
- `sort` optional enum: `recommended|nearby|rating|newest|popular|trending`

Response:

```json
{
  "listings": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "hasMore": false
  }
}
```

Used by:

- category screen
- search results
- see all featured
- devotees near you

#### `GET /api/directory/listings/:id`

Response:

```json
{
  "listing": {},
  "reviewSummary": {},
  "recentReviews": [],
  "similarListings": []
}
```

Used by:

- business detail screen

### Search

#### `GET /api/directory/search`

Query:

- `q` required string
- `categoryId` optional string
- `city` optional string
- `lat` optional number
- `lng` optional number
- `radiusKm` optional number
- `limit` optional number
- `offset` optional number

Response:

```json
{
  "results": [],
  "suggestions": [],
  "pagination": {}
}
```

#### `GET /api/directory/search/suggestions`

Query:

- `q` required string, min 1

Response:

```json
{
  "suggestions": [
    {
      "type": "listing",
      "id": "listing-id",
      "label": "Sai Sanjeevani Clinic",
      "subtitle": "Healthcare"
    }
  ]
}
```

#### `GET /api/users/me/directory/recent-searches`

Response:

```json
{
  "searches": []
}
```

#### `POST /api/users/me/directory/recent-searches`

Body:

```json
{
  "query": "Organic Food"
}
```

#### `DELETE /api/users/me/directory/recent-searches`

Clears all recent searches for current user.

### Listing Creation And Management

#### `POST /api/directory/listings`

Content-Type: `application/json`

Body:

```json
{
  "businessName": "Sai Spiritual Store",
  "categoryId": "category-id",
  "tagline": "Trusted spiritual goods",
  "description": "Long description",
  "yearsOfExperience": 12,
  "homeServiceAvailable": true,
  "phoneNumber": "+919876543210",
  "whatsappNumber": "+919876543210",
  "email": "owner@example.com",
  "websiteUrl": "https://example.com",
  "address": "Full address",
  "city": "Delhi",
  "state": "Delhi",
  "country": "India",
  "pincode": "110001",
  "latitude": 28.6139,
  "longitude": 77.209,
  "specialties": ["Puja Items", "Books"],
  "tags": ["Spiritual Goods"],
  "logoUrl": "https://...",
  "bannerUrl": "https://...",
  "galleryUrls": ["https://..."],
  "communityRecommendationEnabled": true
}
```

Response:

```json
{
  "listing": {}
}
```

Expected behavior:

- New listing should default to `pending_review` unless backend/product explicitly allows auto-publish.
- Owner should be current `x-user-id`.

#### `PATCH /api/directory/listings/:id`

Protected.

Permission:

- listing owner
- `directory_admin`
- `super_admin`

Body:

- any editable listing fields

Response:

```json
{
  "listing": {}
}
```

#### `DELETE /api/directory/listings/:id`

Protected.

Soft delete or archive recommended.

Response:

```json
{
  "success": true,
  "id": "listing-id",
  "status": "archived"
}
```

#### `GET /api/users/me/directory/listings`

Protected.

Query:

- `status` optional
- `limit` optional
- `offset` optional

Response:

```json
{
  "listings": [],
  "pagination": {}
}
```

### Listing Drafts

Recommended because create listing is a multi-step flow.

#### `POST /api/directory/listing-drafts`

Protected.

Body:

- partial listing payload

Response:

```json
{
  "draft": {}
}
```

#### `PATCH /api/directory/listing-drafts/:id`

Protected.

Body:

- partial listing payload

#### `POST /api/directory/listing-drafts/:id/publish`

Protected.

Response:

```json
{
  "listing": {}
}
```

### Media

Use existing upload style if possible.

#### `POST /api/media/upload`

Form-data:

- single file key: `file`
- multiple file key: `files`
- optional `context=directory`

Allowed MIME:

- `image/jpeg`
- `image/png`
- `image/webp`

Recommended limits:

- max 10 files per request
- max 10MB per image for Directory

Response:

```json
{
  "url": "https://...",
  "media": {}
}
```

### Bookmark / Save

#### `POST /api/directory/listings/:id/bookmark`

Protected.

Response:

```json
{
  "listing": {},
  "bookmarked": true
}
```

#### `DELETE /api/directory/listings/:id/bookmark`

Protected.

#### `GET /api/users/me/directory/bookmarks`

Protected.

Query:

- `limit`
- `offset`

Response:

```json
{
  "listings": [],
  "pagination": {}
}
```

### Recommendations / Endorsements

#### `POST /api/directory/listings/:id/recommend`

Protected.

Response:

```json
{
  "listing": {},
  "recommended": true
}
```

#### `DELETE /api/directory/listings/:id/recommend`

Protected.

Response:

```json
{
  "listing": {},
  "recommended": false
}
```

Business rule:

- Respect `communityRecommendationEnabled`.
- One recommendation per user per listing.

### Enquiries And Contact Tracking

The UI has Call Now, WhatsApp, and Enquire actions. Backend should track these for trust and analytics.

#### `POST /api/directory/listings/:id/contact`

Protected preferred, but can support guest with limited data later.

Body:

```json
{
  "channel": "call",
  "message": "Optional enquiry text"
}
```

Channel enum:

- `call`
- `whatsapp`
- `email`
- `in_app`

Response:

```json
{
  "enquiry": {},
  "contact": {
    "phoneNumber": "+919876543210",
    "whatsappNumber": "+919876543210",
    "email": "owner@example.com"
  }
}
```

Business rule:

- Review creation can require a prior enquiry/contact record.

### Reviews

#### `GET /api/directory/listings/:id/reviews`

Query:

- `rating` optional number
- `sort` optional enum: `newest|highest|lowest|helpful`
- `limit` optional
- `offset` optional

Response:

```json
{
  "summary": {
    "averageRating": 4.8,
    "reviewCount": 34,
    "distribution": {
      "5": 28,
      "4": 4,
      "3": 2,
      "2": 0,
      "1": 0
    },
    "canReview": false,
    "reviewGateReason": "ENQUIRY_REQUIRED"
  },
  "reviews": [],
  "pagination": {}
}
```

#### `POST /api/directory/listings/:id/reviews`

Protected.

Body:

```json
{
  "rating": 5,
  "content": "Excellent service."
}
```

Validation:

- `rating` integer `1..5`
- `content` min 10, max 2000

Business rule:

- User cannot review own listing.
- User can only review once unless backend supports update.
- If verified reviews are required, user must have an enquiry/contact record.
- Review can start as `pending` if moderation is enabled.

#### `PATCH /api/directory/reviews/:id`

Protected.

Owner can edit own review while published/pending.

#### `DELETE /api/directory/reviews/:id`

Protected.

Soft delete recommended.

#### `POST /api/directory/reviews/:id/vote`

Protected.

Body:

```json
{
  "vote": "helpful"
}
```

Vote enum:

- `helpful`
- `not_helpful`

#### `DELETE /api/directory/reviews/:id/vote`

Protected.

### Share And Analytics

#### `POST /api/directory/listings/:id/share`

Protected preferred.

Body:

```json
{
  "channel": "system"
}
```

Channel enum:

- `system`
- `whatsapp`
- `copy`
- `facebook`
- `other`

#### `POST /api/directory/listings/:id/view`

Optional.

Track detail view analytics.

## Admin API Requirements

Directory needs an admin/moderation panel because listings can expose phone numbers, WhatsApp numbers, business claims, ratings, and community trust badges.

Admin roles:

- `directory_admin`
- `mandir_admin`
- `super_admin`

### Admin Listing Queue

#### `GET /api/admin/directory/listings`

Query:

- `status` optional: `pending_review|published|rejected|suspended|archived`
- `verificationStatus` optional
- `categoryId` optional
- `q` optional
- `city` optional
- `limit`
- `offset`

Response:

```json
{
  "listings": [],
  "pagination": {}
}
```

### Approve / Reject / Suspend

#### `POST /api/admin/directory/listings/:id/approve`

Body:

```json
{
  "note": "Looks good"
}
```

#### `POST /api/admin/directory/listings/:id/reject`

Body:

```json
{
  "reason": "Invalid phone number",
  "note": "Please upload a real business address."
}
```

#### `POST /api/admin/directory/listings/:id/suspend`

Body:

```json
{
  "reason": "Reported spam"
}
```

#### `POST /api/admin/directory/listings/:id/restore`

Restores suspended/archived listing.

### Verification

#### `POST /api/admin/directory/listings/:id/verify`

Body:

```json
{
  "verificationStatus": "verified",
  "note": "Phone and address checked"
}
```

#### `POST /api/admin/directory/listings/:id/unverify`

Removes verified badge.

### Admin Reviews

#### `GET /api/admin/directory/reviews`

Query:

- `status`
- `listingId`
- `rating`
- `q`
- `limit`
- `offset`

#### `POST /api/admin/directory/reviews/:id/approve`

#### `POST /api/admin/directory/reviews/:id/reject`

#### `POST /api/admin/directory/reviews/:id/hide`

#### `POST /api/admin/directory/reviews/:id/restore`

### Reports

#### `POST /api/directory/listings/:id/report`

Protected.

Body:

```json
{
  "reason": "spam",
  "details": "This listing has wrong contact information."
}
```

Reason enum:

- `spam`
- `incorrect_information`
- `fraud`
- `offensive_content`
- `duplicate`
- `other`

#### `GET /api/admin/directory/reports`

Admin.

#### `POST /api/admin/directory/reports/:id/resolve`

Admin.

### Category Management

#### `POST /api/admin/directory/categories`

#### `PATCH /api/admin/directory/categories/:id`

#### `DELETE /api/admin/directory/categories/:id`

Admin should be able to:

- create category
- rename category
- set icon/color
- set sort order
- activate/deactivate category

### Admin Analytics

#### `GET /api/admin/directory/analytics`

Response:

```json
{
  "totalListings": 0,
  "pendingListings": 0,
  "publishedListings": 0,
  "verifiedListings": 0,
  "totalReviews": 0,
  "pendingReviews": 0,
  "totalEnquiries": 0,
  "topCategories": [],
  "topCities": [],
  "topListings": []
}
```

### Audit Logs

Every admin action should create an audit log:

- listing approval/rejection
- verification changes
- suspension/restore
- review moderation
- category changes
- report resolution

Recommended endpoint:

#### `GET /api/admin/directory/audit-logs`

## Validation Rules

### Create Listing

Required:

- `businessName` min 2, max 120
- `categoryId` valid active category
- `description` min 20, max 3000
- `phoneNumber` or `whatsappNumber`
- `address` min 5
- `city` min 2

Optional:

- `tagline` max 160
- `yearsOfExperience` integer `0..100`
- `email` valid email
- `websiteUrl` valid URL
- `pincode` 4-10 digits
- `latitude` `-90..90`
- `longitude` `-180..180`
- `specialties` max 12 items, each max 40 chars
- `tags` max 20 items, each max 40 chars
- `galleryUrls` max 10 URLs

Phone:

- `phoneNumber` and `whatsappNumber` should support Indian and international format.
- Store normalized E.164 when possible.

### Media Upload

- Images only for Directory listing media.
- MIME: jpeg, png, webp.
- Max 10MB per image.
- Max 10 images per listing initially.

### Review

- `rating` integer `1..5`
- `content` min 10, max 2000
- one review per user per listing
- owner cannot review own listing

### Search

- `q` min 1, max 100
- `radiusKm` max 100 unless admin
- `limit` max 50

## Security And Privacy

- Do not expose phone/WhatsApp/email in list APIs unless product wants direct list contact.
- Detail API can expose contact fields.
- Contact API should track channel before returning sensitive contact information if possible.
- Only listing owner/admin can edit listing.
- Only admin can approve, verify, reject, suspend.
- Reviews should not expose private user fields.
- Rate-limit contact, enquiry, review, report, and search endpoints.
- Add spam protection for repeated recommendations/reviews.
- Soft delete listings and reviews.

## Notifications

Recommended push/email notification triggers:

- listing submitted
- listing approved
- listing rejected with reason
- listing verified
- listing suspended
- new enquiry/contact
- new review
- review approved/rejected
- report resolved

Potential endpoint:

- `POST /api/notifications/directory-listing-status`

Admin-triggered notifications can reuse existing notification infrastructure.

## Response Shape Standard

Use consistent response wrappers:

List:

```json
{
  "listings": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 0,
    "hasMore": false
  }
}
```

Single:

```json
{
  "listing": {}
}
```

Mutation:

```json
{
  "success": true,
  "listing": {}
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {}
  }
}
```

## Implementation Phases

### Phase 0: Contract Finalization

- [ ] Backend confirms endpoint names.
- [ ] Backend confirms auth role names.
- [ ] Backend confirms whether listing creation auto-publishes or goes to `pending_review`.
- [ ] Backend confirms media upload response shape.
- [ ] Backend confirms whether review requires enquiry first.

### Phase 1: Foundation APIs

- [ ] Categories
- [ ] Listing create
- [ ] Listing list
- [ ] Listing detail
- [ ] Media upload
- [ ] My listings

### Phase 2: Discovery

- [ ] Directory home
- [ ] Featured listings
- [ ] Nearby listings
- [ ] Search
- [ ] Recent searches
- [ ] Trending listings

### Phase 3: Trust And Contact

- [ ] Bookmark
- [ ] Recommend/endorse
- [ ] Contact/enquiry tracking
- [ ] Share tracking
- [ ] Report listing

### Phase 4: Reviews

- [ ] Review summary
- [ ] Review list
- [ ] Create review
- [ ] Helpful/not helpful votes
- [ ] Review moderation

### Phase 5: Admin Panel APIs

- [ ] Listing queue
- [ ] Approve/reject/suspend/restore
- [ ] Verify/unverify
- [ ] Review queue
- [ ] Report queue
- [ ] Category management
- [ ] Admin analytics
- [ ] Audit logs

### Phase 6: Frontend Integration

- [ ] Create `services/directory.ts`
- [ ] Create `store/directory/*`
- [ ] Wire Directory home
- [ ] Wire category screen
- [ ] Wire search screen
- [ ] Wire create listing
- [ ] Wire detail
- [ ] Wire reviews
- [ ] Remove static Directory data

## Minimum Backend Definition Of Done

The backend is ready for frontend integration when:

- Directory categories can be fetched.
- A logged-in user can create a listing.
- Listing creation returns a stable `id`.
- Listings can be searched, filtered, paginated, and fetched by ID.
- Media upload returns stable public URLs.
- Detail returns contact fields, owner summary, gallery, trust stats, and current user's bookmark/recommend flags.
- Reviews summary and list endpoints exist.
- Admin can approve/reject listings.
- All protected endpoints enforce `x-user-id`.
- All admin endpoints enforce admin roles.
- Validation errors return the standard error shape.
