import { ReduxState } from 'web/app/modules/state';
import { ReduxAction } from 'web/app/modules/actions';
import { configVarsReducer } from 'web/app/modules/configVars/reducer';

export function rootReducer(state: ReduxState, action: ReduxAction): ReduxState {
  return {
    configVars: configVarsReducer(state.configVars, action, state),
  };
}
