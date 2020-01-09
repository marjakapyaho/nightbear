import * as bodyParser from 'body-parser';
import { Context, Headers, Request, RequestHandler } from 'core/models/api';
import cors from 'cors';
import express from 'express';
import { Request as ExpressRequest } from 'express';
import { bindLoggingContext, getContextName, handlerWithLogging } from 'server/utils/logging';
import { getUuid } from 'server/utils/uuid';

export type HttpMethod = 'get' | 'post';
export type RequestHandlerTuple = [HttpMethod, string, RequestHandler];

export function startExpressServer(context: Context, ...handlers: RequestHandlerTuple[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    handlers.forEach(([method, path, handler]) => {
      app[method](path, (req, res) => {
        const requestId = req.get('X-Request-ID') || getUuid(); // use Heroku-style req-ID where available, but fall back to our own
        Promise.resolve(normalizeRequest(requestId, req))
          .then(request => {
            const log = bindLoggingContext(context.log, getContextName('request', requestId));
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
