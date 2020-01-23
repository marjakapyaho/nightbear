import { MeterEntry, SensorEntry } from 'core/models/model';
import React from 'react';
import { bgToTop, ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/Timeline';
import 'web/ui/utils/timeline/TimelineMarkerBg.scss';
import { useCssNs } from 'web/utils/react';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: SensorEntry | MeterEntry;
};

export default (props => {
  const { React } = useCssNs('TimelineMarkerBg');

  const c = props.timelineConfig;

  if (props.model.bloodGlucose === null) {
    console.warn(
      'Trying to render a BG marker without a BG; this is probably a filtering error somewhere higher up',
      props.model,
    );
    return null;
  }

  return (
    <circle
      className="this"
      cx={tsToLeft(c, props.model.timestamp)}
      cy={bgToTop(c, props.model.bloodGlucose)}
      onClick={() => alert(`${new Date(props.model.timestamp)}\n\nbg = ${props.model.bloodGlucose}`)}
    ></circle>
  );
}) as React.FC<Props>;
