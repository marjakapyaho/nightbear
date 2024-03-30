import { Carbs } from 'shared/models/model';
import React from 'react';
import { TimeAgo } from 'frontend/components/timeAgo/TimeAgo';
import { ExtendedTimelineConfig, tsToLeft } from 'frontend/components/timeline/timelineUtils';
import { borderColor } from 'frontend/utils/colors';
import styles from './Timeline.module.scss';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: Carbs;
  isSelected: boolean;
  onSelect: (model: Carbs) => void;
};

export const TimelineMarkerCarbs = ({ timelineConfig, model, isSelected, onSelect }: Props) => {
  return (
    <div
      className={styles.timelineMarker}
      onClick={() => onSelect(model)}
      style={{ left: tsToLeft(timelineConfig, model.timestamp), zIndex: 10 }}
    >
      <div
        className={styles.verticalLine}
        style={{ borderLeft: isSelected ? `1px solid ${borderColor}` : undefined }}
      />
      <div className={styles.centeringWrapper}>
        <span className={isSelected ? styles.textLabelSelected : styles.textLabel}>
          <TimeAgo ts={model.timestamp} />
        </span>
      </div>
      <div className={styles.centeringWrapper}>
        <div className={`${styles.numberBubble} ${styles.carbs}`}>{model.amount}</div>
      </div>
    </div>
  );
};
