import { MIN_IN_MS } from 'core/calculations/calculations';
import { createNodeContext } from 'core/models/api';
import { consoleLogStream } from 'core/utils/logging';
import debug from 'debug';
import { ackActiveAlarms } from 'server/api/ackActiveAlarms/ackActiveAlarms';
import { calculateHba1cForDate } from 'server/api/calculateHba1c/calculateHba1c';
import { getEntries } from 'server/api/getEntries/getEntries';
import { getHba1cHistory } from 'server/api/getHba1cHistory/getHba1cHistory';
import { getServerStatus } from 'server/api/getServerStatus/getServerStatus';
import { getWatchStatus } from 'server/api/getWatchStatus/getWatchStatus';
import { uploadDexcomEntry } from 'server/api/uploadDexcomEntry/uploadDexcomEntry';
import { uploadParakeetEntry } from 'server/api/uploadParakeetEntry/uploadParakeetEntry';
import { createFilesystemJournal, runCronjobs } from 'server/main/cronjobs';
import { startExpressServer } from 'server/main/express';
import { startAutomaticProfileActivation } from 'server/main/profile-activation';
import { DateTime } from 'luxon';

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
context.log(`Server timezone is "${DateTime.local().zoneName}"`);
const journal = createFilesystemJournal('.nightbear-cronjobs-journal');
const run = () => runCronjobs(context, journal);
setInterval(run, 2 * MIN_IN_MS);
run();

// Run legacy cronjobs
startAutomaticProfileActivation(context);
