import { DAY_IN_MS, HOUR_IN_MS } from 'core/calculations/calculations';
import { DateTime, Duration } from 'luxon';
import { useEffect, useState } from 'react';
import { useCssNs } from 'web/utils/react';

const LIVE_FORMAT_AGE_LIMIT = HOUR_IN_MS;
const FULL_FORMAT_AGE_LIMIT = DAY_IN_MS * 0.5;

type Props = { ts: number; live?: boolean };

export default (({ ts, live }) => {
  const { React } = useCssNs(module.id);
  const [formattedTs, setFormattedTs] = useState(getFormattedTs(ts));

  const fullFormattedTs = DateTime.fromMillis(ts).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => setFormattedTs(getFormattedTs(ts, live)), 1000);
    return () => clearInterval(interval);
  }, [ts, live]);

  return (
    <span className="this" title={fullFormattedTs}>
      {formattedTs}
    </span>
  );
}) as React.FC<Props>;

// @example "12:34 ago"
// @example "12:34:56"
function getFormattedTs(ts: number, live?: boolean): string {
  const liveAge = getLiveAge(ts, live);
  if (liveAge !== null) {
    return Duration.fromMillis(liveAge).toFormat("mm:ss 'ago'"); // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
  } else {
    return getFormattedTimestamp(ts);
  }
}

// Difference to current time in ms, or null if we shouldn't have a live age anymore
function getLiveAge(ts: number, live?: boolean): number | null {
  if (!live) return null;
  const delta = Date.now() - ts;
  return delta >= 0 && delta <= LIVE_FORMAT_AGE_LIMIT ? delta : null;
}

// @example "12:34:56"
export function getFormattedTimestamp(timestamp: number): string {
  const age = Date.now() - timestamp;
  if (age < FULL_FORMAT_AGE_LIMIT) {
    return DateTime.fromMillis(timestamp).toFormat('HH:mm:ss'); // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
  } else {
    return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT);
  }
}