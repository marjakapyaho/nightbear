import { ReduxAction, actions } from 'web/modules/actions';
import { configVarsInitState, ConfigVarsState } from 'web/modules/configVars/state';
import { ReduxState } from 'web/modules/state';

export function configVarsReducer(
  state: ConfigVarsState = configVarsInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): ConfigVarsState {
  switch (action.type) {
    case actions.DB_URL_SET.type:
      return { ...state, remoteDbUrl: action.newDbUrl };
    default:
      return state;
  }
}
