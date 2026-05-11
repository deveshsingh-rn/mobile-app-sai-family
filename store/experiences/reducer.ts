import { EXPERIENCE_ACTIONS, ExperienceAction, ExperiencesState } from './types';

export const initialExperiencesState: ExperiencesState = {
  activeCategory: 'all',
  error: null,
  hasMore: true,
  isLoading: false,
  items: [],
  page: 1,
};

export function experiencesReducer(
  state = initialExperiencesState,
  action: ExperienceAction
): ExperiencesState {
  switch (action.type) {
    case EXPERIENCE_ACTIONS.FETCH_FEED_REQUEST:
      return {
        ...state,
        error: null,
        isLoading: true,
      };

    case EXPERIENCE_ACTIONS.FETCH_FEED_SUCCESS:
      return {
        ...state,
        error: null,
        hasMore: action.payload.hasMore,
        isLoading: false,
        items: action.payload.items,
        page: action.payload.page,
      };

    case EXPERIENCE_ACTIONS.FETCH_FEED_FAILURE:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
}
