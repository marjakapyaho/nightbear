import { css } from 'emotion';
import { range } from 'lodash';
import React from 'react';
import { bgToTop, ExtendedTimelineConfig } from 'web/ui/components/timeline/utils';
import { highLimit } from 'web/utils/config';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
};

export default (props => {
  const bgLines = range(
    props.timelineConfig.bgMin,
    props.timelineConfig.bgMax + props.timelineConfig.bgStep,
    props.timelineConfig.bgStep,
  );

  return (
    <div className="this">
      {bgLines.map(bg => (
        <div
          key={bg}
          className={css({
            position: 'absolute',
            height: 1,
            background: 'white',
            zIndex: -1,
          })}
          style={{
            left: props.timelineConfig.paddingLeft,
            top: bgToTop(props.timelineConfig, bg),
            right: props.timelineConfig.paddingRight,
          }}
        ></div>
      ))}
      <div
        className={css({
          position: 'absolute',
          height: 85,
          background: '#f3f9f2',
          zIndex: -1,
        })}
        style={{
          left: props.timelineConfig.paddingLeft,
          top: bgToTop(props.timelineConfig, highLimit),
          right: 0,
        }}
      ></div>
      <div
        className={css({
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 10,
        })}
        style={{
          bottom: props.timelineConfig.paddingBottom,
          width: props.timelineConfig.paddingRight,
        }}
      >
        {bgLines.map(bg => (
          <div
            key={bg}
            className={css({
              position: 'absolute',
              left: 0,
              right: 0,
              fontSize: 10,
              color: bg % 2 === 0 ? '#aaa' : '#fff',
              textAlign: 'left',
              paddingLeft: props.timelineConfig.paddingRight / 2,
            })}
            style={{
              top: bgToTop(props.timelineConfig, bg) - 4, // the magic number is dependent on font size, and just makes the label placement more pleasant
            }}
          >
            {bg}
          </div>
        ))}
      </div>
    </div>
  );
}) as React.FC<Props>;
