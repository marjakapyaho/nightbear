import { ConfigVarsState, configVarsInitState } from 'web/app/modules/configVars/state';
import { PouchDbState, pouchDbInitState } from 'web/app/modules/pouchDb/state';
import { TimelineDataState, timelineDataInitState } from 'web/app/modules/timelineData/state';
import { uiNavigationInitState, UiNavigationState } from 'web/app/modules/uiNavigation/state';

export const initReduxState: ReduxState = {
  configVars: configVarsInitState,
  uiNavigation: uiNavigationInitState,
  pouchDb: pouchDbInitState,
  timelineData: timelineDataInitState,
};

export type ReduxState = Readonly<{
  configVars: ConfigVarsState;
  uiNavigation: UiNavigationState;
  pouchDb: PouchDbState;
  timelineData: TimelineDataState;
}>;
