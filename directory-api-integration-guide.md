# Sai Family Directory API Integration Guide

This guide is for frontend integration and QA testing of the Sai Directory module.

## Base URLs

Local:

```text
http://localhost:8000
```

Production:

```text
https://saifamily.sustaininsight.com
```

All Directory APIs use these prefixes:

```text
/api/directory
/api/users/me/directory
/api/admin/directory
```

## Authentication

Use JWT bearer auth for frontend requests:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Some local Postman requests may also work with:

```http
x-user-id: <userId>
```

Use `x-user-id` only for local/dev testing. Production requests must use signed bearer tokens.

Admin APIs require the logged-in user role to be `mandir_admin` or `super_admin`.

## Enums

Listing status:

```ts
type BusinessListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "suspended"
  | "archived";
```

Verification status:

```ts
type BusinessVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";
```

Review status:

```ts
type BusinessReviewStatus =
  | "pending"
  | "published"
  | "hidden"
  | "rejected";
```

Review vote:

```ts
type BusinessReviewVoteType = "helpful" | "not_helpful";
```

Report status:

```ts
type BusinessReportStatus = "pending" | "resolved" | "dismissed";
```

## Recommended Testing Flow

1. Login as normal user and store `accessToken`.
2. Login as admin and store `adminAccessToken`.
3. Fetch categories with `GET /api/directory/categories?includeCounts=true`.
4. If no category exists, create one from admin API.
5. Upload media by `POST /api/media/upload` and use returned URLs in `logoUrl`, `bannerUrl`, or `galleryUrls`.
6. Create listing with `POST /api/directory/listings`; it becomes `pending_review`.
7. Approve listing from admin API; it becomes `published`.
8. Test public discovery: home, search, list, detail.
9. Test user actions: bookmark, recommend, contact, review, vote, report.
10. Test user dashboard: my listings, bookmarks, recent searches.
11. Test admin queues: listings, reviews, reports, analytics, audit logs.

## Common Listing Payload

Use this body for create listing or draft publish validation.

```json
{
  "businessName": "Sai Family Test Service",
  "categoryId": "directory_category_education",
  "tagline": "Trusted service from Sai community",
  "description": "This is a test business listing created for Sai Directory integration testing.",
  "yearsOfExperience": 5,
  "homeServiceAvailable": true,
  "communityRecommendationEnabled": true,
  "phoneNumber": "+919876543210",
  "whatsappNumber": "+919876543210",
  "email": "directory-test@example.com",
  "websiteUrl": "https://example.com",
  "address": "MG Road, Pune",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "411001",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "subcategories": ["Coaching"],
  "specialties": ["Tutoring"],
  "tags": ["education", "service"],
  "serviceAreas": ["Pune"],
  "openingHours": {
    "mon": { "open": "10:00", "close": "18:00" }
  },
  "logoUrl": "https://example.com/logo.png",
  "bannerUrl": "https://example.com/banner.png",
  "galleryUrls": []
}
```

Validation notes:

- `businessName`: required, 2 to 120 chars.
- `categoryId`: required and category must be active.
- `description`: required, 20 to 3000 chars.
- `address`: required, 5 to 500 chars.
- `city`: required, 2 to 100 chars.
- At least one of `phoneNumber` or `whatsappNumber` is required.
- `websiteUrl`, `logoUrl`, `bannerUrl`, and each `galleryUrls` item must be valid URLs.
- `galleryUrls` max is 10.
- New listings are submitted as `pending_review`; admin approval is required before public discovery.

## Frontend Validation Rules

Use these rules before calling the API so the form feels smooth and backend validation errors are rare.

### User Login And Onboarding Validation

These rules come from the auth and account APIs used before Directory creation.

Mobile OTP:

| Field | Required | Frontend rule | Example message |
| --- | --- | --- | --- |
| `mobileNumber` | Yes | Normalize by removing spaces, brackets, and hyphens. Must match `^\+[1-9]\d{7,14}$`. | Use country code, for example `+919876543210`. |
| `otp` | Yes | Must be 4 or 6 digits: `^(\d{4}|\d{6})$`. | Enter a valid 4 or 6 digit OTP. |

Email/password login setup:

| Field | Required | Frontend rule | Example message |
| --- | --- | --- | --- |
| `email` | Yes | Valid email, max 180 chars. Convert to lowercase before submit. | Enter a valid email address. |
| `password` | Yes | 8 to 72 chars, at least one lowercase, one uppercase, and one number. | Password must include uppercase, lowercase, and a number. |
| `otp` | Email verify only | Must be 4 or 6 digits. | Enter the verification code. |

Account onboarding form:

| Field | Required | Frontend rule | Example message |
| --- | --- | --- | --- |
| `profileImage` | Yes | File is required. Prefer JPG/PNG/WEBP and show preview before submit. | Please upload a profile image. |
| `name` | Yes | Trimmed, 2 to 120 chars. | Name must be at least 2 characters. |
| `email` | Yes | Valid email, max 180 chars. Must match verified email if auth user already has one. | Enter the same verified email. |
| `mobileNumber` | Yes | E.164 pattern `^\+[1-9]\d{7,14}$`. Must match verified mobile if auth user already has one. | Enter the same verified mobile number. |
| `completeAddress` | Yes | Trimmed, 10 to 500 chars. | Address must be at least 10 characters. |
| `pincode` | Yes | Digits only, 4 to 10 digits: `^\d{4,10}$`. | Pincode must be 4 to 10 digits. |
| `occupation` | Yes | Trimmed, 2 to 120 chars. | Occupation must be at least 2 characters. |
| `city` | No | If provided, 2 to 120 chars. | City must be at least 2 characters. |
| `state` | No | If provided, 2 to 120 chars. | State must be at least 2 characters. |
| `country` | No | If provided, 2 to 120 chars. Default is `India`. | Country must be at least 2 characters. |
| `language` | No | If provided, 2 to 12 chars. Default is `en`. | Select a valid language. |
| `expoPushToken` | No | Must match `^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$`. | Push token is invalid. |

Onboarding business rules:

- User must verify mobile OTP first.
- `POST /accounts` requires an authenticated user.
- Backend rejects onboarding if the profile is already completed.
- Backend rejects email or mobile mismatch with the verified identity.
- Backend rejects duplicate email or duplicate mobile number.

### Directory Create Listing Validation

Backend exact validation:

| Field | Required | Backend rule | Frontend UX message |
| --- | --- | --- | --- |
| `businessName` | Yes | Trimmed, 2 to 120 chars. | Business name must be 2 to 120 characters. |
| `categoryId` | Yes | Non-empty string and active category must exist. | Please select a category. |
| `tagline` | No | Max 160 chars. | Tagline can be up to 160 characters. |
| `description` | Yes | Trimmed, 20 to 3000 chars. | Description must be at least 20 characters. |
| `yearsOfExperience` | No | Integer, 0 to 100. | Enter years between 0 and 100. |
| `homeServiceAvailable` | No | Boolean, default `false`. | Use a toggle. |
| `communityRecommendationEnabled` | No | Boolean, default `true`. | Use a toggle. |
| `phoneNumber` | Conditional | Trimmed, 6 to 30 chars. Required if `whatsappNumber` is empty. | Enter phone or WhatsApp number. |
| `whatsappNumber` | Conditional | Trimmed, 6 to 30 chars. Required if `phoneNumber` is empty. | Enter phone or WhatsApp number. |
| `email` | No | Valid email. | Enter a valid email address. |
| `websiteUrl` | No | Valid URL. | Enter a valid website URL including `https://`. |
| `address` | Yes | Trimmed, 5 to 500 chars. | Address must be at least 5 characters. |
| `city` | Yes | Trimmed, 2 to 100 chars. | City must be at least 2 characters. |
| `state` | No | Max 100 chars. | State can be up to 100 characters. |
| `country` | No | Max 100 chars, default `India`. | Country can be up to 100 characters. |
| `pincode` | No | Digits only, 4 to 10 digits. | Pincode must be 4 to 10 digits. |
| `latitude` | No | Number from -90 to 90. | Latitude must be between -90 and 90. |
| `longitude` | No | Number from -180 to 180. | Longitude must be between -180 and 180. |
| `subcategories` | No | Array, max 12 items, each 1 to 40 chars. | Add up to 12 subcategories. |
| `specialties` | No | Array, max 12 items, each 1 to 40 chars. | Add up to 12 specialties. |
| `tags` | No | Array, max 20 items, each 1 to 40 chars. | Add up to 20 tags. |
| `serviceAreas` | No | Array, max 20 items, each 1 to 80 chars. | Add up to 20 service areas. |
| `openingHours` | No | Any JSON object accepted by backend. | Use a structured weekly schedule object. |
| `logoUrl` | No | Valid URL. | Upload or provide a valid logo URL. |
| `bannerUrl` | No | Valid URL. | Upload or provide a valid banner URL. |
| `galleryUrls` | No | Array of valid URLs, max 10. | Upload up to 10 gallery images. |

Frontend recommended stronger rules:

- For `phoneNumber` and `whatsappNumber`, prefer E.164 format: `^\+[1-9]\d{7,14}$`, even though backend only checks length for Directory listing.
- If user enters `websiteUrl` without protocol, auto-prefix `https://` before validation.
- Trim all strings on blur and before submit.
- Convert `email` to lowercase before submit.
- Remove empty array items before submit.
- Send empty optional text fields as `undefined` or `null`, not empty strings.
- Validate `latitude` and `longitude` together. If one is provided, ask for the other.
- For `openingHours`, keep a predictable object shape such as:

```json
{
  "mon": { "open": "10:00", "close": "18:00", "closed": false },
  "tue": { "open": "10:00", "close": "18:00", "closed": false },
  "wed": { "closed": true },
  "thu": { "open": "10:00", "close": "18:00", "closed": false },
  "fri": { "open": "10:00", "close": "18:00", "closed": false },
  "sat": { "open": "10:00", "close": "14:00", "closed": false },
  "sun": { "closed": true }
}
```

### Suggested Frontend Zod Schema

```ts
import { z } from "zod";

const e164MobileSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Use country code, for example +919876543210");

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
    message: "Enter a valid URL including https://"
  });

export const directoryListingFormSchema = z
  .object({
    businessName: z.string().trim().min(2).max(120),
    categoryId: z.string().trim().min(1, "Please select a category"),
    tagline: z.string().trim().max(160).optional().nullable(),
    description: z.string().trim().min(20).max(3000),
    yearsOfExperience: z.coerce.number().int().min(0).max(100).optional().nullable(),
    homeServiceAvailable: z.boolean().default(false),
    communityRecommendationEnabled: z.boolean().default(true),
    phoneNumber: e164MobileSchema.optional().nullable(),
    whatsappNumber: e164MobileSchema.optional().nullable(),
    email: z.string().trim().email().optional().nullable(),
    websiteUrl: optionalUrlSchema,
    address: z.string().trim().min(5).max(500),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().max(100).optional().nullable(),
    country: z.string().trim().max(100).default("India"),
    pincode: z.string().trim().regex(/^\d{4,10}$/).optional().nullable(),
    latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
    longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
    subcategories: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
    specialties: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    serviceAreas: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
    openingHours: z.unknown().optional().nullable(),
    logoUrl: optionalUrlSchema,
    bannerUrl: optionalUrlSchema,
    galleryUrls: z.array(z.string().trim().url()).max(10).default([])
  })
  .superRefine((value, ctx) => {
    if (!value.phoneNumber && !value.whatsappNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "Enter phone or WhatsApp number"
      });
    }

    if ((value.latitude == null) !== (value.longitude == null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["latitude"],
        message: "Latitude and longitude must be added together"
      });
    }
  });
```

### Suggested Form Steps

For a smooth mobile UX, split create listing into steps:

1. Basic details: `businessName`, `categoryId`, `tagline`, `description`.
2. Contact: `phoneNumber`, `whatsappNumber`, `email`, `websiteUrl`.
3. Location: `address`, `city`, `state`, `country`, `pincode`, map coordinates.
4. Services: `yearsOfExperience`, `homeServiceAvailable`, `subcategories`, `specialties`, `tags`, `serviceAreas`.
5. Media: upload `logoUrl`, `bannerUrl`, `galleryUrls`.
6. Review and submit: show `pending_review` expectation.

## User Directory API Contracts

This section is the frontend rendering contract. Use it to verify that every API response is shown correctly in the app.

### Common Response Objects

Directory category:

```ts
type DirectoryCategoryResponse = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  iconFamily: string | null;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  listingCount?: number;
};
```

Directory listing card/detail:

```ts
type DirectoryListingResponse = {
  id: string;
  ownerUserId: string;
  ownerMemberId: string | null;
  ownerName: string | null;
  ownerAvatarUrl: string | null;
  ownerDevoteeBadge: string | null;
  ownerMemberSince: string;
  owner: {
    id: string;
    memberId: string | null;
    name: string | null;
    handle: string | null;
    profileImageUrl: string | null;
    memberSince: string;
  };
  businessName: string;
  slug: string;
  tagline: string | null;
  description: string;
  categoryId: string;
  categoryName: string;
  category: DirectoryCategoryResponse;
  subcategories: string[];
  specialties: string[];
  tags: string[];
  yearsOfExperience: number | null;
  homeServiceAvailable: boolean;
  communityRecommendationEnabled: boolean;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  email: string | null;
  websiteUrl: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  gallery: Array<{
    id: string;
    listingId: string;
    url: string;
    type: "logo" | "banner" | "gallery";
    sortOrder: number;
    createdAt: string;
  }>;
  status: BusinessListingStatus;
  verificationStatus: BusinessVerificationStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  averageRating: number;
  reviewCount: number;
  recommendationCount: number;
  enquiryCount: number;
  viewCount: number;
  shareCount: number;
  bookmarkCount: number;
  reportCount?: number;
  responseTimeLabel: string | null;
  openingHours: unknown | null;
  serviceAreas: string[];
  bookmarkedByMe: boolean;
  recommendedByMe: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canVerify: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
```

Review:

```ts
type DirectoryReviewResponse = {
  id: string;
  listingId: string;
  reviewerUserId: string;
  reviewerName: string | null;
  reviewerAvatarUrl: string | null;
  reviewerCity: string | null;
  reviewerBadge: string | null;
  reviewerMemberSince: string;
  rating: number;
  content: string;
  status: BusinessReviewStatus;
  verifiedInteraction: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  myVote: "helpful" | "not_helpful" | null;
  createdAt: string;
  updatedAt: string;
};
```

Pagination:

```ts
type OffsetPagination = {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  nextOffset: number | null;
};
```

### User Endpoint Matrix

| Screen/Flow | Method | API | Auth | Required fields |
| --- | --- | --- | --- | --- |
| Directory home | GET | `/api/directory/home` | Optional | None |
| Category list | GET | `/api/directory/categories` | No | None |
| Search | GET | `/api/directory/search` | Optional | `q` |
| Suggestions | GET | `/api/directory/search/suggestions` | No | `q` |
| Listing list | GET | `/api/directory/listings` | Optional | None |
| Listing detail | GET | `/api/directory/listings/:id` | Optional | `id` path param |
| Create listing | POST | `/api/directory/listings` | Yes | `businessName`, `categoryId`, `description`, `address`, `city`, and `phoneNumber` or `whatsappNumber` |
| Update listing | PATCH | `/api/directory/listings/:id` | Yes | At least one editable field |
| Archive listing | DELETE | `/api/directory/listings/:id` | Yes | `id` path param |
| Create draft | POST | `/api/directory/listing-drafts` | Yes | At least one draft field |
| Update draft | PATCH | `/api/directory/listing-drafts/:id` | Yes | At least one draft field |
| Publish draft | POST | `/api/directory/listing-drafts/:id/publish` | Yes | Draft must contain all create-listing required fields |
| My listings | GET | `/api/users/me/directory/listings` | Yes | None |
| Bookmark | POST | `/api/directory/listings/:id/bookmark` | Yes | `id` path param |
| Remove bookmark | DELETE | `/api/directory/listings/:id/bookmark` | Yes | `id` path param |
| My bookmarks | GET | `/api/users/me/directory/bookmarks` | Yes | None |
| Recommend | POST | `/api/directory/listings/:id/recommend` | Yes | `id` path param |
| Remove recommendation | DELETE | `/api/directory/listings/:id/recommend` | Yes | `id` path param |
| Contact/enquiry | POST | `/api/directory/listings/:id/contact` | Yes | `channel` |
| Share | POST | `/api/directory/listings/:id/share` | Optional | None |
| View tracking | POST | `/api/directory/listings/:id/view` | Optional | None |
| Report | POST | `/api/directory/listings/:id/report` | Yes | `reason` |
| Review list | GET | `/api/directory/listings/:id/reviews` | Optional | `id` path param |
| Create review | POST | `/api/directory/listings/:id/reviews` | Yes | `rating`, `content` |
| Update review | PATCH | `/api/directory/reviews/:id` | Yes | `rating` or `content` |
| Delete review | DELETE | `/api/directory/reviews/:id` | Yes | `id` path param |
| Vote review | POST | `/api/directory/reviews/:id/vote` | Yes | `vote` |
| Remove vote | DELETE | `/api/directory/reviews/:id/vote` | Yes | `id` path param |
| Recent searches | GET | `/api/users/me/directory/recent-searches` | Yes | None |
| Save recent search | POST | `/api/users/me/directory/recent-searches` | Yes | `query` |
| Clear recent searches | DELETE | `/api/users/me/directory/recent-searches` | Yes | None |

### Screen Wise Response Contracts

#### 1. Directory Home

```http
GET /api/directory/home?city=Pune&lat=18.5204&lng=73.8567&limit=10
```

Frontend should render:

- Category chips/grid from `categories`.
- Featured carousel/list from `featuredListings`.
- Nearby list from `nearbyListings`.
- Popular category section from `popularCategories`.
- Trending section from `trendingListings`.
- Stats cards from `stats`.

Response:

```ts
type DirectoryHomeResponse = {
  categories: DirectoryCategoryResponse[];
  featuredListings: DirectoryListingResponse[];
  nearbyListings: DirectoryListingResponse[];
  popularCategories: DirectoryCategoryResponse[];
  trendingListings: DirectoryListingResponse[];
  stats: {
    totalListings: number;
    verifiedListings: number;
    categoryCount: number;
    city: string | null;
  };
};
```

#### 2. Category List

```http
GET /api/directory/categories?includeCounts=true
```

Frontend should render category icon, name, optional description, color, and count.

Response:

```ts
type DirectoryCategoriesResponse = {
  categories: DirectoryCategoryResponse[];
  pagination: null;
};
```

#### 3. Search Listings

```http
GET /api/directory/search?q=service&city=Pune&limit=20&offset=0
```

Required query:

```ts
type SearchDirectoryQuery = {
  q: string;
  categoryId?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
};
```

Frontend should render:

- Main result list from `listings` or `results`.
- Suggestion chips from `suggestions.tags`.
- Category suggestions from `suggestions.categories`.
- Infinite scroll from `pagination`.

Response:

```ts
type DirectorySearchResponse = {
  q: string;
  results: DirectoryListingResponse[];
  listings: DirectoryListingResponse[];
  suggestions: {
    categories: DirectoryCategoryResponse[];
    tags: string[];
    listings: Array<{
      id: string;
      businessName: string;
      categoryName: string;
      city: string;
    }>;
  };
  pagination: OffsetPagination;
};
```

#### 4. Search Suggestions

```http
GET /api/directory/search/suggestions?q=serv&limit=8
```

Response:

```ts
type DirectorySearchSuggestionsResponse = {
  q: string;
  suggestions: {
    listings: Array<{
      id: string;
      businessName: string;
      city: string;
      category: DirectoryCategoryResponse;
    }>;
    categories: DirectoryCategoryResponse[];
    tags: string[];
  };
};
```

#### 5. Listing List

```http
GET /api/directory/listings?categorySlug=education&city=Pune&sort=recommended&limit=20&offset=0
```

Frontend should render cards from `listings`.

Response:

```ts
type DirectoryListingListResponse = {
  listings: DirectoryListingResponse[];
  pagination: OffsetPagination & {
    page: number;
  };
};
```

#### 6. Listing Detail

```http
GET /api/directory/listings/:id
```

Frontend should render:

- Hero/banner/logo/business profile from `listing`.
- Contact buttons from `listing.phoneNumber`, `listing.whatsappNumber`, `listing.email`, `listing.websiteUrl`.
- Review summary from `reviewSummary`.
- Review preview from `recentReviews`.
- Similar listing section from `similarListings`.
- Edit/archive button if `listing.canEdit` or `listing.canDelete`.

Response:

```ts
type DirectoryListingDetailResponse = {
  listing: DirectoryListingResponse;
  reviewSummary: {
    averageRating: number;
    reviewCount: number;
    distribution: {
      "5": number;
      "4": number;
      "3": number;
      "2": number;
      "1": number;
    };
    canReview: boolean;
    reviewGateReason: "AUTH_REQUIRED" | "ALREADY_REVIEWED" | "ENQUIRY_REQUIRED" | null;
  };
  recentReviews: DirectoryReviewResponse[];
  similarListings: DirectoryListingResponse[];
};
```

#### 7. Create Listing

```http
POST /api/directory/listings
```

Required body:

```ts
type CreateDirectoryListingBody = {
  businessName: string;
  categoryId: string;
  description: string;
  address: string;
  city: string;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
};
```

Full body can include all optional fields from the common listing payload.

Response:

```ts
type CreateDirectoryListingResponse = {
  listing: DirectoryListingResponse;
};
```

Expected UI:

- Show success message: `Listing submitted for admin review`.
- Show listing status badge: `pending_review`.
- Navigate to My Directory Listings or listing preview.

#### 8. Update Listing

```http
PATCH /api/directory/listings/:id
```

Required body: at least one editable listing field.

Response:

```ts
type UpdateDirectoryListingResponse = {
  listing: DirectoryListingResponse;
};
```

#### 9. Archive Listing

```http
DELETE /api/directory/listings/:id
```

Response:

```ts
type ArchiveDirectoryListingResponse = {
  success: true;
  id: string;
  status: "archived";
};
```

#### 10. Draft APIs

Create draft:

```http
POST /api/directory/listing-drafts
```

Update draft:

```http
PATCH /api/directory/listing-drafts/:id
```

Publish draft:

```http
POST /api/directory/listing-drafts/:id/publish
```

Draft response:

```ts
type DirectoryDraftResponse = {
  id: string;
  ownerUserId: string;
  businessName?: string | null;
  tagline?: string | null;
  description?: string | null;
  categoryId?: string | null;
  category?: DirectoryCategoryResponse | null;
  subcategories: string[];
  specialties: string[];
  tags: string[];
  serviceAreas: string[];
  openingHours?: unknown | null;
  yearsOfExperience?: number | null;
  homeServiceAvailable?: boolean | null;
  communityRecommendationEnabled?: boolean | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  galleryUrls: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CreateOrUpdateDraftResponse = {
  draft: DirectoryDraftResponse;
};

type PublishDraftResponse = {
  draft: DirectoryDraftResponse;
  listing: DirectoryListingResponse;
};
```

#### 11. My Listings

```http
GET /api/users/me/directory/listings?status=pending_review&limit=20&offset=0
```

Response:

```ts
type MyDirectoryListingsResponse = {
  listings: DirectoryListingResponse[];
  pagination: OffsetPagination;
};
```

Frontend should show owner dashboard tabs:

- All
- Pending review
- Published
- Rejected
- Suspended
- Archived

#### 12. Bookmark APIs

Bookmark:

```http
POST /api/directory/listings/:id/bookmark
```

Remove:

```http
DELETE /api/directory/listings/:id/bookmark
```

Response:

```ts
type DirectoryBookmarkToggleResponse = {
  listing: DirectoryListingResponse;
  listingId: string;
  bookmarked: boolean;
  _count: {
    bookmarks: number;
  };
};
```

My bookmarks:

```http
GET /api/users/me/directory/bookmarks?limit=20&offset=0
```

Response:

```ts
type MyDirectoryBookmarksResponse = {
  bookmarks: Array<{
    id: string;
    listingId: string;
    createdAt: string;
  }>;
  listings: DirectoryListingResponse[];
  pagination: OffsetPagination;
};
```

#### 13. Recommendation APIs

Recommend:

```http
POST /api/directory/listings/:id/recommend
```

Remove:

```http
DELETE /api/directory/listings/:id/recommend
```

Response:

```ts
type DirectoryRecommendationToggleResponse = {
  listing: DirectoryListingResponse;
  listingId: string;
  recommended: boolean;
  _count: {
    recommendations: number;
  };
};
```

#### 14. Contact / Enquiry

```http
POST /api/directory/listings/:id/contact
```

Required body:

```ts
type DirectoryContactBody = {
  channel: "call" | "whatsapp" | "email" | "in_app";
  message?: string | null;
};
```

Response:

```ts
type DirectoryContactResponse = {
  enquiry: {
    id: string;
    listingId: string;
    userId: string;
    channel: "call" | "whatsapp" | "email" | "in_app";
    message: string | null;
    createdAt: string;
  };
  listing: DirectoryListingResponse;
  contact: {
    phoneNumber: string | null;
    whatsappNumber: string | null;
    email: string | null;
    websiteUrl: string | null;
  };
  _count: {
    enquiries: number;
  };
};
```

Frontend should:

- Save enquiry success state.
- Unlock review CTA after successful contact.
- Open dialer/WhatsApp/email based on selected channel using `contact`.

#### 15. Share And View Tracking

Share:

```http
POST /api/directory/listings/:id/share
```

Body:

```ts
type DirectoryShareBody = {
  channel?: "system" | "whatsapp" | "copy" | "facebook" | "other";
};
```

Response:

```ts
type DirectoryShareResponse = {
  listingId: string;
  shared: true;
  shares: number;
  _count: {
    shares: number;
  };
};
```

View:

```http
POST /api/directory/listings/:id/view
```

Response:

```ts
type DirectoryViewResponse = {
  listingId: string;
  viewed: true;
  views: number;
  _count: {
    views: number;
  };
};
```

#### 16. Report Listing

```http
POST /api/directory/listings/:id/report
```

Required body:

```ts
type DirectoryReportBody = {
  reason: "spam" | "inappropriate" | "scam" | "duplicate" | "wrong_info" | "other";
  details?: string;
};
```

Response:

```ts
type DirectoryReportResponse = {
  report: {
    id: string;
    listingId: string;
    reporterUserId: string;
    reason: string;
    details: string | null;
    status: "pending" | "resolved" | "dismissed";
    createdAt: string;
    updatedAt: string;
  };
  listingId: string;
  reported: true;
};
```

#### 17. Review APIs

List reviews:

```http
GET /api/directory/listings/:id/reviews?sort=newest&limit=20&offset=0
```

Response:

```ts
type DirectoryReviewsResponse = {
  summary: DirectoryListingDetailResponse["reviewSummary"];
  reviews: DirectoryReviewResponse[];
  pagination: OffsetPagination;
};
```

Create review:

```http
POST /api/directory/listings/:id/reviews
```

Required body:

```ts
type CreateDirectoryReviewBody = {
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
};
```

Create/update response:

```ts
type DirectoryReviewMutationResponse = {
  review: DirectoryReviewResponse;
  summary: DirectoryListingDetailResponse["reviewSummary"];
};
```

Delete response:

```ts
type DeleteDirectoryReviewResponse = {
  success: true;
  id: string;
  status: "hidden";
  summary: DirectoryListingDetailResponse["reviewSummary"];
};
```

Vote review:

```http
POST /api/directory/reviews/:id/vote
```

Required body:

```ts
type DirectoryReviewVoteBody = {
  vote: "helpful" | "not_helpful";
};
```

Vote/remove response:

```ts
type DirectoryReviewVoteResponse = {
  reviewId: string;
  vote: "helpful" | "not_helpful" | null;
  helpfulCount: number;
  notHelpfulCount: number;
  myVote: "helpful" | "not_helpful" | null;
};
```

#### 18. Recent Searches

List:

```http
GET /api/users/me/directory/recent-searches?limit=10
```

Response:

```ts
type DirectoryRecentSearchesResponse = {
  searches: Array<{
    id: string;
    query: string;
    city: string | null;
    categoryId: string | null;
    category: DirectoryCategoryResponse | null;
    createdAt: string;
    updatedAt: string;
  }>;
};
```

Save:

```http
POST /api/users/me/directory/recent-searches
```

Required body:

```ts
type SaveDirectoryRecentSearchBody = {
  query: string;
  city?: string;
  categoryId?: string;
};
```

Response:

```ts
type SaveDirectoryRecentSearchResponse = {
  search: DirectoryRecentSearchesResponse["searches"][number];
};
```

Clear response:

```ts
type ClearDirectoryRecentSearchesResponse = {
  success: true;
  deletedCount: number;
};
```

## Public And Optional Auth APIs

These APIs work without login. If the user is logged in, send bearer token so response can include `bookmarkedByMe`, `recommendedByMe`, and review gate state.

### List Categories

```http
GET /api/directory/categories?includeCounts=true
```

Response:

```json
{
  "categories": [
    {
      "id": "directory_category_education",
      "slug": "education",
      "name": "Education",
      "description": "Tutoring and education services",
      "icon": "book-open",
      "iconFamily": "lucide",
      "color": "#2563EB",
      "isActive": true,
      "sortOrder": 100,
      "listingCount": 12
    }
  ],
  "pagination": null
}
```

### Directory Home

```http
GET /api/directory/home?city=Pune&lat=18.5204&lng=73.8567&limit=10
```

Query:

| Name | Required | Notes |
| --- | --- | --- |
| `city` | No | City filter for nearby section. |
| `lat` | No | Latitude, -90 to 90. |
| `lng` | No | Longitude, -180 to 180. |
| `limit` | No | 1 to 20, default 10. |

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
    "categoryCount": 0,
    "city": "Pune"
  }
}
```

### Search Listings

```http
GET /api/directory/search?q=service&city=Pune&lat=18.5204&lng=73.8567&radiusKm=25&limit=20&offset=0
```

Query:

| Name | Required | Notes |
| --- | --- | --- |
| `q` | Yes | 1 to 100 chars. |
| `categoryId` | No | Filter by category. |
| `city` | No | Case-insensitive city filter. |
| `lat`, `lng` | No | Used for distance and radius. |
| `radiusKm` | No | Max 100. Requires `lat` and `lng` for radius filtering. |
| `limit` | No | 1 to 50, default 20. |
| `offset` | No | Default 0. |

Response:

```json
{
  "q": "service",
  "results": [],
  "listings": [],
  "suggestions": {
    "categories": [],
    "tags": [],
    "listings": []
  },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 0,
    "hasMore": false,
    "nextOffset": null
  }
}
```

Rate limit: 60 requests per minute.

### Search Suggestions

```http
GET /api/directory/search/suggestions?q=serv&limit=8
```

Response:

```json
{
  "q": "serv",
  "suggestions": {
    "listings": [],
    "categories": [],
    "tags": []
  }
}
```

### List Published Listings

```http
GET /api/directory/listings?categorySlug=education&city=Pune&sort=recommended&limit=20&offset=0
```

Query:

| Name | Required | Values |
| --- | --- | --- |
| `page` | No | Default 1. |
| `limit` | No | 1 to 50, default 20. |
| `offset` | No | Overrides page offset when provided. |
| `categoryId` | No | Category ID. |
| `categorySlug` | No | Category slug. |
| `q` | No | Text search. |
| `city` | No | City filter. |
| `state` | No | State filter. |
| `lat`, `lng`, `radiusKm` | No | Nearby filtering. |
| `verified` | No | `true` or `false`. |
| `homeServiceAvailable` | No | `true` or `false`. |
| `minRating` | No | Accepted by validation; currently listing sort is recommendation based. |
| `sort` | No | `recommended`, `nearby`, `rating`, `newest`, `popular`, `trending`. |

Response:

```json
{
  "listings": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "offset": 0,
    "total": 0,
    "hasMore": false,
    "nextOffset": null
  }
}
```

### Listing Detail

```http
GET /api/directory/listings/:id
```

Response:

```json
{
  "listing": {
    "id": "listing_id",
    "businessName": "Sai Family Test Service",
    "status": "published",
    "verificationStatus": "verified",
    "bookmarkedByMe": false,
    "recommendedByMe": false,
    "canEdit": false,
    "canDelete": false,
    "canVerify": false
  },
  "reviewSummary": {
    "averageRating": 0,
    "reviewCount": 0,
    "distribution": {
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0
    },
    "canReview": false,
    "reviewGateReason": "AUTH_REQUIRED"
  },
  "recentReviews": [],
  "similarListings": []
}
```

Contact fields are exposed on detail. On list cards, phone/WhatsApp/email are hidden unless viewer is owner or admin.

### Track Share

```http
POST /api/directory/listings/:id/share
```

Body:

```json
{
  "channel": "whatsapp"
}
```

Allowed `channel`: `system`, `whatsapp`, `copy`, `facebook`, `other`.

Response:

```json
{
  "listingId": "listing_id",
  "shared": true,
  "shares": 1,
  "_count": {
    "shares": 1
  }
}
```

### Track View

```http
POST /api/directory/listings/:id/view
```

Response:

```json
{
  "listingId": "listing_id",
  "viewed": true,
  "views": 1,
  "_count": {
    "views": 1
  }
}
```

### List Reviews

```http
GET /api/directory/listings/:id/reviews?sort=newest&limit=20&offset=0
```

Query:

| Name | Required | Values |
| --- | --- | --- |
| `rating` | No | 1 to 5. |
| `sort` | No | `newest`, `highest`, `lowest`, `helpful`. |
| `limit` | No | 1 to 50. |
| `offset` | No | Default 0. |

Response:

```json
{
  "summary": {
    "averageRating": 4.5,
    "reviewCount": 2,
    "canReview": false,
    "reviewGateReason": "ALREADY_REVIEWED"
  },
  "reviews": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 0,
    "hasMore": false,
    "nextOffset": null
  }
}
```

## Authenticated User APIs

### Create Listing

```http
POST /api/directory/listings
Authorization: Bearer <accessToken>
```

Body: use the common listing payload.

Response: `201 Created`

```json
{
  "listing": {
    "id": "listing_id",
    "status": "pending_review",
    "businessName": "Sai Family Test Service",
    "canEdit": true,
    "canDelete": true
  }
}
```

Frontend note: show a “Submitted for review” state after creation. Do not expect it in public search until admin approval.

### Update Own Listing

```http
PATCH /api/directory/listings/:id
Authorization: Bearer <accessToken>
```

Body: any partial listing fields.

```json
{
  "tagline": "Updated trusted service from Sai community",
  "homeServiceAvailable": false
}
```

Owner or admin only.

### Archive Own Listing

```http
DELETE /api/directory/listings/:id
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "success": true,
  "id": "listing_id",
  "status": "archived"
}
```

### Create Draft

```http
POST /api/directory/listing-drafts
Authorization: Bearer <accessToken>
```

Body: any partial listing fields, at least one field required.

```json
{
  "businessName": "Sai Draft Business",
  "categoryId": "directory_category_education",
  "city": "Pune"
}
```

Response: `201 Created`

```json
{
  "draft": {
    "id": "draft_id",
    "businessName": "Sai Draft Business",
    "publishedAt": null
  }
}
```

### Update Draft

```http
PATCH /api/directory/listing-drafts/:id
Authorization: Bearer <accessToken>
```

Body: any partial listing fields.

Published drafts cannot be updated.

### Publish Draft

```http
POST /api/directory/listing-drafts/:id/publish
Authorization: Bearer <accessToken>
```

The draft must satisfy full listing validation. Response creates a `pending_review` listing.

```json
{
  "draft": {
    "id": "draft_id",
    "publishedAt": "2026-07-06T00:00:00.000Z"
  },
  "listing": {
    "id": "listing_id",
    "status": "pending_review"
  }
}
```

### My Listings

```http
GET /api/users/me/directory/listings?status=pending_review&limit=20&offset=0
Authorization: Bearer <accessToken>
```

Query:

| Name | Required | Values |
| --- | --- | --- |
| `status` | No | Any `BusinessListingStatus`. |
| `limit` | No | 1 to 50. |
| `offset` | No | Default 0. |

Response:

```json
{
  "listings": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 0,
    "hasMore": false,
    "nextOffset": null
  }
}
```

### Bookmark Listing

```http
POST /api/directory/listings/:id/bookmark
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "listingId": "listing_id",
  "bookmarked": true,
  "_count": {
    "bookmarks": 1
  }
}
```

### Remove Bookmark

```http
DELETE /api/directory/listings/:id/bookmark
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "listingId": "listing_id",
  "bookmarked": false,
  "_count": {
    "bookmarks": 0
  }
}
```

### My Bookmarks

```http
GET /api/users/me/directory/bookmarks?limit=20&offset=0
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "bookmarks": [],
  "listings": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 0,
    "hasMore": false,
    "nextOffset": null
  }
}
```

### Recommend Listing

```http
POST /api/directory/listings/:id/recommend
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "listingId": "listing_id",
  "recommended": true,
  "_count": {
    "recommendations": 1
  }
}
```

Rules:

- User cannot recommend own listing.
- Listing must be published.
- Listing must have `communityRecommendationEnabled=true`.

### Remove Recommendation

```http
DELETE /api/directory/listings/:id/recommend
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "listingId": "listing_id",
  "recommended": false,
  "_count": {
    "recommendations": 0
  }
}
```

### Contact Listing

```http
POST /api/directory/listings/:id/contact
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "channel": "whatsapp",
  "message": "I would like to know more about your service."
}
```

Allowed `channel`: `call`, `whatsapp`, `email`, `in_app`.

Response: `201 Created`

```json
{
  "enquiry": {
    "id": "enquiry_id",
    "listingId": "listing_id",
    "channel": "whatsapp"
  },
  "contact": {
    "phoneNumber": "+919876543210",
    "whatsappNumber": "+919876543210",
    "email": "directory-test@example.com",
    "websiteUrl": "https://example.com"
  },
  "_count": {
    "enquiries": 1
  }
}
```

Rate limit: 20 requests per hour.

Important: review creation requires this enquiry/contact first.

### Report Listing

```http
POST /api/directory/listings/:id/report
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "reason": "wrong_info",
  "details": "The phone number or business information looks incorrect."
}
```

Allowed `reason`: `spam`, `inappropriate`, `scam`, `duplicate`, `wrong_info`, `other`.

Response: `201 Created`

```json
{
  "report": {
    "id": "report_id",
    "listingId": "listing_id",
    "reason": "wrong_info",
    "status": "pending"
  },
  "listingId": "listing_id",
  "reported": true
}
```

Rules:

- User cannot report own listing.
- One report per user/listing is upserted.

Rate limit: 10 requests per hour.

### Create Review

```http
POST /api/directory/listings/:id/reviews
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "rating": 5,
  "content": "This is a helpful review with enough content for validation."
}
```

Rules:

- Listing must be published.
- User cannot review own listing.
- User must first contact/enquire for the listing.
- One review per user/listing.
- `rating` must be 1 to 5.
- `content` must be 10 to 2000 chars.

Response: `201 Created`

```json
{
  "review": {
    "id": "review_id",
    "rating": 5,
    "status": "published",
    "verifiedInteraction": true,
    "helpfulCount": 0,
    "notHelpfulCount": 0,
    "myVote": null
  },
  "summary": {
    "averageRating": 5,
    "reviewCount": 1
  }
}
```

Rate limit: 10 requests per hour.

### Update Own Review

```http
PATCH /api/directory/reviews/:id
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "rating": 4,
  "content": "Updated review content with enough length for validation."
}
```

### Delete Own Review

```http
DELETE /api/directory/reviews/:id
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "success": true,
  "id": "review_id",
  "status": "hidden",
  "summary": {}
}
```

This is a soft delete by setting review status to `hidden`.

### Vote On Review

```http
POST /api/directory/reviews/:id/vote
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "vote": "helpful"
}
```

Allowed `vote`: `helpful`, `not_helpful`.

Response:

```json
{
  "reviewId": "review_id",
  "vote": "helpful",
  "helpfulCount": 1,
  "notHelpfulCount": 0,
  "myVote": "helpful"
}
```

### Remove Review Vote

```http
DELETE /api/directory/reviews/:id/vote
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "reviewId": "review_id",
  "vote": null,
  "helpfulCount": 0,
  "notHelpfulCount": 0,
  "myVote": null
}
```

### Recent Searches

List:

```http
GET /api/users/me/directory/recent-searches?limit=10
Authorization: Bearer <accessToken>
```

Save:

```http
POST /api/users/me/directory/recent-searches
Authorization: Bearer <accessToken>
```

```json
{
  "query": "service",
  "city": "Pune",
  "categoryId": "directory_category_education"
}
```

Clear:

```http
DELETE /api/users/me/directory/recent-searches
Authorization: Bearer <accessToken>
```

Clear response:

```json
{
  "success": true,
  "deletedCount": 3
}
```

## Admin APIs

All admin APIs require:

```http
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

### Create Category

```http
POST /api/admin/directory/categories
```

Body:

```json
{
  "name": "Admin Test Category",
  "slug": "admin-test-category",
  "description": "Temporary category for admin testing.",
  "icon": "briefcase-business",
  "iconFamily": "lucide",
  "color": "#B86B00",
  "sortOrder": 999,
  "isActive": true
}
```

Response: `201 Created`

```json
{
  "category": {
    "id": "category_id",
    "slug": "admin-test-category",
    "name": "Admin Test Category",
    "listingCount": 0,
    "draftCount": 0
  }
}
```

### Update Category

```http
PATCH /api/admin/directory/categories/:id
```

Body:

```json
{
  "name": "Admin Test Category Updated",
  "description": "Updated temporary category for admin testing.",
  "sortOrder": 998
}
```

### Deactivate Category

```http
DELETE /api/admin/directory/categories/:id
```

Response:

```json
{
  "success": true,
  "category": {}
}
```

This is a soft delete by setting `isActive=false`.

### Listing Moderation Queue

```http
GET /api/admin/directory/listings?status=pending_review&limit=20&offset=0
```

Query:

| Name | Required | Values |
| --- | --- | --- |
| `status` | No | Any `BusinessListingStatus`. |
| `verificationStatus` | No | Any `BusinessVerificationStatus`. |
| `categoryId` | No | Category ID. |
| `q` | No | Business, owner, or mobile search. |
| `city` | No | City filter. |
| `limit` | No | 1 to 100. |
| `offset` | No | Default 0. |

### Approve Listing

```http
POST /api/admin/directory/listings/:id/approve
```

Body:

```json
{
  "note": "Approved from admin review."
}
```

Sets `status=published`.

### Reject Listing

```http
POST /api/admin/directory/listings/:id/reject
```

Body:

```json
{
  "reason": "Incomplete business details",
  "note": "Please add complete contact and address details."
}
```

Sets `status=rejected`.

### Suspend Listing

```http
POST /api/admin/directory/listings/:id/suspend
```

Body:

```json
{
  "reason": "Policy issue under review"
}
```

Sets `status=suspended`.

### Restore Listing

```http
POST /api/admin/directory/listings/:id/restore
```

Body:

```json
{
  "note": "Restored for another review."
}
```

Sets `status=pending_review`.

### Verify Listing

```http
POST /api/admin/directory/listings/:id/verify
```

Body:

```json
{
  "verificationStatus": "verified",
  "note": "Verified from admin review."
}
```

Allowed `verificationStatus`: `unverified`, `pending`, `verified`, `rejected`.

### Unverify Listing

```http
POST /api/admin/directory/listings/:id/unverify
```

Body:

```json
{
  "note": "Verification removed."
}
```

Sets `verificationStatus=unverified`.

### Review Moderation Queue

```http
GET /api/admin/directory/reviews?status=published&rating=5&limit=20&offset=0
```

Query:

| Name | Required | Values |
| --- | --- | --- |
| `status` | No | Any `BusinessReviewStatus`. |
| `rating` | No | 1 to 5. |
| `listingId` | No | Listing ID. |
| `q` | No | Review, listing, reviewer, or mobile search. |
| `limit` | No | 1 to 100. |
| `offset` | No | Default 0. |

Actions:

```http
POST /api/admin/directory/reviews/:id/approve
POST /api/admin/directory/reviews/:id/reject
POST /api/admin/directory/reviews/:id/hide
POST /api/admin/directory/reviews/:id/restore
```

Body:

```json
{
  "note": "Review moderation note."
}
```

### Reports Queue

```http
GET /api/admin/directory/reports?status=pending&limit=20&offset=0
```

Query:

| Name | Required | Values |
| --- | --- | --- |
| `status` | No | `pending`, `resolved`, `dismissed`. |
| `reason` | No | Report reason string. |
| `listingId` | No | Listing ID. |
| `limit` | No | 1 to 100. |
| `offset` | No | Default 0. |

Resolve or dismiss:

```http
POST /api/admin/directory/reports/:id/resolve
```

Body:

```json
{
  "status": "resolved",
  "note": "Checked and resolved by admin."
}
```

Allowed `status`: `resolved`, `dismissed`.

### Analytics

```http
GET /api/admin/directory/analytics?days=30
```

Response:

```json
{
  "range": {
    "days": 30,
    "since": "2026-06-06T00:00:00.000Z"
  },
  "totals": {},
  "moderation": {},
  "recent": {},
  "breakdowns": {},
  "topCategories": [],
  "topCities": []
}
```

### Audit Logs

```http
GET /api/admin/directory/audit-logs?limit=50&offset=0
```

Query:

| Name | Required | Notes |
| --- | --- | --- |
| `actorId` | No | Admin/user who performed action. |
| `entity` | No | Example: `business_listing`. |
| `entityId` | No | Entity ID. |
| `action` | No | Example: `DIRECTORY_LISTING_APPROVED`. |
| `limit` | No | 1 to 100, default 50. |
| `offset` | No | Default 0. |

## Frontend Data Models

Recommended TypeScript models:

```ts
export interface DirectoryCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  iconFamily?: string | null;
  color?: string | null;
  isActive: boolean;
  sortOrder: number;
  listingCount?: number;
}

export interface DirectoryListing {
  id: string;
  ownerUserId: string;
  ownerName: string;
  ownerAvatarUrl?: string | null;
  businessName: string;
  slug: string;
  tagline?: string | null;
  description: string;
  categoryId: string;
  categoryName: string;
  category: DirectoryCategory;
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
  country: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  gallery: unknown[];
  status: BusinessListingStatus;
  verificationStatus: BusinessVerificationStatus;
  averageRating: number;
  reviewCount: number;
  recommendationCount: number;
  enquiryCount: number;
  viewCount: number;
  shareCount: number;
  bookmarkCount: number;
  bookmarkedByMe: boolean;
  recommendedByMe: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canVerify: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}
```

## Error Response Format

Standard error shape:

```json
{
  "error": {
    "code": "DIRECTORY_LISTING_NOT_FOUND",
    "message": "Business listing was not found"
  }
}
```

Common errors:

| Code | Meaning |
| --- | --- |
| `UNAUTHENTICATED` | Missing or invalid login. |
| `FORBIDDEN` | User is not owner/admin or lacks permission. |
| `INVALID_DIRECTORY_CATEGORY` | Category missing or inactive. |
| `DIRECTORY_LISTING_NOT_FOUND` | Listing not found or not visible to current user. |
| `DIRECTORY_DRAFT_NOT_FOUND` | Draft not found. |
| `DIRECTORY_DRAFT_ALREADY_PUBLISHED` | Draft was already published. |
| `INVALID_DIRECTORY_RECOMMENDATION` | User tried to recommend own listing. |
| `DIRECTORY_RECOMMENDATION_DISABLED` | Listing does not allow recommendations. |
| `INVALID_DIRECTORY_REPORT` | User tried to report own listing. |
| `INVALID_DIRECTORY_REVIEW` | User tried to review own listing. |
| `DIRECTORY_REVIEW_ENQUIRY_REQUIRED` | User must contact listing before review. |
| `DIRECTORY_REVIEW_ALREADY_EXISTS` | User already reviewed this listing. |
| `DIRECTORY_REVIEW_NOT_FOUND` | Review not found or hidden. |

## Frontend Integration Notes

- Use React Query query keys by resource, for example `["directory", "listings", filters]`, `["directory", "listing", id]`, `["directory", "my-listings", status]`.
- Invalidate listing detail and list queries after bookmark, recommend, contact, review, vote, update, or admin moderation.
- Treat create listing and publish draft as asynchronous moderation flows. The immediate status is `pending_review`.
- Show contact details mainly from listing detail or contact API response.
- Before showing review form, check `reviewSummary.canReview`. If false, use `reviewGateReason`:
  - `AUTH_REQUIRED`: ask user to login.
  - `ENQUIRY_REQUIRED`: ask user to contact the business first.
  - `ALREADY_REVIEWED`: show edit existing review flow if available.
- Use `pagination.hasMore` and `pagination.nextOffset` for infinite scroll.
- Use `distanceKm` only when frontend sends `lat` and `lng`.
- Upload images first with `POST /api/media/upload`; then pass URLs to Directory APIs.
- Directory images are optimized on the backend before Azure upload. Large JPG/PNG/WEBP files are resized to max 1600x1600 and stored as WebP to improve upload time and UI load performance.
- Frontend should still compress very large images before upload when possible, because client-side compression reduces mobile data usage and timeout risk before the request reaches the backend.
- Keep admin screens separate from user screens and always use admin token.

## Postman Variables

Recommended variables:

```text
baseUrl
accessToken
adminAccessToken
directoryCategoryId
directoryListingId
directoryDraftId
directoryReviewId
directoryReportId
uploadedMediaUrl
```

## Minimal Smoke Test Checklist

- `GET /api/directory/categories?includeCounts=true` returns 200.
- User creates listing and receives `status=pending_review`.
- Admin listing queue shows the pending listing.
- Admin approves listing and receives `status=published`.
- Public listing list/search can find the listing.
- Listing detail returns review summary and similar listings.
- User can bookmark and unbookmark.
- A different user can recommend.
- A different user can contact, then review.
- User can vote on a review and remove vote.
- User can report a listing.
- Admin report queue shows the report and can resolve it.
- Admin analytics and audit logs return 200.
