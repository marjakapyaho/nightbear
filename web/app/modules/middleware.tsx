import { configVarsMiddleware } from 'web/app/modules/configVars/middleware';
import { pouchDbMiddleware } from 'web/app/modules/pouchDb/middleware';

export const middleware = [configVarsMiddleware, pouchDbMiddleware];
