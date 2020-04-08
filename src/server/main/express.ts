import * as bodyParser from 'body-parser';
import { Context, Headers, Request, RequestHandler } from 'core/models/api';
import { generateUuid } from 'core/utils/id';
import { extendLogger, Logger } from 'core/utils/logging';
import cors from 'cors';
import express, { Request as ExpressRequest } from 'express';
import { getContextName } from 'server/utils/logging';

export type HttpMethod = 'get' | 'post';
export type RequestHandlerTuple = [HttpMethod, string, RequestHandler];

export function startExpressServer(context: Context, ...handlers: RequestHandlerTuple[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    handlers.forEach(([method, path, handler]) => {
      app[method](path, (req, res) => {
        const requestId = req.get('X-Request-ID') || generateUuid(); // use Heroku-style req-ID where available, but fall back to our own
        Promise.resolve(normalizeRequest(requestId, req))
          .then(request => {
            const log = extendLogger(context.log, getContextName('req', requestId));
            return handlerWithLogging(handler, log)(request, context);
          })
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
    requestParams: req.query,
    requestHeaders: (req.headers ? req.headers : {}) as Headers, // without this cast, TS refuses to accept this because req.headers can be undefined (the ternary will handle that)
    requestBody: req.body,
  };
}

// Wraps the given handler with logging for input/output
function handlerWithLogging(handler: RequestHandler, log: Logger): RequestHandler {
  return (request, context) => {
    const then = context.timestamp();
    const duration = () => ((context.timestamp() - then) / 1000).toFixed(3) + ' sec';
    log(`Incoming request: ${request.requestMethod} ${request.requestPath}`, request.requestBody);
    return handler(request, context).then(
      res => {
        log(`Outgoing response status`, res.responseStatus);
        log(`Served request: ${request.requestMethod} ${request.requestPath} (${duration()}) => SUCCESS`);
        return res;
      },
      err => {
        log(`Outgoing error`, err);
        log(`Served request: ${request.requestMethod} ${request.requestPath} (${duration()}) => FAILURE`);
        return Promise.reject(err);
      },
    );
  };
}
