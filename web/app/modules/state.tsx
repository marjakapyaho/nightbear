import { ConfigVarsState } from 'web/app/modules/configVars/state';
import { PouchDbState } from 'web/app/modules/pouchDb/state';
import { TimelineDataState } from 'web/app/modules/timelineData/state';

export type ReduxState = Readonly<{
  configVars: ConfigVarsState;
  pouchDb: PouchDbState;
  timelineData: TimelineDataState;
}>;
