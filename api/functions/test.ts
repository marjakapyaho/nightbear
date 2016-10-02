import { Request } from '../utils/types';

// API function for testing connectivity & failure handling on clients
export default function(request: Request) {
  if (request.requestParams['fail'])
    return Promise.reject({
      request: request,
    });
  else
    return Promise.resolve({
      request: request,
    });
}
