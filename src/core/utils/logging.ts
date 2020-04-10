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
export function extendLogger<T extends Context | Logger>(x: T, namespace: string, keepColor?: boolean): T;
export function extendLogger(x: Context | Logger, namespace: string, keepColor = false): Context | Logger {
  if (isNoopLogger(x)) {
    return x;
  } else if (isConcreteLogger(x)) {
    const e = x.extend(namespace);
    if (keepColor) e.color = x.color;
    return e;
  } else {
    return { ...x, log: extendLogger(x.log, namespace, keepColor) };
  }
}

// Output stream that writes to console.log(), with the exact formatting we want.
// See: https://github.com/visionmedia/debug#output-streams
export function consoleLogStream(x: string) {
  const ts = new Date().toISOString().replace(/.*?T(.....).*/, '$1'); // e.g. "12:34"
  x = x.replace(/^ */gm, ''); // remove leading spaces; see https://github.com/visionmedia/debug/issues/619
  x = x.replace(/^([^ ]*)nightbear:/gm, '$1'); // remove the common "nightbear:" prefix; it's good to have in the namespace for filtering etc, but we don't want to show it all the time
  x = x.replace(/^/gm, `${ts} `); // prefix each line with our timestamp
  console.log(x);
}

function isNoopLogger(x: unknown): x is typeof noop {
  return x === noop;
}

function isConcreteLogger(x: unknown): x is Debugger {
  return typeof x === 'function' && 'color' in x && 'extend' in x && 'namespace' in x; // close enough ¯\_(ツ)_/¯
}
