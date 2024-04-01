import React from 'react';
import styles from './ScrollableGraph.module.scss';
import { GraphConfig, Point, tsToLeft, valToTop } from './scrollableGraphUtils';
import { timestampIsUnderMaxAge } from 'shared/calculations/calculations';
import { setOneDecimal } from 'frontend/utils/helpers';

type Props = {
  latestPoint: Point | null;
  config: GraphConfig;
};

export const GraphLatestValue = ({ latestPoint, config }: Props) => {
  return (
    latestPoint &&
    config.showCurrentValue && (
      <span
        className={styles.latestVal}
        style={{
          top: valToTop(config, latestPoint.val || 6) - 35,
          left: tsToLeft(config, latestPoint.timestamp) - 13,
          color: timestampIsUnderMaxAge(Date.now(), latestPoint.timestamp, 8) ? '#555' : '#aaa',
        }}
      >
        {setOneDecimal(latestPoint.val)}
      </span>
    )
  );
};
