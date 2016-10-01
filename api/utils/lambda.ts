export interface Request {
  requestId: string;
  requestMethod: string;
  requestParams: Object;
  requestBody: Object;
  requestEnv: Object;
}

type RequestHandler = (request: Request) => Promise<Object>;
type RequestHandlerMap = { [propName: string]: RequestHandler; };

export function setUpRequestHandlers(exports: Object, handlers: RequestHandlerMap): void {
  Object.keys(handlers).forEach(handlerName => {
    exports[handlerName] = (event, context, cb) => {
      Promise.resolve({
        requestId: context.awsRequestId,
        requestMethod: event.method,
        requestParams: event.query,
        requestBody: event.body,
        requestEnv: process.env,
      })
        .then(handlers[handlerName])
        .then(
          res => cb(null, res),
          err => cb(new Error(`[500] Nightbear API Error (see logs for requestId ${context.awsRequestId})`)) // see https://serverless.com/framework/docs/providers/aws/events/apigateway/#status-codes
        );
    };
  });
}
