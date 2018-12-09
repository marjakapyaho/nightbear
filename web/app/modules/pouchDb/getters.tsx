import { isArray, isNumber, max } from 'lodash';
import { PouchDbState, PouchDbStatePart, PouchDbStatus } from 'web/app/modules/pouchDb/state';
import { assertNumber, objectKeys } from 'web/app/utils/types';

export type SummaryDbStatus = PouchDbStatus | 'REPLICATION_INITIAL' | 'REPLICATION_CATCHUP';

export function getSummaryDbStatus(
  state: PouchDbState,
): {
  summaryStatus: SummaryDbStatus;
  summaryProgress: number | null;
  summaryLastChangedAt: number;
} {
  const stateParts = objectKeys(state).map(key => state[key]);
  const summaryProgress = getSummaryReplicationProgress(stateParts);
  const summaryLastChangedAt = max(stateParts.map(p => p.lastChangedAt)) || 0;
  if (isNumber(summaryProgress)) {
    const summaryStatus =
      state.LOCAL.status === 'DISABLED' ? 'REPLICATION_INITIAL' : 'REPLICATION_CATCHUP';
    return {
      summaryStatus,
      summaryProgress,
      summaryLastChangedAt,
    };
  }
  const allStatuses = stateParts.map(p => p.status);
  const summaryStatus = getSummaryStatus(allStatuses);
  return {
    summaryStatus,
    summaryProgress,
    summaryLastChangedAt,
  };
}

function getSummaryStatus(ss: PouchDbStatus[]): SummaryDbStatus {
  if (ss.some(s => s === 'ERROR')) return 'ERROR';
  if (ss.some(s => s === 'DISABLED')) return 'DISABLED';
  if (ss.some(s => s === 'OFFLINE')) return 'OFFLINE';
  if (ss.some(s => s === 'ACTIVE')) return 'ACTIVE';
  return 'ONLINE';
}

function getSummaryReplicationProgress(
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
