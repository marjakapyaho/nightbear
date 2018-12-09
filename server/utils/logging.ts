import { RequestHandler } from 'core/models/api';
import { noop } from 'lodash';
import { getUuid } from 'server/utils/uuid';
import { mapObject } from 'server/utils/data';

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
  const [id] = (uuid || getUuid()).split('-');
  return `${label}-${id}`;
}

// Wraps the logger so that it logs into a specific context
export function bindLoggingContext(logger: Logger, contextName: string): Logger {
  return mapObject(logger, method => (message: string, meta?: any) => method(`{${contextName}} ${message}`, meta));
}

// Wraps the given handler with logging for input/output
export function handlerWithLogging(handler: RequestHandler, log: Logger): RequestHandler {
  return (request, context) => {
    const then = context.timestamp();
    const duration = () => ((context.timestamp() - then) / 1000).toFixed(3) + ' sec';
    log.debug(`Incoming request: ${request.requestMethod} ${request.requestPath}`, request);
    return handler(request, context).then(
      res => {
        log.debug(`Outgoing response`, res);
        log.info(`Served request: ${request.requestMethod} ${request.requestPath} (${duration()}) => SUCCESS`);
        return res;
      },
      err => {
        log.debug(`Outgoing error`, err);
        log.info(`Served request: ${request.requestMethod} ${request.requestPath} (${duration()}) => FAILURE`);
        return Promise.reject(err);
      },
    );
  };
}
