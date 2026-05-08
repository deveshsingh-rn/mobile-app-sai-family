import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";

import { rootReducer } from "./root-reducer";
import { rootSaga } from "./root-saga";

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(rootReducer, undefined, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);
