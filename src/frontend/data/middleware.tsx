import { apiMiddleware } from 'frontend/data/api/middleware';
import { configMiddleware } from 'frontend/data/config/middleware';
import { navigationMiddleware } from 'frontend/data/navigation/middleware';
import { pouchDbMiddleware } from 'frontend/data/pouchDb/middleware';

export const middleware = [configMiddleware, apiMiddleware, navigationMiddleware, pouchDbMiddleware];
