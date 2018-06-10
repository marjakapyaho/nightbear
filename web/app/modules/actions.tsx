import { ConfigVarsAction } from 'web/app/modules/configVars/actions';
import { PouchDbAction } from 'web/app/modules/pouchDb/actions';
import { TimelineDataAction } from 'web/app/modules/timelineData/actions';

export type ReduxAction = ConfigVarsAction | PouchDbAction | TimelineDataAction;
