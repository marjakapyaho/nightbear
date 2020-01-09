import { isEqual } from 'lodash';
import { ReduxAction } from 'web/src/modules/actions';
import { ReduxState } from 'web/src/modules/state';

export type ReduxStore = Readonly<{ getState: () => ReduxState; dispatch: ReduxDispatch }>;
export type ReduxDispatch = (action: ReduxAction) => ReduxAction;
export type ReduxReducer = (state: ReduxState | undefined, action: ReduxAction) => ReduxState;
export type ReduxMiddleware = (store: ReduxStore) => (next: ReduxDispatch) => (action: ReduxAction) => ReduxAction;

type ActionCreatorMap = { [key: string]: (...args: any[]) => object };
type ActionCreatorMapWithType<T extends { [key: string]: (...args: any) => any }> = {
  [K in keyof T]: ActionCreatorWithType<T[K], K>
};
type ActionCreatorWithType<A, T> = A extends (...args: any) => infer R
  ? (...args: Parameters<A>) => Readonly<R & { type: T }>
  : never;

// The union of all possible return types from the given action creator map
export type ActionUnionFrom<T extends ActionCreatorMap> = valueof<{ [P in keyof T]: ReturnType<T[P]> }>; // returns the union of all possible return types from the given action creator map

// Updates the given map of action creators so that their return value (i.e. the action object)
// contains a "type" key with the type of each action, as determined by their key in the given map.
export function actionsWithType<T extends ActionCreatorMap>(map: T): ActionCreatorMapWithType<T> {
  return Object.keys(map)
    .map(type => ({
      [type]: (...args: any[]) => ({ type, ...map[type].apply(null, args) }),
    }))
    .reduce((memo, next) => ({ ...memo, ...next }), {} as any);
}

// Creates a container for handler functions, which will be invoked when the (slice of) state they're interested in changes.
// The main use case being triggering actions/side-effects in response to Store state changing.
export function createChangeObserver(store: ReduxStore, next: ReduxDispatch) {
  const selectors: Array<(state: ReduxState) => any> = [];
  const handlers: Array<
    (newSelection: any, oldSelection: any, newState: ReduxState, oldState: ReduxState) => void
  > = [];
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
