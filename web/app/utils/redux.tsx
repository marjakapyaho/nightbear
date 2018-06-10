import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { ReduxState } from 'web/app/modules/state';
import { ReduxAction } from 'web/app/modules/actions';
import { rootReducer } from 'web/app/modules/reducer';

export type Store = Readonly<{ getState: () => ReduxState; dispatch: Dispatch }>;
export type Dispatch = (action: ReduxAction) => ReduxAction;
export type Reducer = (state: ReduxState | undefined, action: ReduxAction) => ReduxState;
export type Middleware = (store: Store) => (next: Dispatch) => (action: ReduxAction) => ReduxAction;

export function configureStore(initialState?: ReduxState, middleware: Middleware[] = []): Store {
  let appliedMiddleware = applyMiddleware.apply(null, middleware);

  if (process.env.NODE_ENV !== 'production') {
    appliedMiddleware = composeWithDevTools(appliedMiddleware);
  }

  const store = createStore(
    rootReducer as any /* redux types are a bit sloppy here */,
    initialState,
    appliedMiddleware,
  ) as Store;

  if ((module as any).hot) {
    (module as any).hot.accept('web/app/reducers', () => {
      const nextReducer = require('web/app/reducers');
      (store as any).replaceReducer(nextReducer);
    });
  }

  return store as any;
}
