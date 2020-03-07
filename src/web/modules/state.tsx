import { configInitState, ConfigState } from 'web/modules/config/state';
import { pouchDbInitState, PouchDbState } from 'web/modules/pouchDb/state';
import { dataInitState, DataState } from 'web/modules/data/state';
import { navigationInitState, NavigationState } from 'web/modules/navigation/state';

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
