export interface ExperienceMedia {
  id: string;
  type: "image" | "video" | "audio";
  url: string;
}

export interface Experience {
  id: string;
  content: string;
  category: string;
  location?: string;
  authorId: string;

  createdAt: string;
  updatedAt: string;

  authorName: string | null;
  authorHandle: string | null;
  authorProfileImageUrl: string | null;

  likes: number;
  comments: number;
  reposts: number;
  bookmarks: number;

  likedByMe?: boolean;
  repostedByMe?: boolean;
  bookmarkedByMe?: boolean;

  mediaAttachments: ExperienceMedia[];
}

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

export interface ExperiencesState {
  feed: Experience[];
  loading: boolean;
  creating: boolean;
  error: string | null;
}

export const FETCH_EXPERIENCES_REQUEST =
  "FETCH_EXPERIENCES_REQUEST";

export const FETCH_EXPERIENCES_SUCCESS =
  "FETCH_EXPERIENCES_SUCCESS";

export const FETCH_EXPERIENCES_FAILURE =
  "FETCH_EXPERIENCES_FAILURE";

export const CREATE_EXPERIENCE_REQUEST =
  "CREATE_EXPERIENCE_REQUEST";

export const CREATE_EXPERIENCE_SUCCESS =
  "CREATE_EXPERIENCE_SUCCESS";

export const CREATE_EXPERIENCE_FAILURE =
  "CREATE_EXPERIENCE_FAILURE";

export const TOGGLE_LIKE_SUCCESS =
  "TOGGLE_LIKE_SUCCESS";

export interface FetchExperiencesRequestAction {
  type: typeof FETCH_EXPERIENCES_REQUEST;

  payload: {
    limit?: number;
    offset?: number;
    category?: string;
  };
}

export interface FetchExperiencesSuccessAction {
  type: typeof FETCH_EXPERIENCES_SUCCESS;

  payload: Experience[];
}

export interface FetchExperiencesFailureAction {
  type: typeof FETCH_EXPERIENCES_FAILURE;

  payload: string;
}

export interface CreateExperienceRequestAction {
  type: typeof CREATE_EXPERIENCE_REQUEST;

  payload: CreateExperiencePayload;
}

export interface CreateExperienceSuccessAction {
  type: typeof CREATE_EXPERIENCE_SUCCESS;

  payload: Experience;
}

export interface CreateExperienceFailureAction {
  type: typeof CREATE_EXPERIENCE_FAILURE;

  payload: string;
}

export interface ToggleLikeSuccessAction {
  type: typeof TOGGLE_LIKE_SUCCESS;

  payload: {
    experienceId: string;
    likes: number;
  };
}

export type ExperiencesActionTypes =
  | FetchExperiencesRequestAction
  | FetchExperiencesSuccessAction
  | FetchExperiencesFailureAction
  | CreateExperienceRequestAction
  | CreateExperienceSuccessAction
  | CreateExperienceFailureAction
  | ToggleLikeSuccessAction;