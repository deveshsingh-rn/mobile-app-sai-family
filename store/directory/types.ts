export type DirectoryPagination = {
  hasMore?: boolean;
  limit: number;
  nextOffset?: number | null;
  offset: number;
  page?: number;
  total?: number;
  totalPages?: number;
};

export type DirectoryCategory = {
  color?: string | null;
  description?: string | null;
  icon?: string | null;
  iconFamily?: string | null;
  id: string;
  isActive?: boolean;
  listingCount?: number;
  name: string;
  slug: string;
  sortOrder?: number;
};

export type DirectoryMedia = {
  createdAt?: string;
  height?: number | null;
  id?: string;
  listingId?: string;
  mimeType?: string | null;
  sortOrder?: number;
  type?: "logo" | "banner" | "gallery" | string;
  url: string;
  width?: number | null;
};

export type DirectoryOwnerSummary = {
  avatarUrl?: string | null;
  badge?: string | null;
  city?: string | null;
  handle?: string | null;
  id: string;
  memberId?: string | null;
  memberSince?: string | null;
  name: string;
  profileImageUrl?: string | null;
};

export type DirectoryListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "suspended"
  | "archived";

export type DirectoryVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export type DirectoryListing = {
  address?: string | null;
  averageRating?: number;
  bannerUrl?: string | null;
  bookmarkedByMe?: boolean;
  bookmarkCount?: number;
  businessName: string;
  canDelete?: boolean;
  canEdit?: boolean;
  canVerify?: boolean;
  category?: DirectoryCategory | null;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  city?: string | null;
  communityRecommendationEnabled?: boolean;
  country?: string | null;
  createdAt?: string;
  description?: string;
  distanceKm?: number | null;
  email?: string | null;
  enquiryCount?: number;
  gallery?: DirectoryMedia[];
  homeServiceAvailable?: boolean;
  id: string;
  latitude?: number | null;
  logoUrl?: string | null;
  longitude?: number | null;
  openingHours?: Record<string, unknown> | null;
  owner?: DirectoryOwnerSummary | null;
  ownerAvatarUrl?: string | null;
  ownerDevoteeBadge?: string | null;
  ownerMemberId?: string | null;
  ownerMemberSince?: string | null;
  ownerName?: string | null;
  ownerUserId?: string;
  phoneNumber?: string | null;
  pincode?: string | null;
  publishedAt?: string | null;
  recommendationCount?: number;
  recommendedByMe?: boolean;
  responseTimeLabel?: string | null;
  reviewCount?: number;
  serviceAreas?: string[];
  shareCount?: number;
  slug?: string;
  specialties?: string[];
  state?: string | null;
  status?: DirectoryListingStatus;
  subcategories?: string[];
  tagline?: string | null;
  tags?: string[];
  updatedAt?: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  verificationStatus?: DirectoryVerificationStatus;
  viewCount?: number;
  websiteUrl?: string | null;
  whatsappNumber?: string | null;
  yearsOfExperience?: number | null;
};

export type DirectoryReviewSummary = {
  averageRating?: number;
  canReview?: boolean;
  distribution?: Record<string, number>;
  reviewCount?: number;
  reviewGateReason?: string | null;
};

export type DirectoryReview = {
  canDelete?: boolean;
  canEdit?: boolean;
  content: string;
  createdAt?: string;
  helpfulCount?: number;
  id: string;
  listingId?: string;
  myVote?: "helpful" | "not_helpful" | null;
  notHelpfulCount?: number;
  rating: number;
  reviewerAvatarUrl?: string | null;
  reviewerBadge?: string | null;
  reviewerCity?: string | null;
  reviewerMemberSince?: string | null;
  reviewerName?: string | null;
  reviewerUserId?: string;
  status?: "pending" | "published" | "hidden" | "rejected";
  updatedAt?: string;
  verifiedInteraction?: boolean;
};

export type DirectorySearchSuggestion = {
  id?: string;
  label: string;
  subtitle?: string | null;
  type: "listing" | "category" | "tag" | string;
};

export type DirectoryRecentSearch = {
  categoryId?: string | null;
  city?: string | null;
  createdAt?: string;
  id?: string;
  query: string;
};

export type DirectoryHomeResult = {
  categories?: DirectoryCategory[];
  featuredListings?: DirectoryListing[];
  nearbyListings?: DirectoryListing[];
  popularCategories?: DirectoryCategory[];
  stats?: {
    categories?: number;
    totalListings?: number;
    verifiedListings?: number;
  };
  trendingListings?: DirectoryListing[];
};

export type DirectoryListParams = {
  categoryId?: string;
  categorySlug?: string;
  city?: string;
  homeServiceAvailable?: boolean;
  lat?: number;
  limit?: number;
  lng?: number;
  minRating?: number;
  offset?: number;
  page?: number;
  q?: string;
  radiusKm?: number;
  sort?:
    | "recommended"
    | "nearby"
    | "rating"
    | "newest"
    | "popular"
    | "trending";
  state?: string;
  status?: DirectoryListingStatus;
  verified?: boolean;
};

export type DirectoryListResult = {
  listings?: DirectoryListing[];
  pagination?: DirectoryPagination | null;
  results?: DirectoryListing[];
};

export type DirectoryDetailResult = {
  listing: DirectoryListing;
  recentReviews?: DirectoryReview[];
  reviewSummary?: DirectoryReviewSummary | null;
  similarListings?: DirectoryListing[];
};

export type DirectoryReviewsResult = {
  pagination?: DirectoryPagination | null;
  reviews: DirectoryReview[];
  summary?: DirectoryReviewSummary | null;
};

export type DirectoryCreateListingPayload = {
  address: string;
  bannerUrl?: string | null;
  businessName: string;
  categoryId: string;
  city: string;
  communityRecommendationEnabled?: boolean;
  country?: string;
  description: string;
  email?: string;
  galleryUrls?: string[];
  homeServiceAvailable?: boolean;
  latitude?: number;
  logoUrl?: string | null;
  longitude?: number;
  openingHours?: Record<string, unknown> | null;
  phoneNumber?: string;
  pincode?: string;
  serviceAreas?: string[];
  specialties?: string[];
  state?: string;
  subcategories?: string[];
  tagline?: string;
  tags?: string[];
  websiteUrl?: string;
  whatsappNumber?: string;
  yearsOfExperience?: number;
};

export type DirectoryUpdateListingPayload =
  Partial<DirectoryCreateListingPayload>;

export type DirectoryDraft = {
  id: string;
  payload?: Partial<DirectoryCreateListingPayload>;
  publishedAt?: string | null;
  updatedAt?: string;
};

export type DirectoryContactPayload = {
  channel: "call" | "whatsapp" | "email" | "in_app";
  message?: string;
};

export type DirectoryReportPayload = {
  details?: string;
  reason:
    | "spam"
    | "incorrect_information"
    | "fraud"
    | "offensive_content"
    | "duplicate"
    | "other";
};

export type DirectoryReviewPayload = {
  content: string;
  rating: number;
};

export type DirectoryReviewVotePayload = {
  vote: "helpful" | "not_helpful";
};

export type DirectoryUploadMediaPayload = {
  files?: Array<{
    mimeType?: string;
    name?: string;
    type?: string;
    uri: string;
  }>;
  file?: {
    mimeType?: string;
    name?: string;
    type?: string;
    uri: string;
  };
};

export type DirectoryUploadMediaResult = {
  media?: DirectoryMedia | DirectoryMedia[];
  url?: string;
  urls?: string[];
};

export type DirectoryState = {
  bookmarks: DirectoryListing[];
  bookmarksLoading: boolean;
  bookmarksPagination: DirectoryPagination | null;
  categories: DirectoryCategory[];
  categoriesLoading: boolean;
  contactPendingIds: Record<string, boolean>;
  creating: boolean;
  currentDraftId: string | null;
  detail: DirectoryListing | null;
  draftsById: Record<string, DirectoryDraft>;
  draftSaving: boolean;
  error: string | null;
  home: DirectoryHomeResult | null;
  homeLoading: boolean;
  listingActionPendingIds: Record<string, boolean>;
  listings: DirectoryListing[];
  listingsLoading: boolean;
  listingsPagination: DirectoryPagination | null;
  myListings: DirectoryListing[];
  myListingsLoading: boolean;
  myListingsPagination: DirectoryPagination | null;
  recentReviews: DirectoryReview[];
  recentSearches: DirectoryRecentSearch[];
  recentSearchesLoading: boolean;
  reviewSummary: DirectoryReviewSummary | null;
  reviewsByListingId: Record<string, DirectoryReviewsResult>;
  reviewsLoadingIds: Record<string, boolean>;
  searchLoading: boolean;
  searchPagination: DirectoryPagination | null;
  searchResults: DirectoryListing[];
  similarListings: DirectoryListing[];
  suggestions: DirectorySearchSuggestion[];
  suggestionsLoading: boolean;
  uploadedMedia: DirectoryUploadMediaResult | null;
  uploadingMedia: boolean;
};

export const DIRECTORY_ACTIONS = {
  ADD_RECENT_SEARCH_FAILURE: "directory/ADD_RECENT_SEARCH_FAILURE",
  ADD_RECENT_SEARCH_REQUEST: "directory/ADD_RECENT_SEARCH_REQUEST",
  ADD_RECENT_SEARCH_SUCCESS: "directory/ADD_RECENT_SEARCH_SUCCESS",
  BOOKMARK_FAILURE: "directory/BOOKMARK_FAILURE",
  BOOKMARK_REQUEST: "directory/BOOKMARK_REQUEST",
  BOOKMARK_SUCCESS: "directory/BOOKMARK_SUCCESS",
  CLEAR_RECENT_SEARCHES_FAILURE:
    "directory/CLEAR_RECENT_SEARCHES_FAILURE",
  CLEAR_RECENT_SEARCHES_REQUEST:
    "directory/CLEAR_RECENT_SEARCHES_REQUEST",
  CLEAR_RECENT_SEARCHES_SUCCESS:
    "directory/CLEAR_RECENT_SEARCHES_SUCCESS",
  CONTACT_FAILURE: "directory/CONTACT_FAILURE",
  CONTACT_REQUEST: "directory/CONTACT_REQUEST",
  CONTACT_SUCCESS: "directory/CONTACT_SUCCESS",
  CREATE_DRAFT_FAILURE: "directory/CREATE_DRAFT_FAILURE",
  CREATE_DRAFT_REQUEST: "directory/CREATE_DRAFT_REQUEST",
  CREATE_DRAFT_SUCCESS: "directory/CREATE_DRAFT_SUCCESS",
  CREATE_LISTING_FAILURE: "directory/CREATE_LISTING_FAILURE",
  CREATE_LISTING_REQUEST: "directory/CREATE_LISTING_REQUEST",
  CREATE_LISTING_SUCCESS: "directory/CREATE_LISTING_SUCCESS",
  DELETE_LISTING_FAILURE: "directory/DELETE_LISTING_FAILURE",
  DELETE_LISTING_REQUEST: "directory/DELETE_LISTING_REQUEST",
  DELETE_LISTING_SUCCESS: "directory/DELETE_LISTING_SUCCESS",
  FETCH_BOOKMARKS_FAILURE: "directory/FETCH_BOOKMARKS_FAILURE",
  FETCH_BOOKMARKS_REQUEST: "directory/FETCH_BOOKMARKS_REQUEST",
  FETCH_BOOKMARKS_SUCCESS: "directory/FETCH_BOOKMARKS_SUCCESS",
  FETCH_CATEGORIES_FAILURE: "directory/FETCH_CATEGORIES_FAILURE",
  FETCH_CATEGORIES_REQUEST: "directory/FETCH_CATEGORIES_REQUEST",
  FETCH_CATEGORIES_SUCCESS: "directory/FETCH_CATEGORIES_SUCCESS",
  FETCH_DETAIL_FAILURE: "directory/FETCH_DETAIL_FAILURE",
  FETCH_DETAIL_REQUEST: "directory/FETCH_DETAIL_REQUEST",
  FETCH_DETAIL_SUCCESS: "directory/FETCH_DETAIL_SUCCESS",
  FETCH_HOME_FAILURE: "directory/FETCH_HOME_FAILURE",
  FETCH_HOME_REQUEST: "directory/FETCH_HOME_REQUEST",
  FETCH_HOME_SUCCESS: "directory/FETCH_HOME_SUCCESS",
  FETCH_LISTINGS_FAILURE: "directory/FETCH_LISTINGS_FAILURE",
  FETCH_LISTINGS_REQUEST: "directory/FETCH_LISTINGS_REQUEST",
  FETCH_LISTINGS_SUCCESS: "directory/FETCH_LISTINGS_SUCCESS",
  FETCH_MY_LISTINGS_FAILURE: "directory/FETCH_MY_LISTINGS_FAILURE",
  FETCH_MY_LISTINGS_REQUEST: "directory/FETCH_MY_LISTINGS_REQUEST",
  FETCH_MY_LISTINGS_SUCCESS: "directory/FETCH_MY_LISTINGS_SUCCESS",
  FETCH_RECENT_SEARCHES_FAILURE:
    "directory/FETCH_RECENT_SEARCHES_FAILURE",
  FETCH_RECENT_SEARCHES_REQUEST:
    "directory/FETCH_RECENT_SEARCHES_REQUEST",
  FETCH_RECENT_SEARCHES_SUCCESS:
    "directory/FETCH_RECENT_SEARCHES_SUCCESS",
  FETCH_REVIEWS_FAILURE: "directory/FETCH_REVIEWS_FAILURE",
  FETCH_REVIEWS_REQUEST: "directory/FETCH_REVIEWS_REQUEST",
  FETCH_REVIEWS_SUCCESS: "directory/FETCH_REVIEWS_SUCCESS",
  FETCH_SUGGESTIONS_FAILURE: "directory/FETCH_SUGGESTIONS_FAILURE",
  FETCH_SUGGESTIONS_REQUEST: "directory/FETCH_SUGGESTIONS_REQUEST",
  FETCH_SUGGESTIONS_SUCCESS: "directory/FETCH_SUGGESTIONS_SUCCESS",
  PUBLISH_DRAFT_FAILURE: "directory/PUBLISH_DRAFT_FAILURE",
  PUBLISH_DRAFT_REQUEST: "directory/PUBLISH_DRAFT_REQUEST",
  PUBLISH_DRAFT_SUCCESS: "directory/PUBLISH_DRAFT_SUCCESS",
  RECOMMEND_FAILURE: "directory/RECOMMEND_FAILURE",
  RECOMMEND_REQUEST: "directory/RECOMMEND_REQUEST",
  RECOMMEND_SUCCESS: "directory/RECOMMEND_SUCCESS",
  REPORT_FAILURE: "directory/REPORT_FAILURE",
  REPORT_REQUEST: "directory/REPORT_REQUEST",
  REPORT_SUCCESS: "directory/REPORT_SUCCESS",
  REVIEW_VOTE_FAILURE: "directory/REVIEW_VOTE_FAILURE",
  REVIEW_VOTE_CLEAR_FAILURE:
    "directory/REVIEW_VOTE_CLEAR_FAILURE",
  REVIEW_VOTE_CLEAR_REQUEST:
    "directory/REVIEW_VOTE_CLEAR_REQUEST",
  REVIEW_VOTE_CLEAR_SUCCESS:
    "directory/REVIEW_VOTE_CLEAR_SUCCESS",
  REVIEW_DELETE_FAILURE:
    "directory/REVIEW_DELETE_FAILURE",
  REVIEW_DELETE_REQUEST:
    "directory/REVIEW_DELETE_REQUEST",
  REVIEW_DELETE_SUCCESS:
    "directory/REVIEW_DELETE_SUCCESS",
  REVIEW_UPDATE_FAILURE:
    "directory/REVIEW_UPDATE_FAILURE",
  REVIEW_UPDATE_REQUEST:
    "directory/REVIEW_UPDATE_REQUEST",
  REVIEW_UPDATE_SUCCESS:
    "directory/REVIEW_UPDATE_SUCCESS",
  REVIEW_VOTE_REQUEST: "directory/REVIEW_VOTE_REQUEST",
  REVIEW_VOTE_SUCCESS: "directory/REVIEW_VOTE_SUCCESS",
  SEARCH_FAILURE: "directory/SEARCH_FAILURE",
  SEARCH_REQUEST: "directory/SEARCH_REQUEST",
  SEARCH_SUCCESS: "directory/SEARCH_SUCCESS",
  SHARE_FAILURE: "directory/SHARE_FAILURE",
  SHARE_REQUEST: "directory/SHARE_REQUEST",
  SHARE_SUCCESS: "directory/SHARE_SUCCESS",
  SUBMIT_REVIEW_FAILURE: "directory/SUBMIT_REVIEW_FAILURE",
  SUBMIT_REVIEW_REQUEST: "directory/SUBMIT_REVIEW_REQUEST",
  SUBMIT_REVIEW_SUCCESS: "directory/SUBMIT_REVIEW_SUCCESS",
  UNBOOKMARK_FAILURE: "directory/UNBOOKMARK_FAILURE",
  UNBOOKMARK_REQUEST: "directory/UNBOOKMARK_REQUEST",
  UNBOOKMARK_SUCCESS: "directory/UNBOOKMARK_SUCCESS",
  UNRECOMMEND_FAILURE: "directory/UNRECOMMEND_FAILURE",
  UNRECOMMEND_REQUEST: "directory/UNRECOMMEND_REQUEST",
  UNRECOMMEND_SUCCESS: "directory/UNRECOMMEND_SUCCESS",
  UPDATE_DRAFT_FAILURE: "directory/UPDATE_DRAFT_FAILURE",
  UPDATE_DRAFT_REQUEST: "directory/UPDATE_DRAFT_REQUEST",
  UPDATE_DRAFT_SUCCESS: "directory/UPDATE_DRAFT_SUCCESS",
  UPDATE_LISTING_FAILURE: "directory/UPDATE_LISTING_FAILURE",
  UPDATE_LISTING_REQUEST: "directory/UPDATE_LISTING_REQUEST",
  UPDATE_LISTING_SUCCESS: "directory/UPDATE_LISTING_SUCCESS",
  UPLOAD_MEDIA_FAILURE: "directory/UPLOAD_MEDIA_FAILURE",
  UPLOAD_MEDIA_REQUEST: "directory/UPLOAD_MEDIA_REQUEST",
  UPLOAD_MEDIA_SUCCESS: "directory/UPLOAD_MEDIA_SUCCESS",
  VIEW_FAILURE: "directory/VIEW_FAILURE",
  VIEW_REQUEST: "directory/VIEW_REQUEST",
  VIEW_SUCCESS: "directory/VIEW_SUCCESS",
} as const;

export type DirectoryAction = {
  payload?: any;
  type: string;
};
