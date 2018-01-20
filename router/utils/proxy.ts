import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Request, Headers } from '../../server/utils/api';

const PROXIED_HEADERS = [
  'authorization',
  'content-type',
  'user-agent',
  'x-request-id',
];

export interface ProxyResponse {
  data: any;
  status: number;
  statusText: string;
  headers: Headers;
}

export function proxyRequest(
  incomingRequest: Request,
  outgoingUrls: string[],
  axiosOverride: AxiosInstance = axios,
): Promise<{ [outgoingUrl: string]: ProxyResponse }> {
  return Promise.all(
    outgoingUrls.map(outgoingUrl =>
      axiosOverride.request({
        url: outgoingUrl,
        method: incomingRequest.requestMethod,
        data: incomingRequest.requestBody,
        headers: getProxiedHeaders(incomingRequest.requestHeaders, incomingRequest.requestId),
        params: incomingRequest.requestParams,
      })
        .then(simplifyResponse)
        .catch(err => { // @see https://github.com/axios/axios#handling-errors
          if (err.response) return simplifyResponse(err.response); // The request was made and the server responded with a status code that falls out of the range of 2xx
          if (err.request) return errorResponse('No response to request'); // The request was made but no response was received
          throw new Error(`Could not proxy request: ${err}`); // Something happened in setting up the request that triggered an Error
        })
        .then(result => ({ [outgoingUrl]: result })),
    ),
  ).then(results => results.reduce((memo, next) => Object.assign(memo, next), {}));
}

function getProxiedHeaders(headers: Headers, includeRequestId?: string): Headers {
  return Object.keys(headers)
    .map(key => [ key, headers[key] ])
    .reduce((memo, next) => {
      const [ key, val ] = next;
      if (PROXIED_HEADERS.indexOf(key.toLowerCase()) !== -1) {
        memo[key] = val;
      }
      return memo;
    }, includeRequestId ? { 'X-Request-ID': includeRequestId } : {} as Headers);
}

function simplifyResponse(response: AxiosResponse): ProxyResponse {
  const { data, status, statusText, headers } = response;
  return { data, status, statusText, headers };
}

function errorResponse(statusText: string): ProxyResponse {
  return {
    data: null,
    status: 0,
    statusText,
    headers: {},
  };
}
