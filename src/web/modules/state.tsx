import { configInitState, ConfigState } from 'web/modules/config/state';
import { pouchDbInitState, PouchDbState } from 'web/modules/pouchDb/state';
import { timelineDataInitState, TimelineDataState } from 'web/modules/timelineData/state';
import { navigationInitState, NavigationState } from 'web/modules/navigation/state';

export const initReduxState: ReduxState = {
  config: configInitState,
  navigation: navigationInitState,
  timelineData: timelineDataInitState,
  pouchDb: pouchDbInitState,
};

export type ReduxState = Readonly<{
  config: ConfigState;
  navigation: NavigationState;
  timelineData: TimelineDataState;
  pouchDb: PouchDbState;
}>;
