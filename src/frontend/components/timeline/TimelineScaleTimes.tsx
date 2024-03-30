import { HOUR_IN_MS } from 'shared/calculations/calculations';
import { range } from 'lodash';
import { DateTime } from 'luxon';
import React, { Fragment } from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'frontend/components/timeline/timelineUtils';
import styles from './Timeline.module.scss';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
};

export const TimelineScaleTimes = ({ timelineConfig }: Props) => {
  const tsLines = range(timelineConfig.flooredHourStart, timelineConfig.timelineRangeEnd, HOUR_IN_MS);

  return (
    <Fragment>
      {tsLines.map(ts => (
        <div
          className={styles.timelineScaleTime}
          key={ts}
          style={{
            left: tsToLeft(timelineConfig, ts),
            width: HOUR_IN_MS * timelineConfig.pixelsPerMs,
          }}
          title={new Date(ts) + ''}
        >
          <span className={styles.timelineScaleHour}>
            {
              DateTime.fromMillis(ts).toFormat('HH:mm') // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
            }
          </span>
        </div>
      ))}
    </Fragment>
  );
};
