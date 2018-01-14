import axios, { AxiosInstance } from 'axios';
import { Request, Headers } from '../../server/utils/api';

const PROXIED_HEADERS = [
  'authorization',
  'content-type',
  'user-agent',
];

export function proxyRequest(
  incomingRequest: Request,
  outgoingUrls: string[],
  axiosOverride: AxiosInstance = axios,
): Promise<{ [outgoingUrl: string]: number }> {
  return Promise.all(
    outgoingUrls.map(outgoingUrl =>
      axiosOverride.request({
        url: outgoingUrl,
        method: incomingRequest.requestMethod,
        data: incomingRequest.requestBody,
        headers: getProxiedHeaders(incomingRequest.requestHeaders),
        params: incomingRequest.requestParams,
      })
        .then(
          res => res.status,
          err => { // @see https://github.com/axios/axios#handling-errors
            if (err.response) return err.response.status as number; // The request was made and the server responded with a status code that falls out of the range of 2xx
            if (err.request) return 0; // The request was made but no response was received
            throw new Error(`Could not proxy request: ${err}`); // Something happened in setting up the request that triggered an Error
          },
        )
        .then(result => ({ [outgoingUrl]: result })),
    ),
  ).then(results => results.reduce((memo, next) => Object.assign(memo, next), {}));
}

function getProxiedHeaders(headers: Headers): Headers {
  return Object.keys(headers)
    .map(key => [ key, headers[key] ])
    .reduce((memo, next) => {
      const [ key, val ] = next;
      if (PROXIED_HEADERS.indexOf(key.toLowerCase()) !== -1) {
        memo[key] = val;
      }
      return memo;
    }, {} as Headers);
}
