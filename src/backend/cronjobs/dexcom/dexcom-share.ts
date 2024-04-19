import { MIN_IN_MS } from 'shared/utils/calculations';
import { getTimeAsISOStr, getTimeInMillis, humanReadableLongTime, isTimeAfter } from 'shared/utils/time';
import { first, isArray } from 'lodash';
import { Cronjob } from 'backend/utils/cronjobs';
import { DexcomShareResponse } from 'backend/cronjobs/dexcom/dexcom-share-client';
import { mapDexcomShareResponseToSensorEntry } from 'backend/cronjobs/dexcom/dexcom-share-utils';
import { CronjobsJournal } from 'backend/db/cronjobsJournal/types';
import { Context } from 'backend/utils/api';
import { SensorEntry } from 'shared/types/timelineEntries';

export const dexcomShare: Cronjob = (context, journal) => {
  const { log, dexcomShare, config } = context;
  const { dexcomShareSessionId, dexcomShareLoginAttemptAt } = journal;
  const dexcomShareLoginAttemptTimestamp = dexcomShareLoginAttemptAt && getTimeInMillis(dexcomShareLoginAttemptAt);
  const mins = config.DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES || 60;
  const loginAttemptAllowed =
    !dexcomShareLoginAttemptTimestamp || isTimeAfter(Date.now() - dexcomShareLoginAttemptTimestamp, MIN_IN_MS * mins);
  return Promise.resolve();
  /*    .then(() => {
    if (dexcomShareSessionId) {
      return Promise.resolve()
        .then(() => context.db.sensorEntries.getPreviousEntry())
        .then(previousBg => {
          if (previousBg) {
            const ageInMin = (Date.now() - getTimeInMillis(previousBg.timestamp)) / MIN_IN_MS;
            const ageModulo = ageInMin % 5;
            const willFetch =
              ageModulo > 0.35 && // new BG's aren't visible on Dexcom Share immediately -> give it a bit of time
              ageModulo < 1.75 && // not within the time window where new BG's appear -> no point in fetching until a new one may be available again
              ageInMin >= 4.5; // our fetch window is slightly larger than 1 minute, to ensure slight scheduling wobble of the cronjob doesn't cause fetches to be skipped -> need a mechanism for preventing the opposite (i.e. unnecessary consecutive fetches)
            log(`Time since last BG is ${ageInMin.toFixed(1)} min -> ${willFetch ? 'WILL' : "won't"} fetch BG`);
            if (!willFetch) return;
          }
          return dexcomShare.fetchBg(dexcomShareSessionId).then(
            res => {
              const model = parseIncomingBg(res);
              const lagInMin = (Date.now() - getTimeInMillis(model.timestamp)) / MIN_IN_MS;
              log(`BG lag is ${lagInMin.toFixed(1)} min (may include clock drift!)`);
              return saveIncomingBg(context, model);
            },
            err => {
              log(`Could not fetch BG (caused by\n${err}\n), will mark the session as needing refresh`);
              return { dexcomShareSessionId: null } as Partial<CronjobsJournal>;
            },
          );
        });
    } else {
      if (loginAttemptAllowed) {
        log('No session, will attempt login');
        return dexcomShare.login().then(
          dexcomShareSessionId => {
            log('Login was successful, BG will be fetched on the next round');
            return { dexcomShareSessionId, dexcomShareLoginAttemptTimestamp: Date.now() };
          },
          err => {
            log(`Login attempt failed (caused by\n${err}\n)`);
            return { dexcomShareLoginAttemptTimestamp: Date.now() };
          },
        );
      } else {
        const readableTime = dexcomShareLoginAttemptTimestamp
          ? humanReadableLongTime(getTimeAsISOStr(dexcomShareLoginAttemptTimestamp))
          : 'n/a';
        log(`No session, will NOT attempt login, last attempt was at ${readableTime}, too soon (under ${mins} min)`);
      }
    }
  });*/
};

function parseIncomingBg(res: DexcomShareResponse[]) {
  if (!isArray(res)) throw new Error(`Unexpected response payload: ${typeof res}`);
  if (res.length !== 1) throw new Error(`Unexpected response length: ${res.length}`);
  const [val] = res;
  return mapDexcomShareResponseToSensorEntry(val);
}

const saveIncomingBg = (context: Context, entry: SensorEntry) => {
  const { log } = context;
  const desc = `BG ${entry.bloodGlucose}, timestamp ${humanReadableLongTime(entry.timestamp)}`;
  return Promise.resolve()
    .then(() => context.db.sensorEntries.byTimestamp({ from: entry.timestamp, to: entry.timestamp }))
    .then(entries => first(entries))
    .then(existingEntry => {
      if (existingEntry) {
        // Already exists in the DB -> no need to do anything!
        log(`This ${existingEntry.timestamp} already exists: ${desc}`);
      } else {
        // We didn't find the entry yet -> create it
        return context.db.sensorEntries.create(entry);
      }
    })
    .then(() => log(`Saved new SensorEntry: ${desc}`));
};
