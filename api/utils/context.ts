export interface Context {
  version: string;
  timestamp: () => number;
}

export function createContext(env: Object): Context {
  return {
    version: env['NIGHTBEAR_API_VERSION'],
    timestamp: Date.now,
  };
}
