declare var lambda: any;

import { proxyRequest, DEFAULT_TIMEOUT } from './utils/proxy';
import { normalizeIncomingRequest } from './utils/lambda';
import { rewriteIncomingUrl } from './utils/rewrite';

const { NIGHTBEAR_ROUTER_CONFIG, NIGHTBEAR_ROUTER_LOG_DEBUG, NIGHTBEAR_ROUTER_LOG_INFO, NIGHTBEAR_ROUTER_PROXIED_HEADERS, NIGHTBEAR_ROUTER_TIMEOUT } = process.env;
const proxiedHeaders = (NIGHTBEAR_ROUTER_PROXIED_HEADERS || '').split(' ');
const timeoutAfter = NIGHTBEAR_ROUTER_TIMEOUT ? parseInt(NIGHTBEAR_ROUTER_TIMEOUT, 10) : DEFAULT_TIMEOUT;
const config = NIGHTBEAR_ROUTER_CONFIG ? JSON.parse(NIGHTBEAR_ROUTER_CONFIG) : {};

logDebug({ config, env: process.env });

lambda.handler = (event: any, context: any, callback: any) => {

  logDebug({ event, context });

  const request = normalizeIncomingRequest(event);
  const urls = rewriteIncomingUrl(config, request.requestPath);

  proxyRequest(request, urls, proxiedHeaders, timeoutAfter).then(
    res => {
      if (urls.length) {
        urls.forEach(url => {
          logInfo(`${request.requestMethod} ${request.requestPath} => ${url} => ${res[url].status || ''} ${res[url].statusText}`);
        });
      } else {
        logInfo(`${request.requestMethod} ${request.requestPath} => NO-OP`);
      }
      logDebug({ incoming: request.requestPath, outgoing: res });
      callback(null, { statusCode: 200 });
    },
    err => {
      logInfo({ error: err });
      callback(null, { statusCode: 500 });
    },
  );

};

function logDebug(data: string | object): void {
  if (NIGHTBEAR_ROUTER_LOG_DEBUG) {
    // tslint:disable-next-line:no-console
    console.log('nightbear-router: debug:', typeof data === 'string' ? data : JSON.stringify(data, null, 4));
  }
}

function logInfo(data: string | object): void {
  if (NIGHTBEAR_ROUTER_LOG_INFO) {
    // tslint:disable-next-line:no-console
    console.log('nightbear-router: info:', typeof data === 'string' ? data : JSON.stringify(data, null, 4));
  }
}
