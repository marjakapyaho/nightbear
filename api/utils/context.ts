import { Context } from '../utils/types';
import { createLogger } from '../utils/logging';

export function createContext(env: Object): Context {
  return {
    version: env['NIGHTBEAR_API_VERSION'],
    timestamp: Date.now,
    log: createLogger({
      papertrailUrl: env['NIGHTBEAR_API_PAPERTRAIL_URL'] || null,
      cloudWatchFormat: env['NIGHTBEAR_API_CLOUDWATCH_LOGS'] || false,
      loggingLevel: env['NIGHTBEAR_API_LOG_LEVEL'] || 'debug',
      systemName: `nightbear-api-${env['NIGHTBEAR_API_ENV'] || 'unknown'}`,
    })
  };
}
