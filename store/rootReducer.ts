import { combineReducers } from 'redux';
import { devoteeAccountReducer } from './devotee-account/reducer';

const rootReducer = combineReducers({
  devoteeAccount: devoteeAccountReducer,
});

export default rootReducer;