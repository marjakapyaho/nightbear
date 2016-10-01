import { Request } from '../utils/lambda';

export default function(request: Request) {
  if (request.requestParams['fail'])
    return Promise.reject({
      status: 500,
      message: 'Nightbear API simulated failure',
      details: withoutSecretDetails(request),
    });
  else
    return Promise.resolve({
      status: 200,
      message: 'Nightbear API is OK',
      details: withoutSecretDetails(request),
    });
}

function withoutSecretDetails(request: Request) {
  return Object.keys(request)
    .filter(key => key !== 'requestEnv')
    .reduce((memo, key) => {
      memo[key] = request[key];
      return memo;
    }, { requestEnv: '(redacted for security)' });
}
