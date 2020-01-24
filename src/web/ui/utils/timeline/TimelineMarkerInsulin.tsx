import { Insulin } from 'core/models/model';
import { css } from 'emotion';
import React from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: Insulin;
};

export default (props => {
  return (
    <div
      className={css({
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 3,
        background: 'hotpink',
      })}
      style={{
        left: tsToLeft(props.timelineConfig, props.model.timestamp),
      }}
    >
      {props.model.amount}
    </div>
  );
}) as React.FC<Props>;
