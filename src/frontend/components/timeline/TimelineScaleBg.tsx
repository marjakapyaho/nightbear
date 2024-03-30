import { range } from 'lodash';
import React from 'react';
import { bgToTop, ExtendedTimelineConfig } from 'frontend/components/timeline/timelineUtils';
import { highLimit } from 'frontend/utils/config';
import styles from './Timeline.module.scss';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
};

export const TimelineScaleBg = ({ timelineConfig }: Props) => {
  const bgLines = range(timelineConfig.bgMin, timelineConfig.bgMax + timelineConfig.bgStep, timelineConfig.bgStep);

  return (
    <div className={styles.timelineScaleBg}>
      <div
        className={styles.goodBg}
        style={{
          left: timelineConfig.paddingLeft,
          top: bgToTop(timelineConfig, highLimit),
          right: 0,
        }}
      />
      <div
        className={styles.bgAxis}
        style={{
          bottom: timelineConfig.paddingBottom,
          width: timelineConfig.paddingRight,
        }}
      >
        {bgLines.map(bg => (
          <div
            key={bg}
            className={styles.bgLabel}
            style={{
              top: bgToTop(timelineConfig, bg) - 4, // Number is dependent on font size and makes label placement nicer
              opacity: bg % 2 === 0 ? 1 : 0,
              paddingLeft: timelineConfig.paddingRight / 2,
            }}
          >
            {bg}
          </div>
        ))}
      </div>
    </div>
  );
};
