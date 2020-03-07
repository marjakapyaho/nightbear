import { configMiddleware } from 'web/modules/config/middleware';
import { navigationMiddleware } from 'web/modules/navigation/middleware';
import { pouchDbMiddleware } from 'web/modules/pouchDb/middleware';

export const middleware = [configMiddleware, navigationMiddleware, pouchDbMiddleware];
