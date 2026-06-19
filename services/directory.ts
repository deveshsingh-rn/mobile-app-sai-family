import { apiClient } from "./api";
import type {
  DirectoryContactPayload,
  DirectoryCreateListingPayload,
  DirectoryDetailResult,
  DirectoryDraft,
  DirectoryHomeResult,
  DirectoryListParams,
  DirectoryListResult,
  DirectoryListing,
  DirectoryRecentSearch,
  DirectoryReportPayload,
  DirectoryReview,
  DirectoryReviewPayload,
  DirectoryReviewsResult,
  DirectoryReviewVotePayload,
  DirectorySearchSuggestion,
  DirectoryUpdateListingPayload,
  DirectoryUploadMediaPayload,
  DirectoryUploadMediaResult,
} from "@/store/directory/types";

export async function apiFetchDirectoryCategories(
  params: {
    includeCounts?: boolean;
  } = {}
) {
  const { data } = await apiClient.get(
    "/api/directory/categories",
    { params }
  );

  return data;
}

export async function apiFetchDirectoryHome(
  params: {
    city?: string;
    lat?: number;
    limit?: number;
    lng?: number;
  } = {}
): Promise<DirectoryHomeResult> {
  const { data } = await apiClient.get(
    "/api/directory/home",
    { params }
  );

  return data;
}

export async function apiFetchDirectoryListings(
  params: DirectoryListParams = {}
): Promise<DirectoryListResult> {
  const { data } = await apiClient.get(
    "/api/directory/listings",
    { params }
  );

  return data;
}

export async function apiFetchDirectoryListingDetail(
  id: string
): Promise<DirectoryDetailResult> {
  const { data } = await apiClient.get(
    `/api/directory/listings/${id}`
  );

  return data;
}

export async function apiSearchDirectoryListings(
  params: DirectoryListParams & {
    q: string;
  }
): Promise<DirectoryListResult & {
  suggestions?: DirectorySearchSuggestion[];
}> {
  const { data } = await apiClient.get(
    "/api/directory/search",
    { params }
  );

  return data;
}

export async function apiFetchDirectorySearchSuggestions(
  params: {
    limit?: number;
    q: string;
  }
): Promise<{
  suggestions: DirectorySearchSuggestion[];
}> {
  const { data } = await apiClient.get(
    "/api/directory/search/suggestions",
    { params }
  );

  return data;
}

export async function apiFetchDirectoryRecentSearches(
  params: {
    limit?: number;
  } = {}
): Promise<{
  searches: DirectoryRecentSearch[];
}> {
  const { data } = await apiClient.get(
    "/api/users/me/directory/recent-searches",
    { params }
  );

  return data;
}

export async function apiAddDirectoryRecentSearch(
  payload: {
    categoryId?: string;
    city?: string;
    query: string;
  }
): Promise<{
  search?: DirectoryRecentSearch;
  searches?: DirectoryRecentSearch[];
}> {
  const { data } = await apiClient.post(
    "/api/users/me/directory/recent-searches",
    payload
  );

  return data;
}

export async function apiClearDirectoryRecentSearches(): Promise<{
  success: boolean;
}> {
  const { data } = await apiClient.delete(
    "/api/users/me/directory/recent-searches"
  );

  return data;
}

export async function apiCreateDirectoryListing(
  payload: DirectoryCreateListingPayload
): Promise<{
  listing: DirectoryListing;
}> {
  const { data } = await apiClient.post(
    "/api/directory/listings",
    payload
  );

  return data;
}

export async function apiUpdateDirectoryListing(
  id: string,
  payload: DirectoryUpdateListingPayload
): Promise<{
  listing: DirectoryListing;
}> {
  const { data } = await apiClient.patch(
    `/api/directory/listings/${id}`,
    payload
  );

  return data;
}

export async function apiDeleteDirectoryListing(
  id: string
): Promise<{
  id: string;
  status?: string;
  success: boolean;
}> {
  const { data } = await apiClient.delete(
    `/api/directory/listings/${id}`
  );

  return data;
}

export async function apiCreateDirectoryDraft(
  payload: Partial<DirectoryCreateListingPayload>
): Promise<{
  draft: DirectoryDraft;
}> {
  const { data } = await apiClient.post(
    "/api/directory/listing-drafts",
    payload
  );

  return data;
}

export async function apiUpdateDirectoryDraft(
  id: string,
  payload: Partial<DirectoryCreateListingPayload>
): Promise<{
  draft: DirectoryDraft;
}> {
  const { data } = await apiClient.patch(
    `/api/directory/listing-drafts/${id}`,
    payload
  );

  return data;
}

export async function apiPublishDirectoryDraft(
  id: string
): Promise<{
  listing: DirectoryListing;
}> {
  const { data } = await apiClient.post(
    `/api/directory/listing-drafts/${id}/publish`
  );

  return data;
}

export async function apiFetchMyDirectoryListings(
  params: DirectoryListParams = {}
): Promise<DirectoryListResult> {
  const { data } = await apiClient.get(
    "/api/users/me/directory/listings",
    { params }
  );

  return data;
}

export async function apiBookmarkDirectoryListing(
  id: string
) {
  const { data } = await apiClient.post(
    `/api/directory/listings/${id}/bookmark`
  );

  return data;
}

export async function apiUnbookmarkDirectoryListing(
  id: string
) {
  const { data } = await apiClient.delete(
    `/api/directory/listings/${id}/bookmark`
  );

  return data;
}

export async function apiFetchDirectoryBookmarks(
  params: DirectoryListParams = {}
): Promise<DirectoryListResult> {
  const { data } = await apiClient.get(
    "/api/users/me/directory/bookmarks",
    { params }
  );

  return data;
}

export async function apiRecommendDirectoryListing(
  id: string
) {
  const { data } = await apiClient.post(
    `/api/directory/listings/${id}/recommend`
  );

  return data;
}

export async function apiUnrecommendDirectoryListing(
  id: string
) {
  const { data } = await apiClient.delete(
    `/api/directory/listings/${id}/recommend`
  );

  return data;
}

export async function apiContactDirectoryListing(
  id: string,
  payload: DirectoryContactPayload
) {
  const { data } = await apiClient.post(
    `/api/directory/listings/${id}/contact`,
    payload
  );

  return data;
}

export async function apiShareDirectoryListing(
  id: string,
  payload: {
    channel: string;
  }
) {
  const { data } = await apiClient.post(
    `/api/directory/listings/${id}/share`,
    payload
  );

  return data;
}

export async function apiTrackDirectoryListingView(
  id: string
) {
  const { data } = await apiClient.post(
    `/api/directory/listings/${id}/view`
  );

  return data;
}

export async function apiReportDirectoryListing(
  id: string,
  payload: DirectoryReportPayload
) {
  const { data } = await apiClient.post(
    `/api/directory/listings/${id}/report`,
    payload
  );

  return data;
}

export async function apiFetchDirectoryReviews(
  id: string,
  params: {
    limit?: number;
    offset?: number;
    rating?: number;
    sort?: "newest" | "highest" | "lowest" | "helpful";
  } = {}
): Promise<DirectoryReviewsResult> {
  const { data } = await apiClient.get(
    `/api/directory/listings/${id}/reviews`,
    { params }
  );

  return data;
}

export async function apiCreateDirectoryReview(
  id: string,
  payload: DirectoryReviewPayload
): Promise<{
  review: DirectoryReview;
}> {
  const { data } = await apiClient.post(
    `/api/directory/listings/${id}/reviews`,
    payload
  );

  return data;
}

export async function apiUpdateDirectoryReview(
  id: string,
  payload: Partial<DirectoryReviewPayload>
): Promise<{
  review: DirectoryReview;
}> {
  const { data } = await apiClient.patch(
    `/api/directory/reviews/${id}`,
    payload
  );

  return data;
}

export async function apiDeleteDirectoryReview(
  id: string
) {
  const { data } = await apiClient.delete(
    `/api/directory/reviews/${id}`
  );

  return data;
}

export async function apiVoteDirectoryReview(
  id: string,
  payload: DirectoryReviewVotePayload
) {
  const { data } = await apiClient.post(
    `/api/directory/reviews/${id}/vote`,
    payload
  );

  return data;
}

export async function apiClearDirectoryReviewVote(
  id: string
) {
  const { data } = await apiClient.delete(
    `/api/directory/reviews/${id}/vote`
  );

  return data;
}

export async function apiUploadDirectoryMedia(
  payload: DirectoryUploadMediaPayload
): Promise<DirectoryUploadMediaResult> {
  const formData = new FormData();
  const files = payload.files || [];

  if (payload.file) {
    formData.append("file", payload.file as any);
  }

  files.forEach((file) => {
    formData.append("files", file as any);
  });

  formData.append("context", "directory");

  const { data } = await apiClient.post(
    "/api/media/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}
