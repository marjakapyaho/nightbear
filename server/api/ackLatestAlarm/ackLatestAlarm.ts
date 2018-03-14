import { extend } from 'lodash';
import { Response, Context, createResponse, Request } from '../../models/api';
import { Alarm, Profile } from '../../models/model';
import { MIN_IN_MS } from '../../core/calculations/calculations';
import { ackPushoverAlarms } from '../../utils/pushover';

export function ackLatestAlarm(_request: Request, context: Context): Response {
  const latestActiveAlarm: Alarm = getLatestAlarms(context.timestamp());
  const profile: Profile = getProfileSettings(context.timestamp());

  if (!latestActiveAlarm) {
    return createResponse();
  }

  const snoozeTime = profile.alarmSettings[latestActiveAlarm.situationType].snoozeMinutes;

  const updatedAlarm = extend(latestActiveAlarm, {
    validAfterTimestamp: context.timestamp() + snoozeTime * MIN_IN_MS,
    alarmLevel: 1,
  });

  return ackPushoverAlarms(updatedAlarm.pushoverReceipts)
    .then(() => context.storage.saveModel(extend(updatedAlarm, { pushoverReceipts: [] })))
    .then(() => createResponse());
}

export function getProfileSettings(timestamp: number): Profile {
  // TODO: use timestamp to get profile
  console.log(timestamp); // tslint:disable-line:no-console
  return {
    modelType: 'Profile',
    profileName: 'night',
    activatedAtUtc: {
      hours: 1,
      minutes: 20,
    },
    analyserSettings: {
      HIGH_LEVEL_REL: 6,
      TIME_SINCE_BG_LIMIT: 5,
      BATTERY_LIMIT: 2,
      LOW_LEVEL_ABS: 7,
      ALARM_EXPIRE: 6,
      LOW_LEVEL_REL: 8,
      HIGH_LEVEL_ABS: 3,
      ALARM_RETRY: 3,
    },
    alarmSettings: {
      OUTDATED: {
        escalationAfterMinutes: [2, 5, 7, 4],
        snoozeMinutes: 10,
      },
      HIGH: {
        escalationAfterMinutes: [2, 5, 7, 4],
        snoozeMinutes: 10,
      },
      PERSISTENT_HIGH: {
        escalationAfterMinutes: [2, 5, 7, 4],
        snoozeMinutes: 10,
      },
      LOW: {
        escalationAfterMinutes: [2, 5, 7, 4],
        snoozeMinutes: 10,
      },
      FALLING: {
        escalationAfterMinutes: [2, 5, 7, 4],
        snoozeMinutes: 10,
      },
      RISING: {
        escalationAfterMinutes: [2, 5, 7, 4],
        snoozeMinutes: 10,
      },
      BATTERY: {
        escalationAfterMinutes: [2, 5, 7, 4],
        snoozeMinutes: 10,
      },
      COMPRESSION_LOW: {
        escalationAfterMinutes: [2, 5, 7, 4],
        snoozeMinutes: 10,
      },
    },
    pushoverLevels: [],
  };
}

export function getLatestAlarms(timestamp: number): Alarm {
  // TODO: use timestamp to get active alarms
  console.log(timestamp);
  return {
    modelType: 'Alarm',
    creationTimestamp: 324234324,
    validAfterTimestamp: 234432423,
    alarmLevel: 1,
    situationType: 'PERSISTENT_HIGH',
    isActive: true,
    pushoverReceipts: [],
  };
}
