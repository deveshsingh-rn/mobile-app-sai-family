export interface Experience {
  id: string;
  content: string;
  category: string;
  location?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;

  // Flattened from API response
  authorName: string | null;
  authorHandle: string | null;
  authorProfileImageUrl: string | null;
  likes: number;
  comments: number;
  reposts: number;
  bookmarks: number;

  // Media attachments
  mediaAttachments: {
    id: string;
    type: 'image' | 'video' | 'audio';
    url: string;
  }[];
}

export interface ExperiencesState {
  feed: Experience[];
  searchResults: Experience[];
  bookmarks: Experience[];
  loading: boolean;
  error: string | null;
}

export const FETCH_EXPERIENCES_REQUEST = 'FETCH_EXPERIENCES_REQUEST';
export const FETCH_EXPERIENCES_SUCCESS = 'FETCH_EXPERIENCES_SUCCESS';
export const FETCH_EXPERIENCES_FAILURE = 'FETCH_EXPERIENCES_FAILURE';

export const SEARCH_EXPERIENCES_REQUEST = 'SEARCH_EXPERIENCES_REQUEST';
export const SEARCH_EXPERIENCES_SUCCESS = 'SEARCH_EXPERIENCES_SUCCESS';
export const SEARCH_EXPERIENCES_FAILURE = 'SEARCH_EXPERIENCES_FAILURE';

export const CREATE_EXPERIENCE_REQUEST = 'CREATE_EXPERIENCE_REQUEST';
export const CREATE_EXPERIENCE_SUCCESS = 'CREATE_EXPERIENCE_SUCCESS';
export const CREATE_EXPERIENCE_FAILURE = 'CREATE_EXPERIENCE_FAILURE';

export const TOGGLE_LIKE_REQUEST = 'TOGGLE_LIKE_REQUEST';
export const TOGGLE_LIKE_SUCCESS = 'TOGGLE_LIKE_SUCCESS';
export const TOGGLE_LIKE_FAILURE = 'TOGGLE_LIKE_FAILURE';

interface FetchExperiencesRequestAction {
  type: typeof FETCH_EXPERIENCES_REQUEST;
  payload: { limit?: number; offset?: number; category?: string };
}

interface FetchExperiencesSuccessAction {
  type: typeof FETCH_EXPERIENCES_SUCCESS;
  payload: Experience[];
}

interface FetchExperiencesFailureAction {
  type: typeof FETCH_EXPERIENCES_FAILURE;
  payload: string;
}

interface ToggleLikeRequestAction {
  type: typeof TOGGLE_LIKE_REQUEST;
  payload: { experienceId: string; userId: string };
}

interface ToggleLikeSuccessAction {
  type: typeof TOGGLE_LIKE_SUCCESS;
  payload: { experienceId: string; likes: number };
}

interface ToggleLikeFailureAction {
  type: typeof TOGGLE_LIKE_FAILURE;
  payload: string;
}

export type ExperiencesActionTypes =
  | FetchExperiencesRequestAction
  | FetchExperiencesSuccessAction
  | FetchExperiencesFailureAction
  | ToggleLikeRequestAction
  | ToggleLikeSuccessAction
  | ToggleLikeFailureAction;
  // Add additional strict action types here as needed

export type ExperienceAction = ExperiencesActionTypes;
