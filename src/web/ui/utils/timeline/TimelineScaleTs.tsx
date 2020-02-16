import { HOUR_IN_MS } from 'core/calculations/calculations';
import { css } from 'emotion';
import { range } from 'lodash';
import { DateTime } from 'luxon';
import React, { Fragment } from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
};

export default (props => {
  const tsLines = range(props.timelineConfig.flooredHourStart, props.timelineConfig.timelineRangeEnd, HOUR_IN_MS);

  return (
    <Fragment>
      {tsLines.map(ts => (
        <div
          key={ts}
          className={css({
            position: 'absolute',
            bottom: 0,
            borderLeft: '1px solid #eee',
            top: 0,
            display: 'flex',
            alignItems: 'flex-end', // i.e. bottom-align the text
            pointerEvents: 'none',
          })}
          style={{
            left: tsToLeft(props.timelineConfig, ts),
            width: HOUR_IN_MS * props.timelineConfig.pixelsPerMs,
          }}
          title={new Date(ts) + ''}
        >
          {DateTime.fromMillis(ts).toFormat('HH:mm') // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
          }
        </div>
      ))}
    </Fragment>
  );
}) as React.FC<Props>;
