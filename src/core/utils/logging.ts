import { Context } from 'core/models/api';
import debug, { Debugger } from 'debug';
import { noop } from 'lodash';

// We expose only a subset of the full 'debug' API
export interface Logger {
  (message: string, ...args: any[]): void;
}

// Convenience object for having no logging
export const NO_LOGGING: Logger = noop;

// Creates a new root Logger.
// This can (and should) be extended as needed.
// For debug/info/warn/error-colors see: https://github.com/visionmedia/debug/issues/514#issuecomment-372297694
export function createLogger(): Logger {
  return debug('nightbear');
}

// Adds a namespace to the given Logger.
// When given a Context, creates a new Context with the Logger replaced with the extended one.
export function extendLogger<T extends Context | Logger>(x: T, namespace: string): T;
export function extendLogger(x: Context | Logger, namespace: string): Context | Logger {
  if (isLogger(x)) {
    return unwrapLogger(x).extend(namespace);
  } else {
    return { ...x, log: unwrapLogger(x.log).extend(namespace) };
  }
}

// Type guard for our Logger
function isLogger(x: unknown): x is Logger {
  return typeof x === 'function' && 'color' in x && 'extend' in x && 'namespace' in x; // close enough ¯\_(ツ)_/¯
}

// Expose the full 'debug' API for internal use
function unwrapLogger(logger: Logger): Debugger {
  if (isLogger(logger)) {
    return logger as any;
  } else {
    throw new Error("Given Logger doesn't look like a wrapped Debugger");
  }
}
