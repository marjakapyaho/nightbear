import { Request } from './lambda';

export interface Context {
  timestamp: () => number;
}

export function createRequestContext(request: Request): Context {
  return {
    timestamp: Date.now,
  };
}
