import { ConfigVarsState, configVarsInitState } from 'web/app/modules/configVars/state';
import { ReduxAction } from 'web/app/modules/actions';
import { ReduxState } from 'web/app/modules/state';

export function configVarsReducer(
  state = configVarsInitState,
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
