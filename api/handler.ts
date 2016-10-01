// see https://www.npmjs.com/package/dotenv
// see https://www.npmjs.com/package/serverless-plugin-write-env-vars
require('dotenv').config();

import { setUpRequestHandlers } from './utils/lambda';

import status from './functions/status';

setUpRequestHandlers(module.exports, {
  status,
});
