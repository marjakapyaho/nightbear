import { Request } from '../../server/utils/api';

// Note: This assumes a request pipeline of CloudFront -> API Gateway -> Lambda
export function normalizeIncomingRequest(event: any): Request {
  return {
    requestId: event.requestContext.requestId,
    requestMethod: event.httpMethod,
    requestPath: event.path,
    requestParams: event.queryStringParameters || {},
    requestHeaders: event.headers || {},
    requestBody: event.body,
  };
}
