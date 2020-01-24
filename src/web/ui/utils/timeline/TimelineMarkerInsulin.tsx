import { Insulin } from 'core/models/model';
import { css } from 'emotion';
import React from 'react';
import { ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/utils';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
  model: Insulin;
  isSelected: boolean;
  onSelect: (model: Insulin) => void;
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
        width: props.isSelected ? 10 : undefined,
      }}
      onClick={() => props.onSelect(props.model)}
    >
      {props.model.amount}
    </div>
  );
}) as React.FC<Props>;
