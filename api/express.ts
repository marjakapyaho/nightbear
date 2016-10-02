import { setUpRequestHandlers } from './utils/express';

import status from './functions/status';
import test from './functions/test';

setUpRequestHandlers(
  [ 'get',  '/status', status ],
  [ 'get',  '/test',   test ],
  [ 'post', '/test',   test ],
);
