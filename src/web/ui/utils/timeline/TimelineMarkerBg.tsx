import { MeterEntry, SensorEntry } from 'core/models/model';
import { css } from 'emotion';
import React from 'react';
import { bgToTop, ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: SensorEntry | MeterEntry;
  isSelected: boolean;
  onSelect: (model: SensorEntry | MeterEntry) => void;
};

export default (props => {
  const { bloodGlucose } = props.model;

  if (bloodGlucose === null) {
    console.warn(
      'Trying to render a BG marker without a BG; this is probably a filtering error somewhere higher up',
      props.model,
    );
    return null;
  }

  return (
    <circle
      className={css({
        r: 5,
        stroke: 'red',
        strokeWidth: 2,
      })}
      style={
        {
          fill: props.model.modelType === 'MeterEntry' ? 'blue' : 'lightblue',
          r: props.isSelected ? 10 : undefined,
        } as any // the TS type defs won't accept "r" as a valid style prop :shrug:
      }
      cx={tsToLeft(props.timelineConfig, props.model.timestamp)}
      cy={bgToTop(props.timelineConfig, bloodGlucose)}
      onClick={() => props.onSelect(props.model)}
    />
  );
}) as React.FC<Props>;
