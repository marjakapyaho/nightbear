import { Context } from 'core/models/api';
import { TZ } from 'core/utils/time';
import { DateTime } from 'luxon';
import { MIN_IN_MS, SEC_IN_MS } from 'core/calculations/calculations';
import { extendLogger } from 'core/utils/logging';
import { kebabCase } from 'lodash';

const CRONJOBS_EVERY_MINUTES = 2;

export type Cronjob = (context: Context, executionTimestamps: { then: number; now: number }) => Promise<unknown>;

export function startRunningCronjobs(context: Context, cronjobs: { [name: string]: Cronjob }) {
  const log = extendLogger(context.log, 'cron');
  log(`System timezone is "${DateTime.local().zoneName}", app timezone is "${TZ}"`);
  const run = () => {
    const now = Date.now();
    return Promise.resolve()
      .then(() => context.cronjobsJournal.getPreviousExecutionTime())
      .then(then => {
        log(`Running, ${((now - then) / MIN_IN_MS).toFixed(1)} min since last run`);
        return Object.keys(cronjobs).reduce(
          (memo, key) =>
            memo
              .then(() => cronjobs[key](extendLogger(context, kebabCase(key)), { then, now }))
              .catch(err => context.log(`Cronjob execution failed (caused by\n${err}\n)`)),
          Promise.resolve<unknown>(null),
        );
      })
      .then(() => {
        log(`Finished, run took ${((Date.now() - now) / SEC_IN_MS).toFixed(1)} sec`);
        context.cronjobsJournal.setPreviousExecutionTime(now);
      });
  };
  setInterval(run, CRONJOBS_EVERY_MINUTES * MIN_IN_MS);
  run();
}
