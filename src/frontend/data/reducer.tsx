import { ReduxAction } from 'frontend/data/actions';
import { configReducer } from 'frontend/data/config/reducer';
import { pouchDbReducer } from 'frontend/data/pouchDb/reducer';
import { initReduxState, ReduxState } from 'frontend/data/state';
import { dataReducer } from 'frontend/data/data/reducer';
import { navigationReducer } from 'frontend/data/navigation/reducer';

export function rootReducer(state: ReduxState = initReduxState, action: ReduxAction): ReduxState {
  return {
    config: configReducer(state.config, action, state),
    navigation: navigationReducer(state.navigation, action, state),
    data: dataReducer(state.data, action, state),
    pouchDb: pouchDbReducer(state.pouchDb, action, state),
  };
}
