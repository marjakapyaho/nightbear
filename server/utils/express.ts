import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { RequestHandler, Context } from './api';
import { getUuid } from './uuid';
import { bindLoggingContext, getContextName, handlerWithLogging } from './logging';

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
        Promise.resolve({
          requestId,
          requestMethod: req.method,
          requestPath: req.path,
          requestParams: req.query,
          requestHeaders: req.headers,
          requestBody: req.body,
        })
          .then(request => {
            const log = bindLoggingContext(context.log, getContextName('request', requestId));
            return handlerWithLogging(handler, log)(request, context);
          })
          .then(
            response => res.status(response.responseStatus).json(response.responseBody),
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
