import { logger } from 'web/app/middleware/logger';
import { persistence } from 'web/app/middleware/persistence';
import { database } from 'web/app/middleware/database';

export default [logger, persistence, database];
