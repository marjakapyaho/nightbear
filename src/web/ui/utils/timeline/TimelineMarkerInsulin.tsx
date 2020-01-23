import { Insulin } from 'core/models/model';
import React from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/Timeline';
import 'web/ui/utils/timeline/TimelineMarkerBg.scss';
import { useCssNs } from 'web/utils/react';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: Insulin;
};

export default (props => {
  const { React } = useCssNs('TimelineMarkerInsulin');

  const c = props.timelineConfig;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: tsToLeft(c, props.model.timestamp),
        bottom: 0,
        width: 3,
        background: 'hotpink',
      }}
    >
      {props.model.amount}
    </div>
  );
}) as React.FC<Props>;
