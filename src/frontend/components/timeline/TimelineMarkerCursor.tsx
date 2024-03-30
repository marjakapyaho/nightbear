import React from 'react';
import { TimeAgo } from 'frontend/components/timeAgo/TimeAgo';
import { ExtendedTimelineConfig, tsToLeft } from 'frontend/components/timeline/timelineUtils';
import styles from './Timeline.module.scss';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  timestamp: number;
  onClick: () => void;
};

export const TimelineMarkerCursor = ({ timelineConfig, timestamp, onClick }: Props) => {
  return (
    <div
      className={styles.timelineMarker}
      style={{ left: tsToLeft(timelineConfig, timestamp) }}
      onClick={() => onClick()}
    >
      <div className={styles.verticalLine} />
      <div className={styles.centeringWrapper}>
        <span className={styles.textLabel}>
          <TimeAgo ts={timestamp} />
        </span>
      </div>
    </div>
  );
};
