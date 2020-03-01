import { css } from 'emotion';
import { range } from 'lodash';
import React from 'react';
import { bgToTop, ExtendedTimelineConfig } from 'web/ui/components/timeline/utils';

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
            background: 'whitesmoke',
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
          top: 0,
          right: 0,
          background: 'white',
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
              textAlign: 'left',
            })}
            style={{
              top: bgToTop(props.timelineConfig, bg),
            }}
          >
            {bg}
          </div>
        ))}
      </div>
    </div>
  );
}) as React.FC<Props>;
