import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Action } from 'app/actions';
import { rootReducer, State } from 'app/reducers';

export type Store = Readonly<{ getState: () => State; dispatch: Dispatch }>;
export type Dispatch = (action: Action) => Action;
export type Reducer = (state: State | undefined, action: Action) => State;
export type Middleware = (store: Store) => (next: Dispatch) => (action: Action) => Action;

export function configureStore(initialState?: State, middleware: Middleware[] = []): Store {
  let appliedMiddleware = applyMiddleware.apply(null, middleware);

  if (process.env.NODE_ENV !== 'production') {
    appliedMiddleware = composeWithDevTools(appliedMiddleware);
  }

  const store = createStore(
    rootReducer as any /* redux types are a bit sloppy here */,
    initialState,
    appliedMiddleware,
  ) as Store;

  if (module.hot) {
    module.hot.accept('app/reducers', () => {
      const nextReducer = require('app/reducers');
      (store as any).replaceReducer(nextReducer);
    });
  }

  return store as any;
}
