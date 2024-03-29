import { MeterEntry, SensorEntry } from 'core/models/model';
import { css } from '@emotion/css';
import React from 'react';
import { bgToTop, ExtendedTimelineConfig, tsToLeft } from 'web/ui/components/timeline/utils';
import { nbGood, nbHigh, nbLow } from 'web/utils/colors';
import { highLimit, lowLimit } from 'web/utils/config';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: SensorEntry | MeterEntry;
  isSelected: boolean;
  onSelect: (model: SensorEntry | MeterEntry) => void;
};

export default (props => {
  const { bloodGlucose } = props.model;

  if (bloodGlucose === null || !isFinite(bloodGlucose)) {
    console.warn(
      'Trying to render a BG marker without a BG; this is probably a filtering error somewhere higher up',
      props.model,
    );
    return null;
  }

  if (!isFinite(props.model.timestamp)) {
    console.warn(
      'Trying to render a BG marker without a timestamp; this is probably a filtering error somewhere higher up',
      props.model,
    );
    return null;
  }

  function getFillColor(bg: number) {
    if (bg > highLimit) {
      return nbHigh;
    }
    if (bg < lowLimit) {
      return nbLow;
    }
    return nbGood;
  }

  return (
    <circle
      className={css({
        r: 3.7,
      })}
      style={
        {
          pointerEvents: props.model.modelType === 'MeterEntry' ? 'auto' : 'none',
          fill: props.model.modelType === 'MeterEntry' ? '#777' : getFillColor(bloodGlucose),
          r: props.isSelected ? 5 : undefined,
          stroke: 'white',
          strokeWidth: 1,
        } as any // the TS type defs won't accept "r" as a valid style prop :shrug:
      }
      cx={tsToLeft(props.timelineConfig, props.model.timestamp)}
      cy={bgToTop(props.timelineConfig, bloodGlucose)}
      onClick={() => props.onSelect(props.model)}
    />
  );
}) as React.FC<Props>;
