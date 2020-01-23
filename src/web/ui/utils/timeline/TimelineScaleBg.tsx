import { range } from 'lodash';
import React from 'react';
import { bgToTop, ExtendedTimelineConfig } from 'web/ui/utils/timeline/Timeline';
import 'web/ui/utils/timeline/Timeline.scss';
import { useCssNs } from 'web/utils/react';

type Props = {
  timelineConfig: ExtendedTimelineConfig;
};

export default (props => {
  const { React } = useCssNs('TimelineScaleBg');

  const c = props.timelineConfig;

  return (
    <div className="this">
      {range(c.bgMin, c.bgMax + c.bgStep, c.bgStep).map(bg => (
        <div
          key={bg}
          style={{
            position: 'absolute',
            left: c.paddingLeft,
            top: bgToTop(c, bg),
            right: c.paddingRight,
            height: 1,
            background: 'green',
          }}
        ></div>
      ))}
      <div
        className="bgScale"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: c.paddingBottom,
          width: c.paddingRight,
          background: 'white',
          zIndex: 10,
        }}
      >
        {range(c.bgMin, c.bgMax + c.bgStep, c.bgStep).map(bg => (
          <div
            key={bg}
            style={{
              position: 'absolute',
              left: 0,
              top: bgToTop(c, bg),
              right: 0,
              fontSize: 10,
              textAlign: 'left',
            }}
          >
            {bg}
          </div>
        ))}
      </div>
    </div>
  );
}) as React.FC<Props>;
