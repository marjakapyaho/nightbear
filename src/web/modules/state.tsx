import { configInitState, ConfigState } from 'web/modules/config/state';
import { pouchDbInitState, PouchDbState } from 'web/modules/pouchDb/state';
import { timelineDataInitState, TimelineDataState } from 'web/modules/timelineData/state';
import { uiNavigationInitState, UiNavigationState } from 'web/modules/uiNavigation/state';

export const initReduxState: ReduxState = {
  config: configInitState,
  uiNavigation: uiNavigationInitState,
  timelineData: timelineDataInitState,
  pouchDb: pouchDbInitState,
};

export type ReduxState = Readonly<{
  config: ConfigState;
  uiNavigation: UiNavigationState;
  timelineData: TimelineDataState;
  pouchDb: PouchDbState;
}>;
