import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import { DexcomG6ShareEntry } from 'core/models/model';
import { extendLogger } from 'core/utils/logging';
import { first, isArray } from 'lodash';
import { parseDexcomG6ShareEntryFromRequest } from 'server/share/dexcom-share-utils';

export function startDexcomSharePolling(context: Context) {
  const log = extendLogger(context.log, 'dexcom-share');
  let sessionId: Promise<string>;

  refreshSessionId();
  setInterval(refreshSessionId, HOUR_IN_MS);

  fetchBg();
  setInterval(fetchBg, 5 * MIN_IN_MS);

  return;

  function refreshSessionId() {
    sessionId = context.dexcomShare.login().then(
      sessionId => {
        log(`Successfully refreshed session ID ("${sessionId}")`);
        return sessionId;
      },
      err => {
        const msg = `Could not refresh session ID (caused by\n${err}\n)`;
        log(msg);
        throw new Error(msg);
      },
    );
  }

  function fetchBg() {
    sessionId
      .then(context.dexcomShare.fetchBg)
      .then(res => {
        if (!isArray(res)) throw new Error(`Unexpected response payload: ${typeof res}`);
        if (res.length !== 1) throw new Error(`Unexpected response length: ${res.length}`);
        const [val] = res;
        const model: DexcomG6ShareEntry = parseDexcomG6ShareEntryFromRequest(val);
        log(
          `BG is ${model.bloodGlucose}, trend is ${model.trend}, timestamp is ${new Date(
            model.timestamp,
          ).toISOString()}`,
        );
        return Promise.resolve()
          .then(() => context.storage.loadTimelineModels(['DexcomG6ShareEntry'], 0, model.timestamp)) // see if we can find an entry of the same type that already exists with this exact timestamp
          .then(entries => first(entries))
          .then(existingEntry => {
            if (existingEntry) {
              // Already exists in the DB -> no need to do anything!
              log(`This ${existingEntry.modelType} already exists in DB`);
            } else {
              // We didn't find the entry yet -> create it
              return context.storage.saveModel(model);
            }
          })
          .then(() => log(`Saved new ${model.modelType} to DB`));
      })
      .catch(err => {
        log(`Could not fetch BG (caused by\n${err}\n)`);
      });
  }
}
