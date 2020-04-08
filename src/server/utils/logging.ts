import { RequestHandler } from 'core/models/api';
import { noop } from 'lodash';
import { mapObject } from 'server/utils/data';
import { generateUuid } from 'core/utils/id';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LoggerMethod = (message: string, meta?: any) => void;
export type Logger = { [level in LogLevel]: LoggerMethod };

export const NO_LOGGING: Logger = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

export function createConsoleLogger(): Logger {
  const bind = (level: LogLevel): LoggerMethod => {
    return (message, meta) => {
      const line = `[${level}] ${message}`;
      const args = typeof meta === 'undefined' ? [line] : [line + '\n', meta];
      console.log.apply(console, args as any);
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
  const [id] = (uuid || generateUuid()).split('-');
  return `${label}-${id}`;
}

// Wraps the logger so that it logs into a specific context
export function bindLoggingContext(logger: Logger, contextName: string): Logger {
  return mapObject(logger, method => (message: string, meta?: any) => method(`{${contextName}} ${message}`, meta));
}
