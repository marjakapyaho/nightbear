import { Context } from '../utils/types';

export function createContext(env: Object): Context {
  return {
    version: env['NIGHTBEAR_API_VERSION'],
    timestamp: Date.now,
  };
}
