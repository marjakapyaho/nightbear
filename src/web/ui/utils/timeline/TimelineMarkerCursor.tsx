import { css } from 'emotion';
import React from 'react';
import TimeAgo from 'web/ui/utils/TimeAgo';
import { ExtendedTimelineConfig, tsToLeft } from 'web/ui/utils/timeline/utils';

const WIDTH_CLICKABLE = 20;
const WIDTH_LINE = 4;
const WIDTH_TEXT_MAX = 150;

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
        width: WIDTH_CLICKABLE,
        marginLeft: WIDTH_CLICKABLE / -2,
      })}
      style={{
        left: tsToLeft(props.timelineConfig, props.timestamp),
      }}
      onClick={() => props.onClick()}
    >
      <div
        className={css({
          position: 'absolute',
          top: 0,
          left: WIDTH_CLICKABLE / 2 - WIDTH_LINE / 2,
          width: WIDTH_LINE,
          bottom: 0,
          background: 'cyan',
        })}
      />
      <div
        className={css({
          position: 'absolute',
          top: 10,
          left: (WIDTH_TEXT_MAX - WIDTH_CLICKABLE) / -2,
          width: WIDTH_TEXT_MAX,
          right: 0,
          textAlign: 'center',
        })}
      >
        <span
          className={css({
            border: '1px solid gray',
            borderRadius: 100,
            padding: 5,
            background: 'white',
          })}
        >
          <TimeAgo ts={props.timestamp} />
        </span>
      </div>
    </div>
  );
}) as React.FC<Props>;
