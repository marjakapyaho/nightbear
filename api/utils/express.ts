import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { getUuid } from './uuid';
import { createContext } from './context';
import { RequestHandler } from './types';
import { handlerWithLogging, getContextName, bindLoggingContext } from './logging';

type HttpMethod = 'get' | 'post';
type RequestHandlerTuple = [ HttpMethod, string, RequestHandler ];

export function setUpRequestHandlers(...handlers: RequestHandlerTuple[]): void {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  const context = createContext(process.env);
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
          const log = bindLoggingContext(context.log, getContextName('request', request.requestId));
          return handlerWithLogging(handler, log)(request, context);
        })
        .then(
          data => res.status(200).json(data),
          err => res.status(500).json({ errorMessage: `Nightbear API Error (see logs for requestId ${requestId})` })
        );
    });
  });
  const server = app.listen(3000, () => {
    context.log.info(`Nightbear API server listening on port ${server.address().port}`);
  });
}
