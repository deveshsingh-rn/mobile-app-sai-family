import { EXPERIENCE_ACTIONS, ExperienceAction, ExperienceItem } from './types';

export const fetchExperienceFeedRequest = (): ExperienceAction => ({
  type: EXPERIENCE_ACTIONS.FETCH_FEED_REQUEST,
});

export const fetchExperienceFeedSuccess = ({
  hasMore,
  items,
  page,
}: {
  hasMore: boolean;
  items: ExperienceItem[];
  page: number;
}): ExperienceAction => ({
  payload: {
    hasMore,
    items,
    page,
  },
  type: EXPERIENCE_ACTIONS.FETCH_FEED_SUCCESS,
});

export const fetchExperienceFeedFailure = (message: string): ExperienceAction => ({
  payload: message,
  type: EXPERIENCE_ACTIONS.FETCH_FEED_FAILURE,
});
