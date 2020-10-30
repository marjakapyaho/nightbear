import { MIN_IN_MS } from 'core/calculations/calculations';
import { createNodeContext } from 'core/models/api';
import { consoleLogStream } from 'core/utils/logging';
import { TZ } from 'core/utils/time';
import debug from 'debug';
import { DateTime } from 'luxon';
import { ackActiveAlarms } from 'server/api/ackActiveAlarms/ackActiveAlarms';
import { calculateHba1cForDate } from 'server/api/calculateHba1c/calculateHba1c';
import { getEntries } from 'server/api/getEntries/getEntries';
import { getHba1cHistory } from 'server/api/getHba1cHistory/getHba1cHistory';
import { getServerStatus } from 'server/api/getServerStatus/getServerStatus';
import { getWatchStatus } from 'server/api/getWatchStatus/getWatchStatus';
import { uploadDexcomEntry } from 'server/api/uploadDexcomEntry/uploadDexcomEntry';
import { uploadParakeetEntry } from 'server/api/uploadParakeetEntry/uploadParakeetEntry';
import { runCronjobs } from 'server/cronjobs';
import { startDexcomSharePolling } from 'server/cronjobs/dexcom-share';
import { startExpressServer } from 'server/main/express';

// Direct log output to where we want it
debug.log = consoleLogStream;

// Create application runtime context
const context = createNodeContext();

// Start serving API requests
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
    context.log(`Server listening on ${port}`);
  },
  err => context.log(`Server error: ${err.message}`, err),
);

// Start running periodic tasks
context.log(`System timezone is "${DateTime.local().zoneName}", app timezone is "${TZ}"`);
const run = () => runCronjobs(context);
setInterval(run, 2 * MIN_IN_MS);
run();

// Start experimental Dexcom Share integration
startDexcomSharePolling(context);
