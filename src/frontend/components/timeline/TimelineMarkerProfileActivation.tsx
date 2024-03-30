import { ActiveProfile } from 'shared/models/model';
import React from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'frontend/components/timeline/timelineUtils';
import styles from './Timeline.module.scss';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: ActiveProfile;
};

export const TimelineMarkerProfileActivation = ({ timelineConfig, model }: Props) => {
  return (
    <div className={styles.timelineMarker} style={{ left: tsToLeft(timelineConfig, model.timestamp) }}>
      <div className={`${styles.verticalLine} ${styles.profile}`} />
      <div className={styles.centeringWrapper}>
        <span className={styles.textLabel}>{model.profileName.toUpperCase()}</span>
      </div>
    </div>
  );
};
