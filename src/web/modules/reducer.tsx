import { ReduxAction } from 'web/modules/actions';
import { configReducer } from 'web/modules/config/reducer';
import { pouchDbReducer } from 'web/modules/pouchDb/reducer';
import { initReduxState, ReduxState } from 'web/modules/state';
import { dataReducer } from 'web/modules/data/reducer';
import { navigationReducer } from 'web/modules/navigation/reducer';

export function rootReducer(state: ReduxState = initReduxState, action: ReduxAction): ReduxState {
  return {
    config: configReducer(state.config, action, state),
    navigation: navigationReducer(state.navigation, action, state),
    data: dataReducer(state.data, action, state),
    pouchDb: pouchDbReducer(state.pouchDb, action, state),
  };
}
