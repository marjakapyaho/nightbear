import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { ReduxState } from 'web/app/modules/state';
import { ReduxAction } from 'web/app/modules/actions';
import { rootReducer } from 'web/app/modules/reducer';
import { isEqual } from 'lodash';

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
    (module as any).hot.accept('web/app/modules/reducer', () => {
      const nextReducer = require('web/app/modules/reducer');
      (store as any).replaceReducer(nextReducer);
    });
  }

  return store as any;
}

export function createChangeObserver(store: Store, next: Dispatch) {
  const selectors: Array<(state: ReduxState) => any> = [];
  const handlers: Array<
    (newSelection: any, oldSelection: any, newState: ReduxState, oldState: ReduxState) => void
  > = [];
  return {
    add<T>(
      selector: (state: ReduxState) => T,
      handler: (
        newSelection: T,
        oldSelection: T,
        newState: ReduxState,
        oldState: ReduxState,
      ) => void,
    ) {
      selectors.push(selector);
      handlers.push(handler);
    },
    run(action: ReduxAction) {
      const oldState = store.getState();
      const oldValues = selectors.map(selector => selector(oldState));
      const result = next(action);
      const newState = store.getState();
      const newValues = selectors.map(selector => selector(newState));
      handlers.forEach((handler, i) => {
        if (isEqual(newValues[i], oldValues[i])) return;
        handler(newValues[i], oldValues[i], newState, oldState);
      });
      return result;
    },
  };
}

type valueof<T> = T[keyof T];
type ActionCreatorMap = { [key: string]: (...args: any[]) => object };
type ActionCreatorMapWithType<T> = { [K in keyof T]: ActionCreatorWithType<T[K], K> };

// prettier-ignore
type ActionCreatorWithType<A, T> =
  A extends () => infer R ? () => Readonly<R & { type: T }> :
  A extends (a1: infer A1) => infer R ? (a1: A1) => Readonly<R & { type: T }> :
  A extends (a1: infer A1, a2: infer A2) => infer R ? (a1: A1, a2: A2) => Readonly<R & { type: T }> :
  A extends (a1: infer A1, a2: infer A2, a3: infer A3) => infer R ? (a1: A1, a2: A2, a3: A3) => Readonly<R & { type: T }> :
  A extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4) => infer R ? (a1: A1, a2: A2, a3: A3, a4: A4) => Readonly<R & { type: T }> :
  A extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5) => infer R ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => Readonly<R & { type: T }> :
  A extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6) => infer R ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => Readonly<R & { type: T }> :
  A extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7) => infer R ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => Readonly<R & { type: T }> :
  A extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7, a8: infer A8) => infer R ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8) => Readonly<R & { type: T }> :
  A extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7, a8: infer A8, a9: infer A9) => infer R ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8, a9: A9) => Readonly<R & { type: T }> :
  A extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7, a8: infer A8, a9: infer A9, a10: infer A10) => infer R ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8, a9: A9, a10: A10) => Readonly<R & { type: T }> :
  never; // If you need more than 10 arguments... you don't need more arguments. You need refactoring.

// Updates the given map of action creators so that their return value (i.e. the action object)
// contains a "type" key with the type of each action, as determined by their key in the given map.
export function actionsWithType<T extends ActionCreatorMap>(map: T): ActionCreatorMapWithType<T> {
  return Object.keys(map)
    .map(type => ({
      [type]: (...args: any[]) => ({ type, ...map[type].apply(null, args) }),
    }))
    .reduce((memo, next) => ({ ...memo, ...next }), {} as any);
}

// Returns the union of all possible return types from the given action creator map.
export type ActionUnionFrom<T extends ActionCreatorMap> = valueof<
  { [P in keyof T]: ReturnType<T[P]> }
>;
