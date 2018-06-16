import { ConfigVarsState, configVarsInitState } from 'web/app/modules/configVars/state';
import { PouchDbState, pouchDbInitState } from 'web/app/modules/pouchDb/state';
import { TimelineDataState, timelineDataInitState } from 'web/app/modules/timelineData/state';

export const initReduxState: ReduxState = {
  configVars: configVarsInitState,
  pouchDb: pouchDbInitState,
  timelineData: timelineDataInitState,
};

export type ReduxState = Readonly<{
  configVars: ConfigVarsState;
  pouchDb: PouchDbState;
  timelineData: TimelineDataState;
}>;
