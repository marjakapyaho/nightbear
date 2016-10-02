import { Request } from '../utils/lambda';

// API function for testing connectivity & failure handling on clients
export default function(request: Request) {
  if (request.requestParams['fail'])
    return Promise.reject({
      status: 500,
      message: 'Nightbear API simulated failure',
      request: request,
    });
  else
    return Promise.resolve({
      status: 200,
      message: 'Nightbear API is OK',
      request: request,
    });
}
