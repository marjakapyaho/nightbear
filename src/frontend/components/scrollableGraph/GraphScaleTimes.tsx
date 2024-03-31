import { range } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import styles from './ScrollableGraph.module.scss';
import { GraphConfig, tsToLeft } from './scrollableGraphUtils';

type Props = {
  config: GraphConfig;
};

export const GraphScaleTimes = ({ config }: Props) => {
  const tsLines = range(config.flooredHourStart, config.timelineRangeEnd, config.timeStep);

  return tsLines.map((ts, i) => (
    <div
      className={styles.graphScaleTime}
      key={ts}
      style={{
        left: tsToLeft(config, ts),
        width: config.timeStep * config.pixelsPerMs,
      }}
      title={new Date(ts) + ''}
    >
      <span
        className={styles.graphScaleHour}
        style={{
          left: config.pixelsPerTimeStep / -2,
        }}
      >
        <span
          style={{
            display: config.pixelsPerTimeStep < 30 && i % 3 === 0 ? 'initial' : 'none',
          }}
        >
          {DateTime.fromMillis(ts).toFormat(config.timeFormat)}
        </span>
      </span>
    </div>
  ));
};
