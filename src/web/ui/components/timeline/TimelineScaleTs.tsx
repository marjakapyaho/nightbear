import { HOUR_IN_MS } from 'core/calculations/calculations';
import { css } from '@emotion/css';
import { range } from 'lodash';
import { DateTime } from 'luxon';
import React, { Fragment } from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'web/ui/components/timeline/utils';
import { borderColorLight, fontColorLight } from 'web/utils/colors';
import { fontSize } from 'web/utils/config';

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
            borderLeft: `1px solid ${borderColorLight}`,
            top: 0,
            display: 'flex',
            alignItems: 'flex-end', // i.e. bottom-align the text
            pointerEvents: 'none',
            zIndex: -1,
          })}
          style={{
            left: tsToLeft(props.timelineConfig, ts),
            width: HOUR_IN_MS * props.timelineConfig.pixelsPerMs,
          }}
          title={new Date(ts) + ''}
        >
          <span
            style={{
              position: 'absolute',
              left: '-19px',
              bottom: '0',
              paddingBottom: '7px',
              paddingTop: '4px',
              background: 'white',
              fontSize: fontSize,
              color: fontColorLight,
            }}
          >
            {
              DateTime.fromMillis(ts).toFormat('HH:mm') // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
            }
          </span>
        </div>
      ))}
    </Fragment>
  );
}) as React.FC<Props>;
