import { ConfigVarsAction } from 'web/app/modules/configVars/actions';
import { PouchDbAction } from 'web/app/modules/pouchDb/actions';

export type ReduxAction = ConfigVarsAction | PouchDbAction;
