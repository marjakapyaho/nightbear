import React from 'react';
import { TimeAgo } from 'frontend/components/timeAgo/TimeAgo';
import { fontColorDark } from 'frontend/utils/colors';
import { fontSize } from 'frontend/utils/config';
import styles from './StatusBar.module.scss';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';

type Props = {
  graphPoint: Point | null;
};

export const StatusBar = ({ graphPoint }: Props) => {
  return (
    <div className={styles.statusBar}>
      <div className={styles.status}>
        <span style={{ color: fontColorDark, fontSize: fontSize }}>
          {graphPoint ? <TimeAgo ts={graphPoint.timestamp} decimalsForMinutes frequentUpdates /> : 'n/a'}
        </span>{' '}
        ago
      </div>
    </div>
  );
};
