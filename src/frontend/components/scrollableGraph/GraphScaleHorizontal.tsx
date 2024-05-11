import { range } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import styles from './ScrollableGraph.module.scss';
import { GraphConfig, tsToLeft } from './scrollableGraphUtils';
import { getTimeAsISOStr } from 'shared/utils/time';

type Props = {
  config: GraphConfig;
};

export const GraphScaleHorizontal = ({ config }: Props) => {
  const timeStepLines = range(config.flooredHourStart, config.timelineRangeEnd, config.timeStep);

  return timeStepLines.map((timestamp, i) => (
    <div
      className={styles.graphHorizontalScaleItem}
      key={timestamp}
      style={{
        left: tsToLeft(config, getTimeAsISOStr(timestamp)),
        width: config.timeStep * config.pixelsPerMs,
      }}
    >
      <span
        className={styles.graphScaleTime}
        style={{
          left: config.pixelsPerTimeStep / -2,
          display: i % config.showEveryNthTimeLabel === 0 ? 'initial' : 'none',
        }}
      >
        {DateTime.fromMillis(timestamp).toFormat(config.timeFormat)}
      </span>
    </div>
  ));
};
