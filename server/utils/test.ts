import { Context } from '../models/api';
import { NO_LOGGING } from './logging';
import { NO_STORAGE } from '../storage/storage';

export function createTestContext(): Context {
  return {
    httpPort: 80,
    timestamp: () => 1508672249758,
    log: NO_LOGGING,
    storage: NO_STORAGE,
  };
}
