import { configVarsMiddleware } from 'web/modules/configVars/middleware';
import { pouchDbMiddleware } from 'web/modules/pouchDb/middleware';

export const middleware = [configVarsMiddleware, pouchDbMiddleware];
