import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import { extendLogger } from 'core/utils/logging';
import { readFileSync, writeFileSync } from 'fs';
import { activateProfilesIfNeeded } from 'server/cronjobs/profile-activation';
import { runChecks } from 'server/main/check-runner';

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

// Simple client for keeping track when the cronjobs were last executed
type CronjobsJournal = {
  getPreviousExecutionTime(): Promise<number>;
  setPreviousExecutionTime(ts: number): Promise<void>;
};

// Creates a non-persistent journal; works fine, but will miss jobs scheduled to run while the process was down (e.g. restarting)
export function createInMemoryJournal(): CronjobsJournal {
  let previousExecutionTime = Date.now();
  return {
    getPreviousExecutionTime() {
      return Promise.resolve(previousExecutionTime);
    },
    setPreviousExecutionTime(ts: number) {
      previousExecutionTime = ts;
      return Promise.resolve();
    },
  };
}

// Creates a persistent journal that tracks runs in the local filesystem.
// Won't miss jobs while process is down, but DOES require a non-ephemeral filesystem (i.e. won't work on Lambda for example).
export function createFilesystemJournal(file: string): CronjobsJournal {
  return {
    getPreviousExecutionTime() {
      try {
        const res = parseInt(readFileSync(file) + '');
        return Promise.resolve(Number.isFinite(res) ? res : Date.now());
      } catch (err) {
        return Promise.resolve(Date.now());
      }
    },
    setPreviousExecutionTime(ts: number) {
      writeFileSync(file, ts);
      return Promise.resolve();
    },
  };
}
