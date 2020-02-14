import { css, cx } from 'emotion';
import React from 'react';
import TimeAgo from 'web/ui/utils/TimeAgo';
import { ExtendedTimelineConfig, markerStyles, tsToLeft } from 'web/ui/utils/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  timestamp: number;
  onClick: () => void;
};

const styles = {
  ...markerStyles,
  verticalLine: cx(
    markerStyles.verticalLine,
    css({
      background: 'orange',
    }),
  ),
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
