import { Context } from 'core/models/api';
import { TZ } from 'core/utils/time';
import { DateTime } from 'luxon';
import { MIN_IN_MS, SEC_IN_MS } from 'core/calculations/calculations';
import { extendLogger } from 'core/utils/logging';
import { kebabCase } from 'lodash';
import { is } from 'core/models/utils';
import { generateUuid } from 'core/utils/id';
import { CronjobsJournal } from 'core/models/model';

const CRONJOBS_EVERY_MINUTES = 1;

export type Cronjob = (context: Context, journal: CronjobsJournal) => Promise<Partial<CronjobsJournal> | void> | void;

export function startRunningCronjobs(context: Context, cronjobs: { [name: string]: Cronjob }) {
  const log = extendLogger(context.log, 'cron');
  const jobNames = Object.keys(cronjobs);
  log(`System timezone is "${DateTime.local().zoneName}", app timezone is "${TZ}"`);
  const run = () => {
    const now = Date.now();
    return Promise.resolve()
      .then(() => context.storage.loadGlobalModels()) // TODO: Support loading by key, and not everything every time
      .then(models => models.filter(is('CronjobsJournal')))
      .then(([journal]) => {
        if (journal) return journal;
        log(`Looks like cronjobs have never run, setting up cronjobs journal`);
        return context.storage.saveModel(getDefaultJournalContent());
      })
      .then(journal => {
        log(`Running ${jobNames.length} cronjobs sequentially: ` + jobNames);
        return jobNames.reduce(
          (memo, key) =>
            memo.then(journal =>
              Promise.resolve()
                .then(() => cronjobs[key](extendLogger(context, kebabCase(key)), journal))
                .then(journalUpdates => ({ ...journal, ...journalUpdates })) // if a job provided updates to the journal, merge those in
                .catch(err => {
                  context.log(`Cronjob "${key}" execution failed (caused by\n${err}\n)`);
                  return journal;
                }),
            ),
          Promise.resolve(journal), // start with the journal loaded from the DB
        );
      })
      .then(updatedJournal => context.storage.saveModel(updatedJournal)) // persist updated journal into DB for the next run
      .then(() => log(`Finished, run took ${((Date.now() - now) / SEC_IN_MS).toFixed(1)} sec`));
  };
  setInterval(run, CRONJOBS_EVERY_MINUTES * MIN_IN_MS);
  run();
}

function getDefaultJournalContent(): CronjobsJournal {
  return {
    modelType: 'CronjobsJournal',
    modelUuid: generateUuid(),
    previousExecutionTimestamp: null,
    dexcomShareSessionId: null,
    dexcomShareLoginAttemptTimestamp: null,
  };
}
