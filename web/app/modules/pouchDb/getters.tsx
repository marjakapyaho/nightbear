import { PouchDbStatus, PouchDbStatePart, PouchDbState } from 'web/app/modules/pouchDb/state';
import { isArray } from 'lodash';
import { assertNumber } from 'web/app/utils/types';

export function getSummaryDbStatus(states: PouchDbStatus[]): PouchDbStatus {
  if (states.some(s => s === 'ERROR')) return 'ERROR';
  if (states.some(s => s === 'DISABLED')) return 'DISABLED';
  if (states.some(s => s === 'OFFLINE')) return 'OFFLINE';
  if (states.some(s => s === 'ACTIVE')) return 'ACTIVE';
  return 'ONLINE';
}

export function getSummaryReplicationProgress(
  parts: Array<PouchDbState[PouchDbStatePart]>,
): number | null {
  const tally = (index: 0 | 1) =>
    parts.reduce(
      (memo, next) => memo + ((isArray(next.details) && assertNumber(next.details[index])) || 0),
      0,
    );
  const done = tally(0);
  const todo = tally(1);
  if (todo > 0) return Math.round((100 * done) / todo);
  return null;
}
