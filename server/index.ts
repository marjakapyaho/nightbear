import { startExpressServer } from 'nightbear/server/main/express';
import { createNodeContext } from 'nightbear/server/models/api';
import { getServerStatus } from 'nightbear/server/api/getServerStatus/getServerStatus';
import { uploadParakeetEntry } from 'nightbear/server/api/uploadParakeetEntry/uploadParakeetEntry';
import { uploadDexcomEntry } from 'nightbear/server/api/uploadDexcomEntry/uploadDexcomEntry';
import { getEntries } from 'nightbear/server/api/getEntries/getEntries';
import { getWatchStatus } from 'nightbear/server/api/getWatchStatus/getWatchStatus';
import { getHba1cHistory } from 'nightbear/server/api/getHba1cHistory/getHba1cHistory';
import { ackLatestAlarm } from 'nightbear/server/api/ackLatestAlarm/ackLatestAlarm';
import { uploadEntries } from 'nightbear/server/api/uploadEntries/uploadEntries';

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
