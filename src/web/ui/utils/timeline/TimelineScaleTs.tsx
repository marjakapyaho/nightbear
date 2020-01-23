import { HOUR_IN_MS } from 'core/calculations/calculations';
import { range } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/Timeline';
import 'web/ui/utils/timeline/Timeline.scss';
import { useCssNs } from 'web/utils/react';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
};

export default (props => {
  const { React } = useCssNs('TimelineScaleTs');

  const c = props.timelineConfig;

  return (
    <div className="this">
      {range(c.flooredHourStart, c.timelineRangeEnd, HOUR_IN_MS).map(ts => (
        <div
          key={ts}
          style={{
            position: 'absolute',
            left: tsToLeft(c, ts),
            bottom: 0,
            width: HOUR_IN_MS * c.pixelsPerMs,
            borderLeft: '1px dotted gray',
            top: 0,
            display: 'flex',
            alignItems: 'flex-end', // i.e. bottom-align the text
            pointerEvents: 'none',
          }}
          title={new Date(ts) + ''}
        >
          {DateTime.fromMillis(ts).toFormat('HH:mm') // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
          }
        </div>
      ))}
    </div>
  );
}) as React.FC<Props>;
