import { changeBloodGlucoseUnitToMmoll, HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import { DexcomG6ShareEntry } from 'core/models/model';
import { generateUuid } from 'core/utils/id';
import { extendLogger } from 'core/utils/logging';
import { isArray } from 'lodash';

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
        const model: DexcomG6ShareEntry = {
          modelType: 'DexcomG6ShareEntry',
          modelUuid: generateUuid(),
          timestamp: parseInt(val.WT.replace(/.*Date\(([0-9]+).*/, '$1'), 10), // e.g. "/Date(1587217854000)/" => 1587217854000
          bloodGlucose: changeBloodGlucoseUnitToMmoll(val.Value),
          trend: val.Trend,
        };
        log(
          `BG is ${model.bloodGlucose}, trend is ${model.trend}, timestamp is ${new Date(
            model.timestamp,
          ).toISOString()}`,
        );
      })
      .catch(err => {
        log(`Could not fetch BG (caused by\n${err}\n)`);
      });
  }
}
