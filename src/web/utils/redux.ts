import { isEqual } from 'lodash';
import { applyMiddleware, createStore as reduxCreateStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { ReduxAction } from 'web/modules/actions';
import { middleware } from 'web/modules/middleware';
import { rootReducer } from 'web/modules/reducer';
import { ReduxState } from 'web/modules/state';

export type ReduxStore = Readonly<{ getState: () => ReduxState; dispatch: ReduxDispatch }>;
export type ReduxDispatch = (action: ReduxAction) => ReduxAction;
export type ReduxReducer = (state: ReduxState | undefined, action: ReduxAction) => ReduxState;
export type ReduxMiddleware = (store: ReduxStore) => (next: ReduxDispatch) => (action: ReduxAction) => ReduxAction;

type valueof<T> = T[keyof T];
type ActionCreatorMap = { [key: string]: (...args: any[]) => object };
type ActionCreatorMapWithType<T extends { [key: string]: (...args: any) => any }> = {
  [K in keyof T]: ActionCreatorWithType<T[K], K>;
};
type ActionCreatorWithType<A, T> = A extends (...args: any) => infer R
  ? ((...args: Parameters<A>) => Readonly<R & { type: T }>) & Readonly<{ type: T }>
  : never;

// The union of all possible return types from the given action creator map
export type ActionUnionFrom<T extends ActionCreatorMap> = valueof<{ [P in keyof T]: ReturnType<T[P]> }>; // returns the union of all possible return types from the given action creator map

// Simple wrapper around Redux's standard createStore(), which standardizes middleware & enhancer setup
export function createStore(initialState?: ReduxState): ReduxStore {
  return reduxCreateStore(rootReducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));
}

// Returning this from a middleware function effectively makes it no-op.
// This doesn't mean such middleware is useless, though: it can still e.g. observe some external system, and dispatch actions based on it.
export const NO_OP_MIDDLEWARE = (next: ReduxDispatch) => (action: ReduxAction) => next(action);

// Updates the given map of action creators so that their return value (i.e. the action object)
// contains a "type" key with the type of each action, as determined by their key in the given map.
// The function itself is also updated to have a "type" property, which contains the type of the action it produces.
export function actionsWithType<T extends ActionCreatorMap>(map: T): ActionCreatorMapWithType<T> {
  return Object.keys(map)
    .map(type => {
      const withReturnType = (...args: any[]) => ({ type, ...map[type].apply(null, args) }); // update the return value so it includes the action name as the "type" property
      const withStaticType = Object.defineProperty(withReturnType, 'type', { value: type, writable: false }); // update the function itself so it has the action name as the "type" property
      return { [type]: withStaticType };
    })
    .reduce((memo, next) => ({ ...memo, ...next }), {} as any); // setting this up correctly requires this internal cheat with "any", but we know what we're doing :tm:
}

// Creates a container for handler functions, which will be invoked when the (slice of) state they're interested in changes.
// The main use case being triggering actions/side-effects in response to Store state changing.
export function createChangeObserver(store: ReduxStore, next: ReduxDispatch) {
  const selectors: Array<(state: ReduxState) => any> = [];
  const handlers: Array<(
    newSelection: any,
    oldSelection: any,
    newState: ReduxState,
    oldState: ReduxState,
  ) => void> = [];
  return {
    add<T>(
      selector: (state: ReduxState) => T,
      handler: (newSelection: T, oldSelection: T, newState: ReduxState, oldState: ReduxState) => void,
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
        console.log('createChangeObserver()', 'FROM', oldValues[i], 'TO', newValues[i], 'CALLING', handler.name);
        handler(newValues[i], oldValues[i], newState, oldState);
      });
      return result;
    },
  };
}
