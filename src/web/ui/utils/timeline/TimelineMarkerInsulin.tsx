import { Insulin } from 'core/models/model';
import { css, cx } from 'emotion';
import React from 'react';
import TimeAgo from 'web/ui/utils/TimeAgo';
import { ExtendedTimelineConfig, markerStyles, tsToLeft } from 'web/ui/utils/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: Insulin;
  isSelected: boolean;
  onSelect: (model: Insulin) => void;
};

const styles = {
  ...markerStyles,
  verticalLine: cx(
    markerStyles.verticalLine,
    css({
      background: 'hotpink',
    }),
  ),
  numberBubble: cx(
    markerStyles.numberBubble,
    css({
      background: 'hotpink',
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
      <div className={styles.verticalLine} style={{ width: props.isSelected ? 10 : undefined }} />
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
