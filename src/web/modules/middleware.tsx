import { configMiddleware } from 'web/modules/config/middleware';
import { pouchDbMiddleware } from 'web/modules/pouchDb/middleware';

export const middleware = [configMiddleware, pouchDbMiddleware];
