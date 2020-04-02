import { Carbs } from 'core/models/model';
import { css, cx } from 'emotion';
import React from 'react';
import TimeAgo from 'web/ui/components/timeAgo/TimeAgo';
import { ExtendedTimelineConfig, markerStyles, tsToLeft } from 'web/ui/components/timeline/utils';
import { borderColor, nbCarbs } from 'web/utils/colors';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: Carbs;
  isSelected: boolean;
  onSelect: (model: Carbs) => void;
};

const styles = {
  ...markerStyles,
  numberBubble: cx(
    markerStyles.numberBubble,
    css({
      background: nbCarbs,
      color: 'white',
    }),
  ),
};

export default (props => {
  return (
    <div
      className={styles.root}
      onClick={() => props.onSelect(props.model)}
      style={{ left: tsToLeft(props.timelineConfig, props.model.timestamp), zIndex: 10 }}
    >
      <div
        className={styles.verticalLine}
        style={{ borderLeft: props.isSelected ? `1px solid ${borderColor}` : undefined }}
      />
      <div className={styles.centeringWrapper}>
        <span className={props.isSelected ? styles.textLabelSelected : styles.textLabel}>
          <TimeAgo ts={props.model.timestamp} />
        </span>
      </div>
      <div className={styles.centeringWrapper}>
        <div className={styles.numberBubble} style={{ marginTop: '240px' }}>
          {props.model.amount}
        </div>
      </div>
    </div>
  );
}) as React.FC<Props>;
