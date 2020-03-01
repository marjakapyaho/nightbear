import { HOUR_IN_MS } from 'core/calculations/calculations';
import { css } from 'emotion';
import { range } from 'lodash';
import { DateTime } from 'luxon';
import React, { Fragment } from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'web/ui/components/timeline/utils';

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
            color: '#aaa',
            'font-size': '0.9em',
            'z-index': '-1',
          })}
          style={{
            left: tsToLeft(props.timelineConfig, ts),
            width: HOUR_IN_MS * props.timelineConfig.pixelsPerMs,
          }}
          title={new Date(ts) + ''}
        >
          <span style={{ position: 'absolute', left: '-20px', bottom: '5px' }}>
            {DateTime.fromMillis(ts).toFormat('HH:mm') // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
            }
          </span>
        </div>
      ))}
    </Fragment>
  );
}) as React.FC<Props>;
