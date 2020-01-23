import { HOUR_IN_MS } from 'core/calculations/calculations';
import { Insulin, MeterEntry, SensorEntry } from 'core/models/model';
import { range } from 'lodash';
import { DateTime } from 'luxon';
import React, { useEffect, useRef } from 'react';
import { isNotNull } from 'server/utils/types';
import 'web/ui/utils/timeline/TimelineMarkerBg.scss';
import { useCssNs } from 'web/utils/react';
import TimelineScaleBg from 'web/ui/utils/timeline/TimelineScaleBg';
import { ExtendedTimelineConfig, tsToLeft, bgToTop } from 'web/ui/utils/timeline/Timeline';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: Insulin;
};

export default (props => {
  const { React } = useCssNs('TimelineMarkerBg');

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
