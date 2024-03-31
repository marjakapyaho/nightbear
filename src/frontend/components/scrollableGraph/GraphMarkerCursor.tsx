import React from 'react';
import { TimeAgo } from 'frontend/components/timeAgo/TimeAgo';
import styles from './ScrollableGraph.module.scss';
import { GraphConfig, tsToLeft } from './scrollableGraphUtils';

type Props = {
  config: GraphConfig;
  timestamp: number;
  onClick: () => void;
};

export const GraphMarkerCursor = ({ config, timestamp, onClick }: Props) => {
  return (
    <div className={styles.graphMarker} style={{ left: tsToLeft(config, timestamp) }} onClick={() => onClick()}>
      <div className={styles.verticalLine} />
      <div className={styles.centeringWrapper}>
        <span className={styles.textLabel}>
          <TimeAgo ts={timestamp} />
        </span>
      </div>
    </div>
  );
};
