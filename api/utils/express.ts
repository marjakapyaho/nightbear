import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { getUuid } from './uuid';
import { Context, createContext } from './context';
import { Request } from './lambda';

type RequestHandler = (request: Request, context: Context) => Promise<Object>;
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
        requestParams: req.query,
        requestHeaders: req.headers,
        requestBody: req.body,
      })
        .then(request => handler(request, context))
        .then(
          data => res.status(200).json(data),
          err => res.status(500).json({ errorMessage: `[500] Nightbear API Error (see logs for requestId ${requestId})` })
        );
    });
  });
  const server = app.listen(3000, () => {
    console.log(`Nightbear API server listening on port ${server.address().port}`);
  });
}
