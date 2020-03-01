import React from 'react';
import TimeAgo from 'web/ui/components/timeAgo/TimeAgo';
import { ExtendedTimelineConfig, markerStyles, tsToLeft } from 'web/ui/components/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  timestamp: number;
  onClick: () => void;
};

const styles = {
  ...markerStyles,
};

export default (props => {
  return (
    <div
      className={styles.root}
      style={{ left: tsToLeft(props.timelineConfig, props.timestamp) }}
      onClick={() => props.onClick()}
    >
      <div className={styles.verticalLine} />
      <div className={styles.centeringWrapper}>
        <span className={styles.textLabel}>
          <TimeAgo ts={props.timestamp} />
        </span>
      </div>
    </div>
  );
}) as React.FC<Props>;
