import { ReduxAction } from 'web/modules/actions';
import { configVarsReducer } from 'web/modules/configVars/reducer';
import { pouchDbReducer } from 'web/modules/pouchDb/reducer';
import { initReduxState, ReduxState } from 'web/modules/state';
import { uiNavigationReducer } from 'web/modules/uiNavigation/reducer';

export function rootReducer(state: ReduxState = initReduxState, action: ReduxAction): ReduxState {
  return {
    configVars: configVarsReducer(state.configVars, action, state),
    uiNavigation: uiNavigationReducer(state.uiNavigation, action, state),
    pouchDb: pouchDbReducer(state.pouchDb, action, state),
  };
}
