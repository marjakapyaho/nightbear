import { getProfiles } from 'api/profiles/handler';
import { RequestHandlerTuple } from '../utils/express';
import { ackActiveAlarm, getActiveAlarm } from './alarms/handler';
import { activateProfile, createProfile, editProfile } from './profiles/handler';
import { getTimelineEntries, updateTimelineEntries } from './timelineEntries/handler';

export default [
  ['get', '/get-active-alarm', getActiveAlarm],
  ['put', '/ack-active-alarm', ackActiveAlarm],
  ['get', '/get-profiles', getProfiles],
  ['post', '/create-profile', createProfile],
  ['put', '/edit-profile', editProfile],
  ['post', '/activate-profile', activateProfile],
  ['get', '/get-timeline-entries', getTimelineEntries],
  ['put', '/update-timeline-entries', updateTimelineEntries],
] satisfies RequestHandlerTuple[];
