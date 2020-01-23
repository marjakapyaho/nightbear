import { MeterEntry, SensorEntry } from 'core/models/model';
import React from 'react';
import { isNotNull } from 'server/utils/types';
import { bgToTop, ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/Timeline';
import 'web/ui/utils/timeline/Timeline.scss';
import { useCssNs } from 'web/utils/react';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  bgModels: (SensorEntry | MeterEntry)[];
};

export default (props => {
  const { React } = useCssNs('TimelineGraphBg');

  const c = props.timelineConfig;

  return (
    <polyline
      points={props.bgModels
        .map(model =>
          isNotNull(model.bloodGlucose) ? [tsToLeft(c, model.timestamp), bgToTop(c, model.bloodGlucose)].join() : '',
        )
        .join(' ')}
      stroke="orange"
      strokeWidth="3"
      fill="none"
    />
  );
}) as React.FC<Props>;
