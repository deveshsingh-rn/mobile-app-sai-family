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
    mimeType?: string;
  } | null;
};

const MEDIA_METADATA_BY_EXTENSION: Record<
  string,
  { mimeType: string; extension: string }
> = {
  jpeg: { extension: "jpg", mimeType: "image/jpeg" },
  jpg: { extension: "jpg", mimeType: "image/jpeg" },
  m4a: { extension: "m4a", mimeType: "audio/mp4" },
  mov: { extension: "mov", mimeType: "video/quicktime" },
  mp3: { extension: "mp3", mimeType: "audio/mpeg" },
  mp4: { extension: "mp4", mimeType: "video/mp4" },
  png: { extension: "png", mimeType: "image/png" },
  wav: { extension: "wav", mimeType: "audio/wav" },
  webm: { extension: "webm", mimeType: "audio/webm" },
  webp: { extension: "webp", mimeType: "image/webp" },
};

const normalizeExperienceMediaMetadata = (
  media: NonNullable<CreateExperiencePayload["media"]>
) => {
  const sourceName = media.name || media.uri.split("/").pop() || "";
  const extension = sourceName
    .split("?")[0]
    .split(".")
    .pop()
    ?.toLowerCase();
  const inferred = extension
    ? MEDIA_METADATA_BY_EXTENSION[extension]
    : undefined;

  if (media.type === "audio") {
    const normalizedMimeType =
      media.mimeType === "audio/x-m4a"
        ? "audio/mp4"
        : media.mimeType;
    const audioMetadata =
      inferred?.mimeType.startsWith("audio/")
        ? inferred
        : normalizedMimeType === "audio/wav"
          ? MEDIA_METADATA_BY_EXTENSION.wav
          : normalizedMimeType === "audio/webm"
            ? MEDIA_METADATA_BY_EXTENSION.webm
            : normalizedMimeType === "audio/mpeg"
              ? MEDIA_METADATA_BY_EXTENSION.mp3
              : MEDIA_METADATA_BY_EXTENSION.m4a;

    return {
      mimeType: audioMetadata.mimeType,
      name:
        extension && inferred?.mimeType.startsWith("audio/")
          ? sourceName
          : `experience-audio-${Date.now()}.${audioMetadata.extension}`,
    };
  }

  const fallback =
    media.type === "video"
      ? MEDIA_METADATA_BY_EXTENSION.mp4
      : MEDIA_METADATA_BY_EXTENSION.jpg;
  const metadata =
    inferred?.mimeType.startsWith(`${media.type}/`) ? inferred : fallback;

  return {
    mimeType: metadata.mimeType,
    name:
      extension && inferred?.mimeType.startsWith(`${media.type}/`)
        ? sourceName
        : `experience-${media.type}-${Date.now()}.${metadata.extension}`,
  };
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
    const metadata = normalizeExperienceMediaMetadata(payload.media);

    formData.append("mediaFiles", {
      uri: payload.media.uri,
      type: metadata.mimeType,
      name: metadata.name,
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
