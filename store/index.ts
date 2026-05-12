import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootReducer } from './root-reducer';
import { rootSaga } from './root-saga';
import { injectStore } from '@/services/api';

const sagaMiddleware = createSagaMiddleware();

// Use DevTools compose if available (RN Debugger sets it on `global`)
const composeEnhancers =
  (__DEV__ &&
    (global as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    (global as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      trace: true,
      traceLimit: 25,
    })) ||
  compose;

const configureStore = () => {
  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(sagaMiddleware))
  );

  sagaMiddleware.run(rootSaga);
  return store;
};

export const store = configureStore();

// Inject store into API layer to avoid circular dependencies for 401 interceptor logouts
injectStore(store);