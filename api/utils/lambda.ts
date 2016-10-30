import { Request, Context } from '../utils/types';
import { createContext } from './context';
import { Logger, handlerWithLogging, getContextName, bindLoggingContext } from './logging';

type RequestHandler = (request: Request, context: Context) => Promise<Object>;
type RequestHandlerMap = { [propName: string]: RequestHandler; };

export function setUpRequestHandlers(exports: Object, handlers: RequestHandlerMap): void {
  const context = createContext(process.env);
  context.log.info(`Nightbear API server started`);
  Object.keys(handlers).forEach(handlerName => {
    exports[handlerName] = (lambdaEvent, lambdaContext, cb) => {
      const requestId = lambdaContext.awsRequestId;
      const log = bindLoggingContext(context.log, getContextName('request', requestId));
      Promise.resolve({
        requestId,
        requestMethod: lambdaEvent.httpMethod,
        requestPath: lambdaEvent.path,
        requestParams: lambdaEvent.queryStringParameters || {},
        requestHeaders: lambdaEvent.headers || {},
        requestBody: parseRequestBody(lambdaEvent.body || '{}', log),
      })
        .then(request => handlerWithLogging(handlers[handlerName], log)(request, context))
        .then(
          res => cb(null, { statusCode: 200, body: JSON.stringify(res) }),
          err => cb(null, { statusCode: 500, body: JSON.stringify({ errorMessage: `Nightbear API Error (see logs for requestId ${lambdaContext.awsRequestId})` }) })
        )
    };
  });
}

function parseRequestBody(body: string, log: Logger): Object {
  try {
    return JSON.parse(body);
  } catch (e) {
    log.warn('Could not parse request body as JSON: ' + body);
    return {};
  }
}
