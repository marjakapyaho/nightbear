import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import { extendLogger } from 'core/utils/logging';
import { activateProfilesIfNeeded } from 'server/cronjobs/profile-activation';
import { runChecks } from 'server/main/check-runner';
import { CronjobsJournal } from 'server/cronjobs/cronjobs-journal';

// Executes a SINGLE RUN of our periodic jobs.
// Not all jobs necessarily run every time.
export function runCronjobs(context: Context, journal: CronjobsJournal) {
  const log = extendLogger(context.log, 'cron');
  const now = Date.now();
  return Promise.resolve()
    .then(() => journal.getPreviousExecutionTime())
    .then(then => {
      log(`Running, ${((now - then) / MIN_IN_MS).toFixed(1)} min since last run`);
      runChecks(context).catch(err => context.log(`Running checks failed (caused by\n${err}\n)`));
      activateProfilesIfNeeded(context, then, now).catch(err =>
        context.log(`Profiles activation failed (caused by\n${err}\n)`),
      );
      return journal.setPreviousExecutionTime(now);
    });
}
