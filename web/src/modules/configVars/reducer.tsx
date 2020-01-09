import { ReduxAction } from 'web/src/modules/actions';
import { configVarsInitState, ConfigVarsState } from 'web/src/modules/configVars/state';
import { ReduxState } from 'web/src/modules/state';

export function configVarsReducer(
  state: ConfigVarsState = configVarsInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): ConfigVarsState {
  switch (action.type) {
    case 'DB_URL_SET':
      return { ...state, remoteDbUrl: action.newDbUrl };
    default:
      return state;
  }
}
