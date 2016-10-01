interface Request {
  requestId: string;
  requestMethod: string;
  requestParams: Object;
  requestBody: Object;
  requestEnv: Object;
}

export default function(request: Request) {
  if (request.requestParams['fail'])
    return Promise.reject({
      status: 500,
      message: 'Nightbear API simulated failure',
    });
  else
    return Promise.resolve({
      status: 200,
      message: 'Nightbear API is OK',
      details: redactSecrets(request),
    });
}

function redactSecrets(request: Request) {
  return Object.keys(request)
    .filter(key => key !== 'requestEnv')
    .reduce((memo, key) => {
      memo[key] = request[key];
      return memo;
    }, { requestEnv: '(redacted for security)' });
}
