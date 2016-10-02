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
      request: withoutSecrets(request),
      timestamp: context.timestamp(),
      version: context.version,
    });
}

function withoutSecrets(request: Request) {
  return Object.keys(request)
    .reduce((memo, key) => {
      if (key === 'requestEnv')
        memo[key] = Object.keys(request[key])
          .reduce((memo, envVarName) => {
            memo[envVarName] = '(redacted for security)';
            return memo;
          }, {});
      else
        memo[key] = request[key];
      return memo;
    }, {});
}
