import { MeterEntry, SensorEntry } from 'shared/models/model';
import styles from './Timeline.module.scss';
import React from 'react';
import { bgToTop, ExtendedTimelineConfig, getFillColor, tsToLeft } from 'frontend/components/timeline/timelineUtils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: SensorEntry | MeterEntry;
  isSelected: boolean;
  onSelect: (model: SensorEntry | MeterEntry) => void;
};

export const TimelineMarkerBg = ({ timelineConfig, model, isSelected, onSelect }: Props) => {
  const { bloodGlucose } = model;

  if (bloodGlucose === null || !isFinite(bloodGlucose)) {
    console.warn(
      'Trying to render a BG marker without a BG; this is probably a filtering error somewhere higher up',
      model,
    );
    return null;
  }

  if (!isFinite(model.timestamp)) {
    console.warn(
      'Trying to render a BG marker without a timestamp; this is probably a filtering error somewhere higher up',
      model,
    );
    return null;
  }

  return (
    <circle
      className={styles.timelineMarkerBg}
      style={
        {
          pointerEvents: model.modelType === 'MeterEntry' ? 'auto' : 'none',
          fill: model.modelType === 'MeterEntry' ? '#777' : getFillColor(bloodGlucose),
          r: isSelected ? 5 : undefined,
        } as any // the TS type defs won't accept "r" as a valid style prop :shrug:
      }
      cx={tsToLeft(timelineConfig, model.timestamp)}
      cy={bgToTop(timelineConfig, bloodGlucose)}
      onClick={() => onSelect(model)}
    />
  );
};
