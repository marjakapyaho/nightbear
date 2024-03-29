import { configInitState, ConfigState } from 'frontend/data/config/state';
import { pouchDbInitState, PouchDbState } from 'frontend/data/pouchDb/state';
import { dataInitState, DataState } from 'frontend/data/data/state';
import { navigationInitState, NavigationState } from 'frontend/data/navigation/state';

export const initReduxState: ReduxState = {
  config: configInitState,
  navigation: navigationInitState,
  data: dataInitState,
  pouchDb: pouchDbInitState,
};

export type ReduxState = Readonly<{
  config: ConfigState;
  navigation: NavigationState;
  data: DataState;
  pouchDb: PouchDbState;
}>;
