import * as express from 'express';
import { Request as ExpressRequest } from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { RequestHandler, Request, Headers, Context } from '../models/api';
import { getUuid } from '../utils/uuid';
import { bindLoggingContext, getContextName, handlerWithLogging } from '../utils/logging';

export type HttpMethod = 'get' | 'post';
export type RequestHandlerTuple = [ HttpMethod, string, RequestHandler ];

export function startExpressServer(context: Context, ...handlers: RequestHandlerTuple[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    handlers.forEach(([ method, path, handler ]) => {
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
              }
              else {
                res.json(responseBody);
              }
            },
            () => res.status(500).json({ errorMessage: `Nightbear Server Error (see logs for requestId ${requestId})` }),
          );
      });
    });
    const server = app.listen(context.httpPort, () => {
      resolve(server.address().port);
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
