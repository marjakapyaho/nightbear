import { consoleLogStream } from 'shared/utils/logging';
import debug from 'debug';
import { dexcomShare } from 'backend/cronjobs/dexcom/dexcom-share';
import { startExpressServer } from 'backend/utils/express';
import { runCronJobs, startRunningCronjobs } from 'backend/utils/cronjobs';
import { profiles } from 'backend/cronjobs/profiles/profiles';
import { checks } from 'backend/cronjobs/checks';
import { temp } from 'backend/cronjobs/temp';
import { createNodeContext } from './utils/api';

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

export async function handleLambdaEvent(
  event:
    | {
        source: 'aws.events';
        'detail-type': 'Scheduled Event';
      }
    | {
        path: string; // e.g. "/nightbear-stage-backend"
        httpMethod: string; // e.g. "GET", "POST"
        headers: Record<string, string>; // note: there's also multiValueHeaders if ever needed
        multiValueHeaders: Record<string, string[]>;
        queryStringParameters: Record<string, string>; // note: there's also multiValueQueryStringParameters if ever needed
        body: string; // e.g. stringified JSON
      },
) {
  if ('source' in event && event['detail-type'] === 'Scheduled Event') {
    console.log('Handling cron');
    await runCronJobs(context, {
      temp,
    });
  } else if ('httpMethod' in event) {
    console.log('Handling request');
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify(await context.db.cronjobsJournal.load()),
    };
  } else {
    throw new Error(`Trying to handle unknown Lambda event type`);
  }
}
