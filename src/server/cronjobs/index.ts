import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import { extendLogger } from 'core/utils/logging';
import { runChecks } from 'server/main/check-runner';

// Executes a SINGLE RUN of our periodic jobs.
// Not all jobs necessarily run every time.
export function runCronjobs(context: Context) {
  const log = extendLogger(context.log, 'cron');
  const journal = context.cronjobsJournal;
  const now = Date.now();
  return Promise.resolve()
    .then(() => journal.getPreviousExecutionTime())
    .then(then => {
      log(`Running, ${((now - then) / MIN_IN_MS).toFixed(1)} min since last run`);
      runChecks(context).catch(err => context.log(`Running checks failed (caused by\n${err}\n)`));
      return journal.setPreviousExecutionTime(now);
    });
}
