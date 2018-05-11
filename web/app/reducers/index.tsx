import { AnyAction } from 'redux';
import { Action } from 'app/actions';

export type TypeScriptWorkaround = AnyAction; // @see https://github.com/Microsoft/TypeScript/issues/5711

export type State = Readonly<{
  config: {
    dbUrl: string;
  };
}>;

export const defaultState: State = {
  config: {
    dbUrl: '',
  },
};

export function rootReducer(state: State = defaultState, action: Action): State {
  if (action.type === 'DB_URL_SET') {
    return { ...state, config: { ...state.config, dbUrl: action.newDbUrl } };
  } else {
    return state;
  }
}
