import { ReduxAction } from 'web/src/modules/actions';
import { configVarsReducer } from 'web/src/modules/configVars/reducer';
import { pouchDbReducer } from 'web/src/modules/pouchDb/reducer';
import { initReduxState, ReduxState } from 'web/src/modules/state';
import { uiNavigationReducer } from 'web/src/modules/uiNavigation/reducer';

export function rootReducer(state: ReduxState = initReduxState, action: ReduxAction): ReduxState {
  return {
    configVars: configVarsReducer(state.configVars, action, state),
    uiNavigation: uiNavigationReducer(state.uiNavigation, action, state),
    pouchDb: pouchDbReducer(state.pouchDb, action, state),
  };
}
