# GraphQL Performance And Migration Guide

## Purpose

This document explains GraphQL from a senior mobile engineering point of view, especially for the Sai Family mobile app.

Current frontend architecture:

- Expo React Native
- TypeScript
- REST APIs
- Axios
- Redux
- Redux Saga
- SecureStore auth/session persistence
- Feature modules for Experiences, Events, Directory, Sangha, Auth

GraphQL is not a replacement for clean architecture. It is an API design and data-fetching layer that can reduce over-fetching, under-fetching, screen load time, and endpoint fragmentation when used carefully.

## What GraphQL Is

GraphQL is a query language for APIs. Instead of the backend creating many fixed REST endpoints, the frontend asks for exactly the fields it needs.

REST example:

```http
GET /api/directory/listings/:id
```

The backend decides the full response shape.

GraphQL example:

```graphql
query DirectoryListingDetail($id: ID!) {
  directoryListing(id: $id) {
    id
    businessName
    tagline
    averageRating
    reviewCount
    owner {
      name
      profileImageUrl
    }
    category {
      name
      color
    }
  }
}
```

The frontend decides which fields it needs for that screen.

## Why GraphQL Helps Mobile Performance

Mobile apps are more sensitive than web apps because users often have:

- slower network
- unstable network
- limited mobile data
- older devices
- battery constraints
- high latency

GraphQL helps mainly in four areas.

## 1. Reduces Over-Fetching

Over-fetching means the API returns more data than the screen needs.

Example: Directory list screen card may need:

- `id`
- `businessName`
- `categoryName`
- `logoUrl`
- `averageRating`
- `verificationStatus`
- `city`

But a REST endpoint may return:

- full description
- gallery
- owner details
- phone number
- email
- website
- opening hours
- review distribution
- similar listings

That extra data increases:

- response size
- JSON parse time
- memory usage
- Redux store size
- render cost
- battery usage

With GraphQL, the list screen can ask only for card fields.

```graphql
query DirectoryListingCards($limit: Int!, $offset: Int!) {
  directoryListings(limit: $limit, offset: $offset) {
    nodes {
      id
      businessName
      categoryName
      city
      logoUrl
      averageRating
      reviewCount
      verificationStatus
    }
    pageInfo {
      hasNextPage
      nextOffset
    }
  }
}
```

## 2. Reduces Under-Fetching

Under-fetching means one screen needs data from multiple REST APIs.

Example: Directory detail screen may need:

- listing detail
- review summary
- recent reviews
- similar listings
- owner summary
- user bookmark/recommend state

REST often becomes:

```http
GET /api/directory/listings/:id
GET /api/directory/listings/:id/reviews
GET /api/directory/listings/:id/similar
GET /api/users/me/directory/bookmarks
```

That means multiple network calls and more loading states.

GraphQL can fetch the whole screen in one request:

```graphql
query DirectoryListingDetail($id: ID!) {
  directoryListing(id: $id) {
    id
    businessName
    description
    phoneNumber
    whatsappNumber
    gallery {
      id
      url
      type
    }
    owner {
      id
      name
      memberId
      profileImageUrl
    }
    reviewSummary {
      averageRating
      reviewCount
      distribution
      canReview
      reviewGateReason
    }
    recentReviews(limit: 3) {
      id
      rating
      content
      reviewerName
    }
    similarListings(limit: 5) {
      id
      businessName
      logoUrl
      categoryName
      city
    }
    bookmarkedByMe
    recommendedByMe
  }
}
```

This improves:

- time to usable screen
- request coordination
- loading state complexity
- mobile network efficiency

## 3. Better Screen-Based Data Contracts

REST is usually endpoint-based.

GraphQL is screen/query-based.

For mobile development, screen-based contracts are very powerful.

Example:

- `DirectoryHomeQuery`
- `DirectorySearchQuery`
- `DirectoryListingDetailQuery`
- `EventCalendarQuery`
- `SanghaGroupDetailQuery`
- `ExperienceFeedQuery`

Each query becomes a contract between frontend and backend.

When the UI changes, the frontend updates the query fields instead of asking backend to create another custom endpoint.

## 4. Better Caching Possibilities

GraphQL works very well with normalized caching libraries such as:

- Apollo Client
- urql
- Relay

Normalized caching stores entities by ID.

Example:

```ts
DirectoryListing:cmr98583l000myyaw726zrszr
```

If the same listing appears in:

- Directory home
- Search result
- Saved listings
- Detail screen

GraphQL cache can reuse and update the same entity.

This can reduce:

- repeated API calls
- stale UI
- manual Redux reducer complexity
- duplicate state bugs

## REST vs GraphQL

| Area | REST | GraphQL |
| --- | --- | --- |
| Response shape | Backend fixed | Frontend selected |
| Endpoints | Many endpoints | Usually one endpoint |
| Over-fetching | Common | Reduced |
| Under-fetching | Common | Reduced |
| Caching | HTTP and custom app cache | Normalized entity cache |
| Learning curve | Lower | Higher |
| Debugging | Simple with Postman | Needs GraphQL tooling |
| File upload | Simple multipart REST | Possible but often still REST |
| Best for | Simple CRUD, uploads, public APIs | Complex screens, nested data, mobile optimization |

## Where GraphQL Helps Sai Family Most

GraphQL would help most in screens that currently compose many related entities.

### 1. Directory

Good GraphQL candidates:

- Directory home
- Directory search
- Listing detail
- My listings
- Saved listings
- Reviews

Why:

- Listing cards need smaller data than detail screen.
- Detail screen needs listing, owner, review summary, reviews, similar listings.
- User-specific state like `bookmarkedByMe` and `recommendedByMe` can be included in the same query.

### 2. Events

Good GraphQL candidates:

- Events hub
- Event detail
- Calendar
- My events
- RSVPs

Why:

- Event detail needs event, organizer, attendees, comments, photos, reviews, RSVP state.
- Calendar needs compact event markers, not full event payload.
- Hub needs multiple sections: featured, nearby, trending, categories.

### 3. Sangha

Good GraphQL candidates:

- Sangha home
- Group detail
- Group feed
- Group members
- Group events
- Notifications

Why:

- Group detail has nested tabs and many relationship states.
- Unified feed can include experiences, events, posts, polls, and announcements.

### 4. Experiences

Good GraphQL candidates:

- Experience feed
- Experience detail
- Comments
- Bookmarks

Why:

- Feed needs compact cards.
- Detail needs full content, comments, author, like/bookmark state.

## Where REST Should Still Stay

GraphQL should not replace everything.

Keep REST for:

- media upload
- profile image upload
- event banner upload
- directory image upload
- push token registration
- auth OTP send/verify
- webhooks
- file downloads
- health checks

Why:

- File upload is simpler and more reliable with REST multipart/form-data.
- Auth endpoints are security-sensitive and easier to audit with REST.
- Health checks should stay simple.

Recommended hybrid architecture:

```text
REST:
  Auth
  Account creation
  Media upload
  Push token
  Health checks

GraphQL:
  Feed/query-heavy app screens
  Detail screens
  Search screens
  Dashboards
  Nested community screens
```

## GraphQL Architecture For This App

Recommended frontend folder structure:

```text
graphql/
  client.ts
  fragments/
    directory.ts
    events.ts
    sangha.ts
    experiences.ts
  queries/
    directory.ts
    events.ts
    sangha.ts
    experiences.ts
  mutations/
    directory.ts
    events.ts
    sangha.ts
    experiences.ts
  generated/
    types.ts
```

Feature module stays clean:

```text
store/
  directory/
    actions.ts
    reducer.ts
    saga.ts
    selectors.ts
    types.ts
```

GraphQL can be used from Redux Saga first, without a full rewrite.

## Option A: GraphQL With Redux Saga

This is the safest migration path for the current app.

Redux Saga continues to manage:

- loading state
- errors
- optimistic updates
- navigation side effects
- SecureStore session usage
- retry logic

GraphQL replaces selected REST service calls.

Example service:

```ts
import { gqlClient } from "@/graphql/client";
import { DIRECTORY_HOME_QUERY } from "@/graphql/queries/directory";

export async function apiFetchDirectoryHomeGraphql() {
  return gqlClient.request(DIRECTORY_HOME_QUERY, {
    limit: 10,
  });
}
```

Saga:

```ts
function* fetchDirectoryHomeWorker() {
  try {
    const response = yield call(apiFetchDirectoryHomeGraphql);
    yield put(fetchDirectoryHomeSuccess(response.directoryHome));
  } catch (error) {
    yield put(fetchDirectoryHomeFailure(getErrorMessage(error)));
  }
}
```

Pros:

- Low migration risk.
- Existing Redux selectors keep working.
- Existing UI does not need major changes.
- Easier team adoption.

Cons:

- You do not get full normalized GraphQL cache benefits.
- Redux state mapping still required.

## Option B: Apollo Client

Apollo Client can replace some Redux server-state flows.

Best for:

- query caching
- pagination
- normalized cache
- optimistic updates
- automatic refetching

Example:

```ts
const { data, loading, error, fetchMore } = useQuery(
  DIRECTORY_SEARCH_QUERY,
  {
    variables: {
      q,
      limit: 20,
      offset: 0,
    },
  }
);
```

Pros:

- Strong GraphQL ecosystem.
- Built-in normalized cache.
- Less Redux boilerplate for server state.

Cons:

- More architectural change.
- Need clear boundary between Redux UI state and Apollo server state.
- Team must learn Apollo cache policies.

Recommended if:

- Backend commits to GraphQL long term.
- App has many nested screens.
- Team is ready to move server state away from Redux Saga gradually.

## Recommended Migration Strategy

Do not migrate everything at once.

### Phase 1: Add GraphQL Gateway Backend

Backend adds:

```text
POST /graphql
```

Keep existing REST APIs working.

GraphQL resolvers can internally call existing services/repositories.

### Phase 2: Start With Read-Heavy Screens

Good first candidates:

1. Directory home
2. Directory detail
3. Event detail
4. Sangha group detail

Avoid starting with:

- auth
- uploads
- complex mutations

### Phase 3: Use GraphQL Fragments

Fragments prevent field duplication.

```graphql
fragment DirectoryListingCardFields on DirectoryListing {
  id
  businessName
  categoryName
  city
  logoUrl
  averageRating
  reviewCount
  verificationStatus
  bookmarkedByMe
}
```

List screen:

```graphql
query DirectoryListings($limit: Int!, $offset: Int!) {
  directoryListings(limit: $limit, offset: $offset) {
    nodes {
      ...DirectoryListingCardFields
    }
    pageInfo {
      hasMore
      nextOffset
    }
  }
}
```

### Phase 4: Generate TypeScript Types

Use GraphQL Code Generator.

Benefits:

- typed query results
- typed variables
- safer refactors
- less manual DTO mismatch

Recommended packages:

```text
@graphql-codegen/cli
@graphql-codegen/typescript
@graphql-codegen/typescript-operations
```

### Phase 5: Add Cache Strategy

Cache policy examples:

- Directory home: cache for short time, refresh on pull.
- Listing detail: cache by ID.
- Search: cache by query variables.
- User actions: update entity after mutation.

## Backend Architecture

Recommended Node.js backend architecture:

```text
src/
  graphql/
    schema/
      directory.graphql
      events.graphql
      sangha.graphql
      experiences.graphql
    resolvers/
      directory.resolver.ts
      events.resolver.ts
      sangha.resolver.ts
      experiences.resolver.ts
    loaders/
      user.loader.ts
      category.loader.ts
      listing.loader.ts
    context.ts
  modules/
    directory/
      directory.controller.ts
      directory.service.ts
      directory.repository.ts
```

Resolvers should call services, not Prisma directly.

Good:

```ts
directoryListing: async (_, args, ctx) => {
  return directoryService.getListingDetail({
    id: args.id,
    userId: ctx.user?.id,
  });
}
```

Avoid:

```ts
directoryListing: async (_, args) => {
  return prisma.businessListing.findUnique(...);
}
```

Why:

- Keeps business rules reusable.
- Keeps REST and GraphQL behavior consistent.
- Easier testing.

## Avoiding N+1 Query Problems

GraphQL can create N+1 database problems if implemented badly.

Example:

- Fetch 20 listings.
- For each listing, fetch owner separately.
- For each listing, fetch category separately.

That can become 41 database queries.

Use DataLoader:

```ts
const userLoader = new DataLoader(async (userIds) => {
  const users = await userRepository.findByIds(userIds);
  return userIds.map((id) => users.find((user) => user.id === id));
});
```

Then resolver:

```ts
owner: (listing, _, ctx) => {
  return ctx.loaders.userLoader.load(listing.ownerUserId);
}
```

This batches related entity loading.

## Security Considerations

GraphQL needs careful security controls.

### 1. Authentication

Use the same JWT bearer token:

```http
Authorization: Bearer <accessToken>
```

GraphQL context:

```ts
type GraphQLContext = {
  user: AuthUser | null;
  loaders: Loaders;
};
```

### 2. Authorization

Check permissions inside service layer.

Examples:

- Only listing owner can update listing.
- Only admin can verify listing.
- Only group member can post in private Sangha group.

### 3. Query Depth Limit

Block deeply nested abusive queries.

Example dangerous query:

```graphql
query {
  sanghaGroups {
    members {
      groups {
        members {
          groups {
            members {
              id
            }
          }
        }
      }
    }
  }
}
```

Add:

- depth limit
- complexity limit
- rate limiting
- persisted queries for production

### 4. Field-Level Privacy

Public listing cards should not expose phone/email.

GraphQL should enforce privacy:

```graphql
type DirectoryListing {
  id: ID!
  businessName: String!
  phoneNumber: String
}
```

Resolver:

```ts
phoneNumber: (listing, _, ctx) => {
  if (ctx.user?.id === listing.ownerUserId || ctx.user?.isAdmin) {
    return listing.phoneNumber;
  }

  return null;
}
```

## Performance Best Practices

### Use Fragments

Keeps fields consistent across screens.

### Use Pagination Everywhere

Never return unbounded arrays.

Use:

- `limit`
- `offset`
- `cursor`
- `hasMore`
- `nextOffset`

### Use Persisted Queries

In production, the app sends a query hash instead of full query text.

Benefits:

- smaller payload
- more security
- easier allow-listing

### Use Response Compression

Enable gzip/brotli on the backend.

### Avoid Huge Nested Queries

Do not fetch:

- full comments
- full members
- full reviews
- full media galleries

inside every list item.

Use separate pagination fields:

```graphql
reviews(limit: 3)
comments(limit: 20, offset: 0)
members(limit: 20, offset: 0)
```

## GraphQL Example For Directory

### Directory Home Query

```graphql
query DirectoryHome($city: String, $lat: Float, $lng: Float, $limit: Int) {
  directoryHome(city: $city, lat: $lat, lng: $lng, limit: $limit) {
    stats {
      totalListings
      verifiedListings
      categoryCount
      city
    }
    categories {
      id
      slug
      name
      icon
      iconFamily
      color
      listingCount
    }
    featuredListings {
      ...DirectoryListingCardFields
    }
    nearbyListings {
      ...DirectoryListingCardFields
      distanceKm
    }
    popularCategories {
      id
      name
      slug
      color
      listingCount
    }
    trendingListings {
      ...DirectoryListingCardFields
    }
  }
}
```

### Directory Listing Card Fragment

```graphql
fragment DirectoryListingCardFields on DirectoryListing {
  id
  businessName
  tagline
  categoryName
  city
  state
  logoUrl
  bannerUrl
  averageRating
  reviewCount
  recommendationCount
  viewCount
  enquiryCount
  verificationStatus
  homeServiceAvailable
  bookmarkedByMe
  recommendedByMe
  specialties
  tags
  serviceAreas
}
```

### Directory Detail Query

```graphql
query DirectoryListingDetail($id: ID!) {
  directoryListing(id: $id) {
    id
    businessName
    slug
    tagline
    description
    category {
      id
      name
      slug
      color
      description
    }
    subcategories
    specialties
    tags
    serviceAreas
    yearsOfExperience
    homeServiceAvailable
    communityRecommendationEnabled
    phoneNumber
    whatsappNumber
    email
    websiteUrl
    address
    city
    state
    country
    pincode
    latitude
    longitude
    logoUrl
    bannerUrl
    gallery {
      id
      url
      type
      sortOrder
    }
    verificationStatus
    verifiedAt
    averageRating
    reviewCount
    recommendationCount
    enquiryCount
    viewCount
    shareCount
    bookmarkCount
    openingHours
    responseTimeLabel
    bookmarkedByMe
    recommendedByMe
    canEdit
    canDelete
    owner {
      id
      memberId
      name
      handle
      profileImageUrl
      memberSince
    }
    reviewSummary {
      averageRating
      reviewCount
      distribution
      canReview
      reviewGateReason
    }
    recentReviews(limit: 3) {
      id
      rating
      content
      reviewerName
      reviewerAvatarUrl
      helpfulCount
      myVote
      createdAt
    }
    similarListings(limit: 5) {
      ...DirectoryListingCardFields
    }
  }
}
```

## GraphQL Mutations

Mutations change data.

Example bookmark mutation:

```graphql
mutation BookmarkDirectoryListing($id: ID!) {
  bookmarkDirectoryListing(id: $id) {
    listingId
    bookmarked
    listing {
      id
      bookmarkedByMe
      bookmarkCount
    }
  }
}
```

Example create review:

```graphql
mutation CreateDirectoryReview($listingId: ID!, $input: CreateReviewInput!) {
  createDirectoryReview(listingId: $listingId, input: $input) {
    review {
      id
      rating
      content
      reviewerName
      createdAt
    }
    summary {
      averageRating
      reviewCount
      distribution
      canReview
      reviewGateReason
    }
  }
}
```

## How GraphQL Works With Redux Saga

Current REST flow:

```text
Screen
  dispatch(action)
Saga
  call REST service
Reducer
  save response
Selector
  screen reads data
```

GraphQL with Redux Saga:

```text
Screen
  dispatch(action)
Saga
  call GraphQL service
Reducer
  save mapped response
Selector
  screen reads data
```

Only service layer changes first.

Example:

```ts
export async function apiFetchDirectoryHome(params: DirectoryHomeParams) {
  const data = await gqlClient.request(DIRECTORY_HOME_QUERY, params);
  return data.directoryHome;
}
```

Reducers and selectors can remain almost the same.

## When To Choose GraphQL In This Project

Choose GraphQL when:

- screen needs nested data
- screen currently calls 2 or more APIs
- REST response is too large for the screen
- same entity appears in many places
- mobile performance is affected by repeated requests
- the UI changes often and backend endpoint changes slow the team down

Keep REST when:

- uploading files
- login/OTP
- account creation form-data
- simple one-purpose action
- webhook or health endpoint

## Risks Of GraphQL

GraphQL is powerful but not magic.

Risks:

- bad resolver design can make database slower
- no query depth limit can create abuse risk
- too many fields in one query can still be slow
- cache invalidation needs discipline
- team needs tooling and training
- debugging requires GraphQL-specific tools

Mitigation:

- use DataLoader
- use service layer
- add query depth and complexity limits
- generate TypeScript types
- use fragments
- keep uploads on REST
- migrate gradually

## Recommended Decision For Sai Family

Do not replace REST completely.

Recommended approach:

1. Keep REST for auth, uploads, push tokens, and simple mutations.
2. Add GraphQL for read-heavy, nested screens.
3. Start with Directory home/detail because the response model is already rich.
4. Keep Redux Saga initially to avoid a large architecture rewrite.
5. Later evaluate Apollo Client for normalized cache if GraphQL usage grows.

Best first GraphQL candidates:

- `DirectoryHomeQuery`
- `DirectoryListingDetailQuery`
- `EventDetailQuery`
- `SanghaGroupDetailQuery`
- `ExperienceDetailQuery`

This gives performance improvement while keeping project risk controlled.

