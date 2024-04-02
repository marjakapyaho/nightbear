import { createNodeContext } from 'shared/storage/api';
import { consoleLogStream } from 'shared/utils/logging';
import debug from 'debug';
import { ackActiveAlarms } from 'backend/api/ackActiveAlarms/ackActiveAlarms';
import { getEntries } from 'backend/api/getEntries/getEntries';
import { getServerStatus } from 'backend/api/getServerStatus/getServerStatus';
import { getWatchStatus } from 'backend/api/getWatchStatus/getWatchStatus';
import { uploadDexcomEntry } from 'backend/api/uploadDexcomEntry/uploadDexcomEntry';
import { uploadParakeetEntry } from 'backend/api/uploadParakeetEntry/uploadParakeetEntry';
import { dexcomShare } from 'backend/cronjobs/dexcom-share';
import { startExpressServer } from 'backend/main/express';
import { startRunningCronjobs } from 'backend/main/cronjobs';
import { profiles } from 'backend/cronjobs/profiles';
import { checks } from 'backend/cronjobs/checks';

// Direct log output to where we want it
debug.log = consoleLogStream;

// Create application runtime context
const context = createNodeContext();

// Start serving API requests
startExpressServer(
  context,
  ['post', '/ack-latest-alarm', ackActiveAlarms],
  ['get', '/get-entries', getEntries],
  ['get', '/get-server-status', getServerStatus],
  ['get', '/get-watch-status', getWatchStatus],
  ['post', '/upload-dexcom-entry', uploadDexcomEntry],
  ['get', '/upload-parakeet-entry', uploadParakeetEntry],
);

// Start running periodic tasks
startRunningCronjobs(context, {
  dexcomShare, // run this before checks()
  profiles,
  checks, // run this after dexcomShare()
});
