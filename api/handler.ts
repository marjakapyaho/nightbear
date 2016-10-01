// see https://www.npmjs.com/package/dotenv
// see https://www.npmjs.com/package/serverless-plugin-write-env-vars
require('dotenv').config();

import status from './status';

module.exports.status = (event, context, cb) => {
  Promise.resolve({
    requestId: context.awsRequestId,
    requestMethod: event.method,
    requestParams: event.query,
    requestBody: event.body,
    requestEnv: process.env,
  })
    .then(status)
    .then(
      res => cb(null, res),
      err => cb(new Error(`[500] Nightbear API Error (requestId=${context.awsRequestId})`)) // see https://serverless.com/framework/docs/providers/aws/events/apigateway/#status-codes
    );
};
