import { Context } from 'shared/storage/api';
import { TZ } from 'shared/utils/time';
import { DateTime } from 'luxon';
import { MIN_IN_MS, SEC_IN_MS } from 'shared/calculations/calculations';
import { extendLogger } from 'shared/utils/logging';
import { kebabCase } from 'lodash';
import { is } from 'shared/models/utils';
import { generateUuid } from 'shared/utils/id';
import { CronjobsJournal } from 'shared/models/model';

const CRONJOBS_EVERY_MINUTES = 1;

export type Cronjob = (
  context: Context,
  journal: CronjobsJournal,
) => Partial<CronjobsJournal> | Promise<Partial<CronjobsJournal> | void> | void;

/**
 * The process of running Cronjobs goes like this:
 *
 * 1. We get a bunch of functions that implement the Cronjob interface
 * 1. We invoke each of them in turn
 * 1. As input, each function gets a CronjobsJournal model from the DB, saved by the previous cronjobs run
 * 1. As output, each function optionally returns updates to that CronjobsJournal model, which get merged in
 * 1. When each function has been invoked, we persist the resulting CronjobsJournal model to the DB
 * 1. We're done
 */
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
        log(`Running ${jobNames.length} cronjobs sequentially: ` + jobNames.join(', '));
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

export function getDefaultJournalContent(): CronjobsJournal {
  return {
    modelType: 'CronjobsJournal',
    modelUuid: generateUuid(),
    previousExecutionTimestamp: null,
    dexcomShareSessionId: null,
    dexcomShareLoginAttemptTimestamp: null,
  };
}
