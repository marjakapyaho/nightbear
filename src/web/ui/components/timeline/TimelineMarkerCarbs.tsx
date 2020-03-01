import { Carbs } from 'core/models/model';
import { css, cx } from 'emotion';
import React from 'react';
import TimeAgo from 'web/ui/components/timeAgo/TimeAgo';
import { ExtendedTimelineConfig, markerStyles, tsToLeft } from 'web/ui/components/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: Carbs;
  isSelected: boolean;
  onSelect: (model: Carbs) => void;
};

const styles = {
  ...markerStyles,
  verticalLine: cx(markerStyles.verticalLine),
  numberBubble: cx(
    markerStyles.numberBubble,
    css({
      background: '#9ad5b3',
      color: 'white',
    }),
  ),
};

export default (props => {
  return (
    <div
      className={styles.root}
      onClick={() => props.onSelect(props.model)}
      style={{ left: tsToLeft(props.timelineConfig, props.model.timestamp) }}
    >
      <div className={styles.verticalLine} style={{ width: props.isSelected ? 1 : undefined }} />
      <div className={styles.centeringWrapper}>
        <span className={styles.textLabel}>
          <TimeAgo ts={props.model.timestamp} />
        </span>
      </div>
      <div className={styles.centeringWrapper}>
        <div className={styles.numberBubble}>{props.model.amount}</div>
      </div>
    </div>
  );
}) as React.FC<Props>;
