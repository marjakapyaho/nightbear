import { ReduxState } from 'web/app/modules/state';
import { ReduxAction } from 'web/app/modules/actions';
import { configVarsReducer } from 'web/app/modules/configVars/reducer';
import { pouchDbReducer } from 'web/app/modules/pouchDb/reducer';

export function rootReducer(state: ReduxState, action: ReduxAction): ReduxState {
  return {
    configVars: configVarsReducer(state.configVars, action, state),
    pouchDb: pouchDbReducer(state.pouchDb, action, state),
  };
}
