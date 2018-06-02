import { startExpressServer } from 'server/main/express';
import { createNodeContext } from 'server/models/api';
import { getServerStatus } from 'server/api/getServerStatus/getServerStatus';
import { uploadParakeetEntry } from 'server/api/uploadParakeetEntry/uploadParakeetEntry';
import { uploadDexcomEntry } from 'server/api/uploadDexcomEntry/uploadDexcomEntry';
import { getEntries } from 'server/api/getEntries/getEntries';
import { getWatchStatus } from 'server/api/getWatchStatus/getWatchStatus';
import { getHba1cHistory } from 'server/api/getHba1cHistory/getHba1cHistory';
import { ackLatestAlarm } from 'server/api/ackLatestAlarm/ackLatestAlarm';
import { uploadEntries } from 'server/api/uploadEntries/uploadEntries';

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
