import type { Context } from '@netlify/functions';
import { Request as NightbearRequest } from '../utils/api';

export default async (req: Request, context: Context) => {
  console.log('Hello from Nightbear API!');

  const requestMethod = req.method;
  const requestUrl = new URL(req.url);
  const requestPath = requestUrl.pathname;

  const requestHeaders: { [key: string]: string } = {};
  req.headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });

  const requestParams: { [param: string]: string } = {};
  requestUrl.searchParams.forEach((value, key) => {
    requestParams[key] = value;
  });

  let requestBody: object | string = {};
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      requestBody = await req.json();
    } else {
      requestBody = await req.text();
    }
  }

  console.log({
    requestId: context.requestId,
    requestMethod,
    requestPath,
    requestParams,
    requestHeaders,
    requestBody,
  } satisfies NightbearRequest);

  return new Response('Hello, world!');
};
