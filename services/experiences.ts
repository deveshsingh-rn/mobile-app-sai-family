import { apiClient } from "./api";

export type CreateExperiencePayload = {
  content: string;
  category: string;
  location?: string;

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
    const mimeType =
      payload.media.type === "image"
        ? "image/jpeg"
        : payload.media.type === "video"
        ? "video/mp4"
        : "audio/mpeg";

    formData.append("mediaFiles", {
      uri: payload.media.uri,
      type: mimeType,
      name:
        payload.media.name ||
        `media-${Date.now()}`,
    } as any);
  }

  const response = await apiClient.post(
    "/api/experiences",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function apiToggleLike(
  id: string
) {
  const { data } = await apiClient.post(
    `/api/experiences/${id}/like`
  );

  return data;
}