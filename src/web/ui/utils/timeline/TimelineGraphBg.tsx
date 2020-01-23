import { HOUR_IN_MS } from 'core/calculations/calculations';
import { Insulin, MeterEntry, SensorEntry } from 'core/models/model';
import { range } from 'lodash';
import { DateTime } from 'luxon';
import React, { useEffect, useRef } from 'react';
import { isNotNull } from 'server/utils/types';
import 'web/ui/utils/timeline/Timeline.scss';
import { useCssNs } from 'web/utils/react';
import TimelineScaleBg from 'web/ui/utils/timeline/TimelineScaleBg';
import { ExtendedTimelineConfig, tsToLeft, bgToTop } from 'web/ui/utils/timeline/Timeline';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  bgModels: (SensorEntry | MeterEntry)[];
};

export default (props => {
  const { React } = useCssNs('TimelineScaleTs');

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
