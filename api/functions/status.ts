import { Request } from '../utils/lambda';
import { Context } from '../utils/context';

// API function for checking the health & status of the API
export default function(request: Request, context: Context) {
  return Promise.resolve({
    status: 200,
    message: 'Nightbear API is OK',
    version: context.version,
    timestamp: context.timestamp(),
  });
}
