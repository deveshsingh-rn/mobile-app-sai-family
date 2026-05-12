import { 
  ExperiencesState, 
  FETCH_EXPERIENCES_REQUEST, 
  FETCH_EXPERIENCES_SUCCESS, 
  FETCH_EXPERIENCES_FAILURE,
  TOGGLE_LIKE_SUCCESS
} from './types';

const initialState: ExperiencesState = {
  feed: [],
  searchResults: [],
  bookmarks: [],
  loading: false,
  error: null,
};

export function experiencesReducer(state = initialState, action: any): ExperiencesState {
  switch (action.type) {
    case FETCH_EXPERIENCES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_EXPERIENCES_SUCCESS:
      return { ...state, loading: false, feed: action.payload };
    case FETCH_EXPERIENCES_FAILURE:
      return { ...state, loading: false, error: action.payload };
      
    case TOGGLE_LIKE_SUCCESS:
      return {
        ...state,
        feed: state.feed.map(exp => 
          exp.id === action.payload.experienceId 
            ? { ...exp, likes: action.payload.likes } 
            : exp
        ),
      };
    default:
      return state;
  }
}