import { apiClient } from "./api";
import {
  DEFAULT_EXPERIENCE_CATEGORIES,
  ExperienceCategory,
  ExperienceUploadStatus,
} from "@/store/experiences/types";

export type CreateExperiencePayload = {
  content: string;
  category: string;
  location?: string;
  userId?: string;

  media?: {
    uri: string;
    type: "image" | "video" | "audio";
    name?: string;
  } | null;
};

export async function apiFetchExperiences(
  params: {
    limit?: number;
    offset?: number;
    category?: string;
  }
) {
  const { data } = await apiClient.get(
    "/api/experiences",
    {
      params,
    }
  );

  return data;
}

export async function apiSearchExperiences(
  params: {
    limit?: number;
    offset?: number;
    q: string;
  }
) {
  const { data } = await apiClient.get(
    "/api/experiences/search",
    {
      params,
    }
  );

  return data;
}

export async function apiFetchBookmarkedExperiences(
  params: {
    limit?: number;
    offset?: number;
  }
) {
  const { data } = await apiClient.get(
    "/api/users/me/bookmarks",
    {
      params,
    }
  );

  return data;
}

function normalizeCategories(data: any): ExperienceCategory[] {
  const source =
    data?.categories ||
    data?.items ||
    data?.data ||
    data;

  if (!Array.isArray(source)) {
    return DEFAULT_EXPERIENCE_CATEGORIES;
  }

  return source
    .map((item) => {
      if (typeof item === "string") {
        return {
          category: item,
          label: item,
        };
      }

      return {
        category:
          item.category ||
          item.value ||
          item.slug ||
          "",
        label:
          item.label ||
          item.name ||
          item.category ||
          item.value ||
          "",
      };
    })
    .filter((item) => item.category && item.label);
}

export async function apiFetchExperienceCategories() {
  try {
    const { data } = await apiClient.get(
      "/api/experiences/categories"
    );

    return normalizeCategories(data);
  } catch {
    return DEFAULT_EXPERIENCE_CATEGORIES;
  }
}

export async function apiFetchExperienceDetail(
  id: string
) {
  const { data } = await apiClient.get(
    `/api/experiences/${id}`,
    {
      params: {
        commentLimit: 20,
        commentOffset: 0,
      },
    }
  );

  return data;
}

export async function apiCreateExperience(
  payload: CreateExperiencePayload
) {
  const formData = new FormData();

  formData.append(
    "content",
    payload.content.trim()
  );

  formData.append(
    "category",
    payload.category
  );

  if (payload.location) {
    formData.append(
      "location",
      payload.location
    );
  }

  if (payload.media) {
    let mimeType = "image/jpeg";
    let ext = "jpg";

    if (payload.media.type === "video") {
      mimeType = "video/mp4";
      ext = "mp4";
    } else if (payload.media.type === "audio") {
      mimeType = "audio/mpeg";
      ext = "mp3";
    }

    formData.append("mediaFiles", {
      uri: payload.media.uri,
      type: mimeType,
      name: payload.media.name || `media-${Date.now()}.${ext}`,
    } as any);
  }

  const response = await apiClient.post(
    "/api/experiences",
    formData,
    {
      headers: {
        "Accept": "application/json",
        "Content-Type": "multipart/form-data",
        ...(payload.userId ? { "x-user-id": payload.userId } : {}),
      },
      // Videos take longer to upload. Extend timeout to 2 minutes.
      timeout: 120000, 
    }
  );

  return response.data;
}

export async function apiGetExperienceUploadStatus(
  id: string
) {
  const { data } =
    await apiClient.get<{
      experience: ExperienceUploadStatus;
    }>(
      `/api/experiences/${id}/upload-status`
    );

  return data;
}

export async function apiToggleLike(
  id: string
) {
  const { data } = await apiClient.post(
    `/api/experiences/${id}/like`
  );

  return data;
}

export async function apiAddExperienceComment({
  content,
  experienceId,
  userId,
}: {
  content: string;
  experienceId: string;
  userId?: string;
}) {
  const { data } = await apiClient.post(
    `/api/experiences/${experienceId}/comments`,
    {
      content,
    },
    {
      headers: {
        ...(userId ? { "x-user-id": userId } : {}),
      },
    }
  );

  return data;
}

export async function apiToggleBookmark(
  id: string
) {
  const { data } = await apiClient.post(
    `/api/experiences/${id}/bookmark`
  );

  return data;
}

export async function apiToggleRepost(
  id: string
) {
  const { data } = await apiClient.post(
    `/api/experiences/${id}/repost`
  );

  return data;
}


export async function apiUpdateExperience(
  payload: {
    id: string;
    content: string;
    category: string;
    location?: string;
  }
) {
  const response = await apiClient.patch(
    `/api/experiences/${payload.id}`,
    {
      content: payload.content,
      category: payload.category,
      location: payload.location,
    }
  );

  return response.data;
}



export async function apiDeleteExperience(
  id: string
) {
  const response = await apiClient.delete(
    `/api/experiences/${id}`
  );

  return response.data;
}
