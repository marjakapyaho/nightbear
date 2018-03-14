import { startExpressServer } from './main/express';
import { createNodeContext } from './models/api';
import { getServerStatus } from './api/getServerStatus/getServerStatus';
import { uploadParakeetEntry } from './api/uploadParakeetEntry/uploadParakeetEntry';
import { uploadDexcomEntry } from './api/uploadDexcomEntry/uploadDexcomEntry';
import { getEntries } from './api/getEntries/getEntries';
import { getWatchStatus } from './api/getWatchStatus/getWatchStatus';
import { getHba1cHistory } from './api/getHba1cHistory/getHba1cHistory';
import { ackLatestAlarm } from './api/ackLatestAlarm/ackLatestAlarm';
import { uploadEntries } from './api/uploadEntries/uploadEntries';

const context = createNodeContext();

startExpressServer(
  context,
  [ 'post', '/ack-latest-alarm', ackLatestAlarm ],
  [ 'get', '/get-entries', getEntries ],
  [ 'get', '/get-hba1c-history', getHba1cHistory ],
  [ 'get', '/get-server-status', getServerStatus ],
  [ 'get', '/get-watch-status', getWatchStatus ],
  [ 'post', '/upload-dexcom-entry', uploadDexcomEntry ],
  [ 'post', '/upload-entries', uploadEntries ],
  [ 'get', '/upload-parakeet-entry', uploadParakeetEntry ],
).then(
  port => context.log.info(`Nightbear Server listening on ${port}`),
  err => context.log.error(`Nightbear Server Error: ${err.message}`, err),
);
