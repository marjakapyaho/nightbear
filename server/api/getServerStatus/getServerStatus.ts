import { Response, Context, Request, createResponse } from '../../utils/api';

export function getServerStatus(request: Request, context: Context): Response {
  return createResponse({
    message: 'Nightbear Server is OK',
    path: request.requestPath,
    timestamp: new Date(context.timestamp()).toISOString(),
  });
}
