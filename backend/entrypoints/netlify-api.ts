import type { Context as NetlifyContext } from '@netlify/functions'
import debug from 'debug'
import _ from 'lodash'
import routes from '../api/routes'
import { Request as NightbearRequest, createNodeContext } from '../utils/api'
import { handlerWithLogging } from '../utils/express'
import { consoleLogStream, extendLogger } from '../utils/logging'

debug.log = consoleLogStream // direct log output to where we want it

const context = createNodeContext() // create application runtime context
const prefix = '/api' // this is the public path under which our API routing is mounted
const log = extendLogger(context.log, 'http')

/**
 * Handles an incoming Netlify API request.
 */
export default async (netlifyRequest: Request, netlifyContext: NetlifyContext) => {
  const req = await normalizeRequest(netlifyRequest, netlifyContext)

  if (Boolean(req)) {
    // TODO: Add support for API key
    return new Response(`Unauthorized`, {
      status: 401,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  if (!req.requestPath.startsWith(prefix)) {
    return new Response(`Request path doesn't match API route prefix "${prefix}"`, {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const reqMethod = req.requestMethod.toLowerCase()
  const reqPath = req.requestPath.substring(prefix.length)
  const handler = _.last(routes.find(([method, path]) => method === reqMethod && path === reqPath))

  if (_.isFunction(handler)) {
    const res = await handlerWithLogging(handler, log)(req, context)
    return new Response(JSON.stringify(res.responseBody, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } else {
    const err = `No API route matching method "${reqMethod}" and path "${reqPath}"`
    log(err)
    return new Response(err, {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

/**
 * Converts from the Request/Context that Netlify uses to our internal format.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Request
 */
const normalizeRequest = async (
  netlifyRequest: Request,
  netlifyContext: NetlifyContext,
): Promise<NightbearRequest> => {
  const requestUrl = new URL(netlifyRequest.url)

  const requestHeaders: { [key: string]: string } = {}
  netlifyRequest.headers.forEach((value, key) => {
    requestHeaders[key] = value
  })

  const requestParams: { [param: string]: string } = {}
  requestUrl.searchParams.forEach((value, key) => {
    requestParams[key] = value
  })

  let requestBody: object | string = {}
  if (netlifyRequest.method !== 'GET' && netlifyRequest.method !== 'HEAD') {
    const contentType = netlifyRequest.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      requestBody = await netlifyRequest.json()
    } else {
      requestBody = await netlifyRequest.text()
    }
  }

  return {
    requestId: netlifyContext.requestId,
    requestMethod: netlifyRequest.method,
    requestPath: requestUrl.pathname,
    requestParams,
    requestHeaders,
    requestBody,
  }
}
