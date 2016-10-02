import { Request } from '../utils/lambda';
import { Context } from '../utils/context';

export default function(request: Request, context: Context) {
  if (request.requestParams['fail'])
    return Promise.reject({
      status: 500,
      message: 'Nightbear API simulated failure',
    });
  else
    return Promise.resolve({
      status: 200,
      message: 'Nightbear API is OK',
      timestamp: context.timestamp(),
      version: context.version,
      request: request,
    });
}
