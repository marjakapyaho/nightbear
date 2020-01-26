import { MeterEntry, SensorEntry } from 'core/models/model';
import { css } from 'emotion';
import React from 'react';
import { bgToTop, ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: SensorEntry | MeterEntry;
};

export default (props => {
  if (props.model.bloodGlucose === null) {
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
        fill: 'blue',
      })}
      cx={tsToLeft(props.timelineConfig, props.model.timestamp)}
      cy={bgToTop(props.timelineConfig, props.model.bloodGlucose)}
      onClick={() => alert(`${new Date(props.model.timestamp)}\n\nbg = ${props.model.bloodGlucose}`)}
    />
  );
}) as React.FC<Props>;
