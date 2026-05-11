export const EXPERIENCE_ACTIONS = {
  FETCH_FEED_REQUEST: 'experiences/fetchFeedRequest',
  FETCH_FEED_SUCCESS: 'experiences/fetchFeedSuccess',
  FETCH_FEED_FAILURE: 'experiences/fetchFeedFailure',
} as const;

export type ExperienceCategorySlug =
  | 'all'
  | 'miracles'
  | 'prayers'
  | 'dreams'
  | 'first'
  | 'darshan'
  | 'blessings';

export type ExperienceItem = {
  authorAvatarUrl?: string;
  authorCity?: string;
  authorName: string;
  bodyPreview: string;
  bookmarksCount: number;
  category: ExperienceCategorySlug;
  commentsCount: number;
  createdAt: string;
  id: string;
  imageUrl?: string;
  isBookmarked: boolean;
  reactionsCount: number;
  title: string;
};

export type ExperiencesState = {
  activeCategory: ExperienceCategorySlug;
  error: string | null;
  hasMore: boolean;
  isLoading: boolean;
  items: ExperienceItem[];
  page: number;
};

export type FetchExperienceFeedRequestAction = {
  type: typeof EXPERIENCE_ACTIONS.FETCH_FEED_REQUEST;
};

export type FetchExperienceFeedSuccessAction = {
  payload: {
    hasMore: boolean;
    items: ExperienceItem[];
    page: number;
  };
  type: typeof EXPERIENCE_ACTIONS.FETCH_FEED_SUCCESS;
};

export type FetchExperienceFeedFailureAction = {
  payload: string;
  type: typeof EXPERIENCE_ACTIONS.FETCH_FEED_FAILURE;
};

export type ExperienceAction =
  | FetchExperienceFeedRequestAction
  | FetchExperienceFeedSuccessAction
  | FetchExperienceFeedFailureAction;
