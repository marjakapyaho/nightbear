import { MeterEntry, SensorEntry } from 'core/models/model';
import { css } from 'emotion';
import React from 'react';
import { isNotNull } from 'server/utils/types';
import { bgToTop, ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/utils';

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
