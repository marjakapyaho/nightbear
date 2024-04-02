import React from 'react';
import { TimeAgo } from 'frontend/components/timeAgo/TimeAgo';
import styles from './StatusBar.module.scss';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';

type Props = {
  graphPoint: Point | null;
};

export const StatusBar = ({ graphPoint }: Props) => {
  return (
    <div className={styles.statusBar}>
      <div className={styles.status}>
        <span>{graphPoint ? <TimeAgo ts={graphPoint.timestamp} decimalsForMinutes frequentUpdates /> : 'n/a'}</span>{' '}
        <span className={styles.smallerText}>ago</span>
      </div>
    </div>
  );
};
