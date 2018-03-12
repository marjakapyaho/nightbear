import { startExpressServer } from './main/express';
import { createNodeContext } from './models/api';
import { getServerStatus } from './api/getServerStatus/getServerStatus';
import { uploadParakeetEntry } from './api/uploadParakeetEntry/uploadParakeetEntry';

const context = createNodeContext();

startExpressServer(
  context,
  [ 'get', '/status', getServerStatus ],
  [ 'get', '/upload-parakeet-entry', uploadParakeetEntry ],
).then(
  port => context.log.info(`Nightbear Server listening on ${port}`),
  err => context.log.error(`Nightbear Server Error: ${err.message}`, err),
);
