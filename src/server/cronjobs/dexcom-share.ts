import { HOUR_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import { DexcomG6ShareEntry, CronjobsJournal } from 'core/models/model';
import { first, isArray } from 'lodash';
import { parseDexcomG6ShareEntryFromRequest } from 'server/share/dexcom-share-utils';
import { Cronjob } from 'server/main/cronjobs';
import { humanReadableLongTime } from 'core/utils/time';
import { DexcomShareBgResponse } from 'server/share/dexcom-share-client';

export const dexcomShare: Cronjob = (context, journal) => {
  const { log, dexcomShare } = context;
  const { dexcomShareSessionId, dexcomShareLoginAttemptTimestamp } = journal;
  const loginAttemptAllowed =
    !dexcomShareLoginAttemptTimestamp || Date.now() - dexcomShareLoginAttemptTimestamp > HOUR_IN_MS;
  return Promise.resolve().then(() => {
    if (dexcomShareSessionId) {
      log('Will fetch BG');
      return dexcomShare.fetchBg(dexcomShareSessionId).then(
        res => {
          log('Successfully fetched BG');
          const model = parseIncomingBg(res);
          return saveIncomingBg(context, model);
        },
        err => {
          log(`Could not fetch BG (caused by\n${err}\n), will mark the session as needing refresh`);
          return { dexcomShareSessionId: null } as Partial<CronjobsJournal>;
        },
      );
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
          ? humanReadableLongTime(dexcomShareLoginAttemptTimestamp)
          : 'n/a';
        log(`No session, will NOT attempt login, last attempt was at ${readableTime}, too soon`);
      }
    }
  });
};

function parseIncomingBg(res: DexcomShareBgResponse[]) {
  if (!isArray(res)) throw new Error(`Unexpected response payload: ${typeof res}`);
  if (res.length !== 1) throw new Error(`Unexpected response length: ${res.length}`);
  const [val] = res;
  return parseDexcomG6ShareEntryFromRequest(val);
}

function saveIncomingBg(context: Context, model: DexcomG6ShareEntry) {
  const { log, storage } = context;
  log(`BG is ${model.bloodGlucose}, trend is ${model.trend}, timestamp is ${humanReadableLongTime(model.timestamp)}`);
  return Promise.resolve()
    .then(() => storage.loadTimelineModels(['DexcomG6ShareEntry'], 0, model.timestamp)) // see if we can find an entry of the same type that already exists with this exact timestamp
    .then(entries => first(entries))
    .then(existingEntry => {
      if (existingEntry) {
        // Already exists in the DB -> no need to do anything!
        log(`This ${existingEntry.modelType} already exists in DB`);
      } else {
        // We didn't find the entry yet -> create it
        return storage.saveModel(model);
      }
    })
    .then(() => log(`Saved new ${model.modelType} to DB`));
}
