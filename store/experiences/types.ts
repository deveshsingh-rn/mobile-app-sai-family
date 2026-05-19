export interface ExperienceMedia {
  id: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnailUrl?: string | null;
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
  uploadStatus?: "processing" | "published" | "failed";
  uploadError?: string | null;

  likes: number;
  comments: number;
  reposts: number;
  bookmarks: number;

  likedByMe?: boolean;
  repostedByMe?: boolean;
  bookmarkedByMe?: boolean;

  mediaAttachments: ExperienceMedia[];
}

export type ExperienceUploadStatus = {
  id: string;
  mediaAttachments: ExperienceMedia[];
  thumbnailUrl?: string | null;
  uploadError?: string | null;
  uploadStatus: "processing" | "published" | "failed";
};

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

export const TOGGLE_LIKE_REQUEST =
  "TOGGLE_LIKE_REQUEST";

export const TOGGLE_BOOKMARK_REQUEST =
  "TOGGLE_BOOKMARK_REQUEST";

export const TOGGLE_REPOST_REQUEST =
  "TOGGLE_REPOST_REQUEST";



  export const UPDATE_EXPERIENCE_REQUEST =
  "UPDATE_EXPERIENCE_REQUEST";

export const UPDATE_EXPERIENCE_SUCCESS =
  "UPDATE_EXPERIENCE_SUCCESS";

export const UPDATE_EXPERIENCE_FAILURE =
  "UPDATE_EXPERIENCE_FAILURE";

export const DELETE_EXPERIENCE_REQUEST =
  "DELETE_EXPERIENCE_REQUEST";

export const DELETE_EXPERIENCE_SUCCESS =
  "DELETE_EXPERIENCE_SUCCESS";

export const DELETE_EXPERIENCE_FAILURE =
  "DELETE_EXPERIENCE_FAILURE";

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

export interface ToggleLikeRequestAction {
  type: typeof TOGGLE_LIKE_REQUEST;
  payload: {
    experienceId: string;
    userId?: string;
  };
}

export interface ToggleBookmarkRequestAction {
  type: typeof TOGGLE_BOOKMARK_REQUEST;
  payload: {
    experienceId: string;
    userId?: string;
  };
}

export interface ToggleRepostRequestAction {
  type: typeof TOGGLE_REPOST_REQUEST;
  payload: {
    experienceId: string;
    userId?: string;
  };
}

export interface UpdateExperienceRequestAction {
  type: typeof UPDATE_EXPERIENCE_REQUEST;

  payload: UpdateExperiencePayload;
}

export interface UpdateExperienceSuccessAction {
  type: typeof UPDATE_EXPERIENCE_SUCCESS;

  payload: Experience;
}

export interface UpdateExperienceFailureAction {
  type: typeof UPDATE_EXPERIENCE_FAILURE;

  payload: string;
}

export interface DeleteExperienceRequestAction {
  type: typeof DELETE_EXPERIENCE_REQUEST;

  payload: {
    id: string;
  };
}

export interface DeleteExperienceSuccessAction {
  type: typeof DELETE_EXPERIENCE_SUCCESS;

  payload: {
    id: string;
  };
}

export interface DeleteExperienceFailureAction {
  type: typeof DELETE_EXPERIENCE_FAILURE;

  payload: string;
}



export interface UpdateExperiencePayload {
  id: string;
  content: string;
  category: string;
  location?: string;
}

export type ExperiencesActionTypes =
  | FetchExperiencesRequestAction
  | FetchExperiencesSuccessAction
  | FetchExperiencesFailureAction
  | CreateExperienceRequestAction
  | CreateExperienceSuccessAction
  | CreateExperienceFailureAction
  | ToggleLikeRequestAction
  | ToggleBookmarkRequestAction
  | ToggleRepostRequestAction
  | ToggleLikeSuccessAction 
  | UpdateExperienceRequestAction
| UpdateExperienceSuccessAction
| UpdateExperienceFailureAction
| DeleteExperienceRequestAction
| DeleteExperienceSuccessAction
| DeleteExperienceFailureAction;
