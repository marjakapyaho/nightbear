import { range } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import styles from './ScrollableGraph.module.scss';
import { GraphConfig, tsToLeft } from './scrollableGraphUtils';
import { getTimeAsISOStr, humanReadableShortTime } from 'shared/utils/time';

type Props = {
  config: GraphConfig;
};

export const GraphScaleHorizontal = ({ config }: Props) => {
  const timeStepLines = range(config.flooredHourStart, config.timelineRangeEnd, config.timeStep);

  return timeStepLines.map((timestamp, i) => {
    return (
      <div
        className={styles.graphHorizontalScaleItem}
        key={timestamp}
        style={{
          left: tsToLeft(config, timestamp),
          width: config.timeStep * config.pixelsPerMs,
        }}
      >
        <span
          className={styles.graphScaleTime}
          style={{
            left: -20, // Should correlate with graphScaleTime width
            display: i % config.showEveryNthTimeLabel === 0 ? 'initial' : 'none',
          }}
        >
          {humanReadableShortTime(timestamp)}
        </span>
      </div>
    );
  });
};
