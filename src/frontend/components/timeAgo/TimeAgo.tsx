import React, { useLayoutEffect, useState } from 'react';
import { getFormattedTs } from './timeAgoUtils';
import { getTimeInMillis } from 'shared/utils/time';

type Props = {
  timestamp: string;
  verbose?: boolean;
  frequentUpdates?: boolean;
  decimalsForMinutes?: boolean;
};

export const TimeAgo = ({ timestamp, verbose, frequentUpdates, decimalsForMinutes }: Props) => {
  const ts = getTimeInMillis(timestamp);
  const [formattedTs, setFormattedTs] = useState(getFormattedTs(ts));

  // We opt for useLayoutEffect() instead of useEffect() here so that we get a synchronous re-render when ts changes
  // for an already-mounted component. Otherwise, the updated content goes out in a subsequent flush, and you may VERY briefly see the old value.
  // https://reactjs.org/docs/hooks-reference.html#uselayouteffect
  useLayoutEffect(() => {
    const update = () => setFormattedTs(getFormattedTs(ts, verbose, decimalsForMinutes));
    const interval = setInterval(update, frequentUpdates ? 1000 : 5000);
    update();
    return () => clearInterval(interval);
  }, [ts, verbose, frequentUpdates, decimalsForMinutes]);

  return <span>{formattedTs}</span>;
};
