import { MeterEntry, SensorEntry } from 'shared/models/model';
import { css } from '@emotion/css';
import React from 'react';
import { isNotNull } from 'backend/utils/types';
import { bgToTop, ExtendedTimelineConfig, tsToLeft } from 'frontend/components/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  bgModels: (SensorEntry | MeterEntry)[];
};

export default (props => {
  return (
    <polyline
      className={css({
        stroke: '#ccc',
        strokeWidth: 1,
        fill: 'none',
      })}
      points={props.bgModels
        .map(
          model =>
            isNotNull(model.bloodGlucose)
              ? [
                  tsToLeft(props.timelineConfig, model.timestamp),
                  bgToTop(props.timelineConfig, model.bloodGlucose),
                ].join()
              : '', // skip drawing points that don't have a BG set (though they should've been filtered out earlier anyway)
        )
        .join(' ')}
    />
  );
}) as React.FC<Props>;
