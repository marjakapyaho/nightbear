import { ackActiveAlarm, getActiveAlarm } from './api/alarms/handler';
import { activateProfile, createProfile, editProfile, getProfiles } from './api/profiles/handler';
import { getTimelineEntries, updateTimelineEntries } from './api/timelineEntries/handler';
import { checks } from './cronjobs/checks/checks';
import { devDataImport } from './cronjobs/devDataImport/devDataImport';
import { dexcomShare } from './cronjobs/dexcom/dexcomShare';
import { profiles } from './cronjobs/profiles/profiles';
import { startCronJobs } from './utils/cronjobs';
import { startExpressServer } from './utils/express';
import { consoleLogStream } from './utils/logging';
import debug from 'debug';
import { createNodeContext } from './utils/api';

// Direct log output to where we want it
debug.log = consoleLogStream;

// Create application runtime context
const context = createNodeContext();

// Start serving API requests
startExpressServer(
  context,
  ['get', '/get-active-alarm', getActiveAlarm],
  ['put', '/ack-active-alarm', ackActiveAlarm],
  ['get', '/get-profiles', getProfiles],
  ['post', '/create-profile', createProfile],
  ['put', '/edit-profile', editProfile],
  ['post', '/activate-profile', activateProfile],
  ['get', '/get-timeline-entries', getTimelineEntries],
  ['put', '/update-timeline-entries', updateTimelineEntries],
);

// Start running periodic tasks
startCronJobs(context, {
  dexcomShare, // run this before checks()
  profiles,
  devDataImport,
  checks, // run this after dexcomShare()
});
