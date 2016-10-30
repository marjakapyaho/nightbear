import { RequestHandler } from './types';
import * as winston from 'winston';
import 'winston-papertrail'; // importing `winston-papertrail` will expose `winston.transports.Papertrail`
import { extend, isString, mapValues, isPlainObject, isArray, isUndefined, isError, attempt, random, last, get as getIn } from 'lodash';
import { hostname } from 'os';

// @see https://github.com/winstonjs/winston#using-logging-levels
const AVAILABLE_LOGGING_LEVELS = Object.freeze({
  debug: true,
  info: true,
  warn: true,
  error: true,
});

export interface Logger {
  debug: (message: string, meta?: any) => void;
  info:  (message: string, meta?: any) => void;
  warn:  (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
  disposeLogger: () => void;
  wrappedLoggerInstance: any;
}

// Wraps the given handler with logging for input/output
export function handlerWithLogging(handler: RequestHandler, log: Logger): RequestHandler {
  return (request, context) => {
    const then = context.timestamp();
    const duration = () => ((context.timestamp() - then) / 1000).toFixed(3) + ' sec';
    log.debug(`Incoming request: ${request.requestMethod} ${request.requestPath}`, request);
    return handler(request, context)
      .then(
        res => {
          log.info(`Outgoing response: ${request.requestMethod} ${request.requestPath} (${duration()})`, res);
          return res;
        },
        err => {
          log.warn(`Outgoing error: ${request.requestMethod} ${request.requestPath} (${duration()})`, err);
          return Promise.reject(err);
        },
      );
  };
}

interface LoggerOptions {
  papertrailUrl?: string;
  loggingLevel?: string;
  systemName?: string;
  handleExceptions?: boolean;
  defaultContextName?: string;
}

// Returns an object with a method for each available logging level
// @example log = createLogger({ papertrailUrl: 'logs1.papertrailapp.com:123' });
//          log.debug('Hello, World!', { some: 'metadata' });
export function createLogger(opts?: LoggerOptions): Logger {
  const logger = new winston.Logger();
  const log = (level, message, ...meta) => {
    if (!isString(message)) logger.log('warn', 'First argument to logger should be a string message');
    logger.log(level, message, meta.length === 1 ? meta[0] : meta); // intentionally ignore return value
  };
  const handleExceptions = opts && opts.handleExceptions === false ? false : true; // default to true
  if (opts && opts.papertrailUrl) {
    logger.add(winston.transports['Papertrail'], { // we need to access with brackets since we don't have a type declaration
      level: opts.loggingLevel || 'debug',
      host: opts.papertrailUrl.split(':')[0],
      port: opts.papertrailUrl.split(':')[1],
      hostname: opts.systemName || hostname(), // note: this is a Papertrail-specific option
      program: getContextName(opts.defaultContextName), // ^ ditto
      colorize: true,
      handleExceptions,
    });
  } else {
    logger.add(winston.transports.Console, {
      level: opts && opts.loggingLevel || 'debug',
      timestamp: () => new Date().toISOString().replace('T', ' '),
      colorize: true,
      prettyPrint: true,
      handleExceptions,
    });
  }
  return extend(
    mapValues(AVAILABLE_LOGGING_LEVELS, (_, level) => log.bind(null, level)),
    {
      disposeLogger: logger.close.bind(logger),
      wrappedLoggerInstance: logger,
    }
  ) as Logger;
}

// Transform an UUID into a helpful context name for bindLoggingContext()
// @example getContextName() => "default-193830451"
// @example getContextName('request', req.get('X-Request-ID')) => "request-32846a768f5f"
export function getContextName(label = 'default', uuid?: string) {
  if (uuid) return `${label}-${last(uuid.split('-'))}`; // the last 12 digits are unique enough for our purposes, without cluttering the logs too much
  return `${label}-${random(1e8, 1e9 - 1)}`;
}

// Wraps the logger so that it logs into a specific Papertrail program
export function bindLoggingContext(logger: Logger, contextName: string): Logger {
  if (getIn(logger, 'wrappedLoggerInstance.transports.Papertrail')) { // Papertrail has a native mechanism for logging into a specific context (or "program" as they call it)
    return mapValues(logger, (func, name) => {
      if (!AVAILABLE_LOGGING_LEVELS[name as string]) return func; // not a logging function
      return (...args) => {
        // Yes, this is super ugly, but currently there's no way to pass a "program" value per log() invocation.
        // Also, we know that this call will always be synchronous, and never recursive, so this SHOULD be totally safe. :sunglasses:
        // @see https://github.com/kenperkins/winston-papertrail/blob/v1.0.2/lib/winston-papertrail.js#L258
        const prev = logger.wrappedLoggerInstance.transports.Papertrail.program;
        logger.wrappedLoggerInstance.transports.Papertrail.program = contextName;
        func.apply(null, args);
        logger.wrappedLoggerInstance.transports.Papertrail.program = prev;
      };
    });
  } else { // the other transports don't have a concept of "program", so just work as a no-op
    return logger;
  }
}
