import React from 'react';
import { TimeAgo } from 'frontend/components/timeAgo/TimeAgo';
import styles from './StatusBar.module.scss';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';

type Props = {
  graphPoint?: Point;
};

export const StatusBar = ({ graphPoint }: Props) => {
  return (
    <div className={styles.statusBar}>
      <div className={styles.status}>
        <span>
          {graphPoint ? (
            <TimeAgo timestamp={graphPoint.timestamp} decimalsForMinutes frequentUpdates />
          ) : (
            '-'
          )}
        </span>{' '}
        <span className={styles.smallerText}>ago</span>
      </div>
    </div>
  );
};
