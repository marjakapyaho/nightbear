import { AnyAction } from 'redux';
import { Action } from 'app/actions';

export type TypeScriptWorkaround = AnyAction; // @see https://github.com/Microsoft/TypeScript/issues/5711

export type State = Readonly<{
  // TODO
}>;

export const defaultState: State = {
  // TODO
};

export function rootReducer(state: State = { todos: [] }, action: Action): State {
  state;
  action;
  return {
    // TODO
  };
}
