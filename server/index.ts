import { startExpressServer } from './utils/express';
import { createNodeContext } from './utils/api';
import { getServerStatus } from './api/getServerStatus';

const context = createNodeContext();

startExpressServer(
  context,
  [ 'get', '/status', getServerStatus ],
).then(
  port => context.log.info(`Nightbear Server listening on ${port}`),
  err => context.log.error(`Nightbear Server Error: ${err.message}`, err),
);
