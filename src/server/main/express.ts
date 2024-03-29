import * as bodyParser from 'body-parser';
import { Context, Headers, Request, RequestHandler } from 'core/models/api';
import { generateUuid } from 'core/utils/id';
import { extendLogger, Logger } from 'core/utils/logging';
import cors from 'cors';
import express, { Request as ExpressRequest } from 'express';
import { isString, pickBy } from 'lodash';

export type HttpMethod = 'get' | 'post';
export type RequestHandlerTuple = [HttpMethod, string, RequestHandler];

export function startExpressServer(context: Context, ...handlers: RequestHandlerTuple[]): Promise<number> {
  const log = extendLogger(context.log, 'http');
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    handlers.forEach(([method, path, handler]) => {
      app[method](path, (req, res) => {
        const requestId = req.get('X-Request-ID') || generateUuid(); // use Heroku-style req-ID where available, but fall back to our own
        Promise.resolve(normalizeRequest(requestId, req))
          .then(request => handlerWithLogging(handler, log)(request, context))
          .then(
            response => {
              const { responseBody, responseStatus } = response;
              res.status(responseStatus);
              if (typeof responseBody === 'string') {
                res.send(responseBody);
              } else {
                res.json(responseBody);
              }
            },
            () =>
              res.status(500).json({ errorMessage: `Nightbear Server Error (see logs for requestId ${requestId})` }),
          );
      });
    });
    const server = app.listen(context.httpPort, () => {
      const address = server.address();
      if (address && typeof address !== 'string') {
        log(`Server listening on ${address.port}`);
        resolve(address.port);
      } else {
        reject(new Error('Could not determine assigned port'));
      }
    });
    server.on('error', err => reject(err));
  });
}

function normalizeRequest(requestId: string, req: ExpressRequest): Request {
  return {
    requestId,
    requestMethod: req.method,
    requestPath: req.path,
    requestParams: pickBy(req.query, isString),
    requestHeaders: (req.headers ? req.headers : {}) as Headers, // without this cast, TS refuses to accept this because req.headers can be undefined (the ternary will handle that)
    requestBody: req.body,
  };
}

// Wraps the given handler with logging for input/output
function handlerWithLogging(handler: RequestHandler, log: Logger): RequestHandler {
  return (request, context) => {
    const debug = extendLogger(log, getLoggingNamespace('req', request.requestId), true);
    const then = context.timestamp();
    const duration = () => ((context.timestamp() - then) / 1000).toFixed(3) + ' sec';
    debug(`Incoming request: ${request.requestMethod} ${request.requestPath}\n%O`, request);
    return handler(request, context).then(
      res => {
        debug(`Outgoing ${res.responseStatus} response:\n%O`, res.responseBody);
        log(`${request.requestMethod} ${request.requestPath} (${duration()}) => SUCCESS`);
        return res;
      },
      err => {
        debug(`Outgoing error:\n%O`, err);
        log(`${request.requestMethod} ${request.requestPath} (${duration()}) => FAILURE`);
        return Promise.reject(err);
      },
    );
  };
}

// Transform an UUID into a helpful logging context/namespace
// @example getContextName() => "default-32846a768f5f"
// @example getContextName('request', req.get('X-Request-ID')) => "request-32846a768f5f"
function getLoggingNamespace(label = 'default', uuid?: string) {
  const [id] = (uuid || generateUuid()).split('-');
  return `${label}-${id}`;
}
