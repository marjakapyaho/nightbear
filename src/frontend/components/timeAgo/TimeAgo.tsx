import { roundTo0Decimals, roundTo1Decimals } from 'shared/calculations/calculations';
import { Duration } from 'luxon';
import React, { useLayoutEffect, useState } from 'react';

type Props = {
  ts: number;
  verbose?: boolean;
  frequentUpdates?: boolean;
  decimalsForMinutes?: boolean;
};

export default (props => {
  const [formattedTs, setFormattedTs] = useState(getFormattedTs(props.ts));

  // We opt for useLayoutEffect() instead of useEffect() here so that we get a synchronous re-render when props.ts changes
  // for an already-mounted component. Otherwise, the updated content goes out in a subsequent flush, and you may VERY briefly see the old value.
  // https://reactjs.org/docs/hooks-reference.html#uselayouteffect
  useLayoutEffect(() => {
    const update = () => setFormattedTs(getFormattedTs(props.ts, props.verbose, props.decimalsForMinutes));
    const interval = setInterval(update, props.frequentUpdates ? 1000 : 5000);
    update();
    return () => clearInterval(interval);
  }, [props.ts, props.verbose, props.frequentUpdates, props.decimalsForMinutes]);

  return <span>{formattedTs}</span>;
}) as React.FC<Props>;

// @example "15 min"
// @example "1.3 h"
// @example "1 h 15 min 30 s" (verbose)
// @example "5 days 10 h" (verbose)
function getFormattedTs(ts: number, verbose?: boolean, decimalsForMinutes?: boolean): string {
  const d = Duration.fromMillis(Date.now() - ts);
  const { days, hours, minutes, seconds } = d
    .shiftTo('days', 'hours', 'minutes', 'seconds', 'milliseconds') // we ask for the ms just so that Luxon only gives us full seconds, not fractional ones
    .toObject();
  if (verbose) {
    if (days) {
      return `${days} days ${hours} h`;
    } else if (hours) {
      return `${hours} h ${minutes} min ${seconds} s`;
    } else if (minutes) {
      return `${minutes} min ${seconds} s`;
    } else {
      return `${seconds} s`;
    }
  } else {
    if (days) {
      return roundTo1Decimals(d.shiftTo('days').days) + ' days';
    } else if (hours) {
      return roundTo1Decimals(d.shiftTo('hours').hours) + ' h';
    } else if (minutes) {
      if (decimalsForMinutes) {
        return roundTo1Decimals(d.shiftTo('minutes').minutes) + ' min';
      }
      return roundTo0Decimals(d.shiftTo('minutes').minutes) + ' min';
    } else {
      return seconds + ' s';
    }
  }
}
