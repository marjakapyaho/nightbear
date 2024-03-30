import { MeterEntry, SensorEntry } from 'shared/models/model';
import styles from './Timeline.module.scss';
import React from 'react';
import { isNotNull } from 'backend/utils/types';
import { bgToTop, ExtendedTimelineConfig, tsToLeft } from 'frontend/components/timeline/timelineUtils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  bgModels: (SensorEntry | MeterEntry)[];
};

export const TimelineGraphBg = ({ timelineConfig, bgModels }: Props) => {
  return (
    <polyline
      className={styles.timelineGraphBg}
      points={bgModels
        .map(
          model =>
            isNotNull(model.bloodGlucose)
              ? [tsToLeft(timelineConfig, model.timestamp), bgToTop(timelineConfig, model.bloodGlucose)].join()
              : '', // skip drawing points that don't have a BG set (though they should've been filtered out earlier anyway)
        )
        .join(' ')}
    />
  );
};
