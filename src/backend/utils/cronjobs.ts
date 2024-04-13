import { CronjobsJournal } from 'backend/db/cronjobsJournal/types';
import { kebabCase } from 'lodash';
import { DateTime } from 'luxon';
import { SEC_IN_MS } from 'shared/utils/calculations';
import { generateUuid } from 'shared/utils/id';
import { extendLogger } from 'shared/utils/logging';
import { TZ } from 'shared/utils/time';
import { Context } from './api';

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
export const runCronJobs = async (context: Context, cronjobs: { [name: string]: Cronjob }) => {
  const log = extendLogger(context.log, 'cron');
  const now = Date.now();
  const jobNames = Object.keys(cronjobs);

  log(`System timezone is "${DateTime.local().zoneName}", app timezone is "${TZ}"`);
  log(`Running ${jobNames.length} cronjobs sequentially: ` + jobNames.join(', '));

  let [journal] = await context.db.cronjobsJournal.load();

  for (const jobName of jobNames) {
    try {
      const logger = extendLogger(context, kebabCase(jobName));
      const journalUpdates = await cronjobs[jobName](logger, journal);
      journal = { ...journal, ...journalUpdates }; // if a job provided updates to the journal, merge those in
    } catch (err) {
      context.log(`Cronjob "${jobName}" execution failed (caused by\n${err}\n)`);
    }
  }

  await context.db.cronjobsJournal.update({ ...journal, previousExecutionAt: new Date() }); // persist updated journal into DB for the next run

  log(`Finished, run took ${((Date.now() - now) / SEC_IN_MS).toFixed(1)} sec`);
};

export function getDefaultJournalContent(): unknown /* TODO: Replace with new type */ {
  return {
    modelType: 'CronjobsJournal',
    modelUuid: generateUuid(),
    previousExecutionTimestamp: null,
    dexcomShareSessionId: null,
    dexcomShareLoginAttemptTimestamp: null,
  };
}
