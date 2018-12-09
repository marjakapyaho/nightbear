import { ReduxAction } from 'web/app/modules/actions';
import { configVarsReducer } from 'web/app/modules/configVars/reducer';
import { pouchDbReducer } from 'web/app/modules/pouchDb/reducer';
import { initReduxState, ReduxState } from 'web/app/modules/state';
import { timelineDataReducer } from 'web/app/modules/timelineData/reducer';
import { uiNavigationReducer } from 'web/app/modules/uiNavigation/reducer';

export function rootReducer(state: ReduxState = initReduxState, action: ReduxAction): ReduxState {
  return {
    configVars: configVarsReducer(state.configVars, action, state),
    uiNavigation: uiNavigationReducer(state.uiNavigation, action, state),
    pouchDb: pouchDbReducer(state.pouchDb, action, state),
    timelineData: timelineDataReducer(state.timelineData, action, state),
  };
}
