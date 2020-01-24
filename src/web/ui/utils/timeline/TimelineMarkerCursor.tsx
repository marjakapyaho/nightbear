import { css } from 'emotion';
import React from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  timestamp: number;
  onClick: () => void;
};

export default (props => {
  return (
    <div
      className={css({
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 3,
        background: 'cyan',
      })}
      style={{
        left: tsToLeft(props.timelineConfig, props.timestamp),
      }}
      onClick={() => props.onClick()}
    />
  );
}) as React.FC<Props>;
