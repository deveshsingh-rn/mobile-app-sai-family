import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootReducer } from './root-reducer';
import { rootSaga } from './root-saga';
import { injectStore } from '@/services/api';

const sagaMiddleware = createSagaMiddleware();

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

  // 👇 YAHAN LOGIC ADD KIYA: Har action par current state console hogi
  // if (__DEV__) {
  //   store.subscribe(() => {
  //     console.log('====== REDUX STATE UPDATED ======\n', store.getState());
  //   });
  // }

  sagaMiddleware.run(rootSaga);
  return store;
};

export const store = configureStore();
injectStore(store);