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
): Promise<any> {
  return Promise.all(
    outgoingUrls.map(outgoingUrl => axiosOverride.request({
      url: outgoingUrl,
      method: incomingRequest.requestMethod,
      data: incomingRequest.requestBody,
      headers: getProxiedHeaders(incomingRequest.requestHeaders),
      params: incomingRequest.requestParams,
    })),
  );
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
