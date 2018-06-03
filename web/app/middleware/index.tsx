import { logger } from 'nightbear/web/app/middleware/logger';
import { persistence } from 'nightbear/web/app/middleware/persistence';
import { database } from 'nightbear/web/app/middleware/database';

export default [logger, persistence, database];
