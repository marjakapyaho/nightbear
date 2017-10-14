import { getUuid } from './uuid';
import { mapObject } from './data';

export type LogLevel
  = 'debug'
  | 'info'
  | 'warn'
  | 'error';
export type LoggerMethod = (message: string, meta?: any) => void;
export type Logger = {
  [level in LogLevel]: LoggerMethod;
};

export function createConsoleLogger(): Logger {
  const bind = (level: LogLevel): LoggerMethod => {
    return (message, meta) => {
      const line = `[${level}] ${message}`;
      const args = typeof meta === 'undefined' ? [ line ] : [ line + '\n', meta ];
      console.log.apply(console, args);
    };
  };
  return {
    debug: bind('debug'),
    info: bind('info'),
    warn: bind('warn'),
    error: bind('error'),
  };
}

// Transform an UUID into a helpful context name for bindLoggingContext()
// @example getContextName() => "default-32846a768f5f"
// @example getContextName('request', req.get('X-Request-ID')) => "request-32846a768f5f"
export function getContextName(label = 'default', uuid?: string) {
  const [ id ] = (uuid || getUuid()).split('-');
  return `${label}-${id}`;
}

// Wraps the logger so that it logs into a specific context
export function bindLoggingContext(logger: Logger, contextName: string): Logger {
  return mapObject(
    logger,
    method =>
      (message: string, meta?: any) =>
        method(`{${contextName}} ${message}`, meta),
  );
}
