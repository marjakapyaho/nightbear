import { logger } from 'app/middleware/logger';
import { persistence } from 'app/middleware/persistence';
import { database } from 'app/middleware/database';

export default [logger, persistence, database];
