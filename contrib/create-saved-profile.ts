import { SavedProfile } from 'core/models/model';
import { generateUuid } from 'core/utils/id';
import { createCouchDbStorage } from 'core/storage/couchDbStorage';

const storage = createCouchDbStorage(process.env.NIGHTBEAR_DB_URL || '');

Promise.resolve()
  .then(() => getProfile('OFF'))
  .then(storage.saveModel)
  .then(
    res => console.log('SUCCESS', res),
    err => console.log('ERROR', err),
  );

function getProfile(profileName: string): SavedProfile {
  return {
    modelType: 'SavedProfile',
    modelUuid: generateUuid(),
    profileName,
    alarmsEnabled: false,
    analyserSettings: {
      HIGH_LEVEL_REL: 0,
      TIME_SINCE_BG_LIMIT: 0,
      BATTERY_LIMIT: 0,
      LOW_LEVEL_ABS: 0,
      ALARM_EXPIRE: 0,
      LOW_LEVEL_REL: 0,
      LOW_LEVEL_BAD: 0,
      HIGH_LEVEL_ABS: 0,
      HIGH_LEVEL_BAD: 0,
      ALARM_RETRY: 0,
      HIGH_CORRECTION_SUPPRESSION_WINDOW: 0,
    },
    alarmSettings: {
      OUTDATED: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
      HIGH: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
      BAD_HIGH: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
      PERSISTENT_HIGH: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
      LOW: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
      BAD_LOW: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
      FALLING: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
      RISING: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
      BATTERY: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
      COMPRESSION_LOW: {
        escalationAfterMinutes: [],
        snoozeMinutes: 0,
      },
    },
    pushoverLevels: [],
  };
}
