import { createNodeContext } from 'core/models/api';
import { extendLogger, consoleLogStream } from 'core/utils/logging';
import debug from 'debug';
import { ackActiveAlarms } from 'server/api/ackActiveAlarms/ackActiveAlarms';
import { calculateHba1cForDate } from 'server/api/calculateHba1c/calculateHba1c';
import { getEntries } from 'server/api/getEntries/getEntries';
import { getHba1cHistory } from 'server/api/getHba1cHistory/getHba1cHistory';
import { getServerStatus } from 'server/api/getServerStatus/getServerStatus';
import { getWatchStatus } from 'server/api/getWatchStatus/getWatchStatus';
import { uploadDexcomEntry } from 'server/api/uploadDexcomEntry/uploadDexcomEntry';
import { uploadParakeetEntry } from 'server/api/uploadParakeetEntry/uploadParakeetEntry';
import { startRunningChecks } from 'server/main/check-runner';
import { startExpressServer } from 'server/main/express';
import { startAutomaticProfileActivation } from 'server/main/profile-activation';

debug.enable('*');
debug.log = consoleLogStream;

const context = createNodeContext();
const log = extendLogger(context.log, 'server');

startExpressServer(
  context,
  ['post', '/ack-latest-alarm', ackActiveAlarms],
  ['get', '/calculate-hba1c', calculateHba1cForDate],
  ['get', '/get-entries', getEntries],
  ['get', '/get-hba1c-history', getHba1cHistory],
  ['get', '/get-server-status', getServerStatus],
  ['get', '/get-watch-status', getWatchStatus],
  ['post', '/upload-dexcom-entry', uploadDexcomEntry],
  ['get', '/upload-parakeet-entry', uploadParakeetEntry],
).then(
  port => {
    log(`Server listening on ${port}`);
  },
  err => log(`Server error: ${err.message}`, err),
);

startRunningChecks(context);
startAutomaticProfileActivation(context);
