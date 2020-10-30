import { Context } from 'core/models/api';
import { TZ } from 'core/utils/time';
import { DateTime } from 'luxon';
import { MIN_IN_MS } from 'core/calculations/calculations';
import { extendLogger } from 'core/utils/logging';

const CRONJOBS_EVERY_MINUTES = 2;

export type Cronjob = (context: Context, executionTimestamps: { then: number; now: number }) => Promise<unknown>;

export function startRunningCronjobs(context: Context, ...cronjobs: Cronjob[]) {
  const log = extendLogger(context.log, 'cron');
  log(`System timezone is "${DateTime.local().zoneName}", app timezone is "${TZ}"`);
  const run = () => {
    const now = Date.now();
    return Promise.resolve()
      .then(() => context.cronjobsJournal.getPreviousExecutionTime())
      .then(then => {
        log(`Running, ${((now - then) / MIN_IN_MS).toFixed(1)} min since last run`);
        // TODO
        return context.cronjobsJournal.setPreviousExecutionTime(now);
      });
  };
  setInterval(run, CRONJOBS_EVERY_MINUTES * MIN_IN_MS);
  run();
}
