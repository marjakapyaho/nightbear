import { readFileSync, writeFileSync } from 'fs';

// Simple API for keeping track of when the cronjobs were last executed, etc
export type CronjobsJournal = {
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
