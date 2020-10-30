import { Context } from 'core/models/api';

export type Cronjob = (context: Context, previousExecutionTime: number) => Promise<unknown>;

export function startRunningCronjobs(_context: Context, ..._cronjobs: Cronjob[]) {
  // TODO
}
