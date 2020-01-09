import { configVarsMiddleware } from 'web/src/modules/configVars/middleware';
import { pouchDbMiddleware } from 'web/src/modules/pouchDb/middleware';

export const middleware = [configVarsMiddleware, pouchDbMiddleware];
