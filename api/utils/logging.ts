import { RequestHandler } from './types';

export function handlerWithLogging(handler: RequestHandler): RequestHandler {
  return (request, context) => {
    const then = context.timestamp();
    const duration = () => ((context.timestamp() - then) / 1000).toFixed(3) + ' sec';
    console.log(`Incoming request: ${request.requestMethod} ${request.requestPath}`, request);
    return handler(request, context)
      .then(
        res => {
          console.log(`Outgoing response: ${request.requestMethod} ${request.requestPath} (${duration()})`, res);
          return res;
        },
        err => {
          console.log(`Outgoing error: ${request.requestMethod} ${request.requestPath} (${duration()})`, err);
          return Promise.reject(err);
        },
      );
  };
}
