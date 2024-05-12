import React from 'react';
import styles from './ScrollableGraph.module.scss';
import { GraphConfig, Point, tsToLeft, valToTop } from './scrollableGraphUtils';
import { setDecimals } from 'shared/utils/calculations';
import { getTimeInMillis, getTimeMinusMinutes, isTimeLarger } from 'shared/utils/time';

type Props = {
  latestPoint: Point | null;
  config: GraphConfig;
};

export const GraphLatestValue = ({ latestPoint, config }: Props) => {
  return (
    latestPoint &&
    latestPoint.val &&
    config.showCurrentValue && (
      <span
        className={styles.latestVal}
        style={{
          top: valToTop(config, latestPoint.val) - 30, // Magic numbers to position 38px width element
          left: tsToLeft(config, latestPoint.timestamp) - 18, // Magic numbers to position 38px width element
          color: isTimeLarger(latestPoint.timestamp, getTimeMinusMinutes(Date.now(), 8))
            ? '#555'
            : '#aaa',
        }}
      >
        {setDecimals(latestPoint.val, config.decimals)}
      </span>
    )
  );
};
