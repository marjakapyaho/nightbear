import React from 'react';
import { PIXELS_PER_HOUR, PIXELS_PER_MS } from 'core/config/const';
import { Insulin, MeterEntry, SensorEntry, TimelineModel } from 'core/models/model';
import { is } from 'core/models/utils';
import { NsFunction } from 'css-ns';
import { first, range } from 'lodash';
import { useEffect, useRef, Fragment } from 'react';
import { isNotNull } from 'server/utils/types';
import 'web/ui/utils/timeline/Timeline.scss';
import Highcharts from 'web/ui/utils/Highcharts';
import { useCssNs } from 'web/utils/react';
import { HOUR_IN_MS } from 'core/calculations/calculations';
import { DateTime } from 'luxon';

export type TimelineConfig = {
  timelineRange: number;
  timelineRangeEnd: number;
};

type Props = {
  bgModels: (SensorEntry | MeterEntry)[];
  insulinModels: Insulin[];
} & TimelineConfig;

export default (props => {
  const { React } = useCssNs('Timeline');
  const thisRef = useRef<HTMLDivElement | null>(null);
  useEffect(scrollRightOnMount, []);

  const timelinePaddingTop = 10;
  const timelinePaddingBottom = 40;
  const timelinePaddingLeft = 0;
  const timelinePaddingRight = 20;
  const timelineWidth = Math.round(PIXELS_PER_MS * props.timelineRange) + timelinePaddingLeft + timelinePaddingRight;
  const timelineHeight = 400;
  const yScaleMin = 2;
  const yScaleMax = 18;
  const yScaleStep = 1;
  const startFullHour = Math.floor((props.timelineRangeEnd - props.timelineRange) / HOUR_IN_MS) * HOUR_IN_MS;

  return (
    <div className="this">
      <div className="staticLayer">
        {range(yScaleMin, yScaleMax + yScaleStep, yScaleStep).map(bg => (
          <div
            key={bg}
            style={{
              position: 'absolute',
              left: timelinePaddingLeft,
              top: bgToY(bg),
              right: timelinePaddingRight,
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
            bottom: timelinePaddingBottom,
            width: timelinePaddingRight,
            background: 'white',
            zIndex: 10,
          }}
        >
          {range(yScaleMin, yScaleMax + yScaleStep, yScaleStep).map(bg => (
            <div
              key={bg}
              style={{
                position: 'absolute',
                left: 0,
                top: bgToY(bg),
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
      <div className="scrollingLayer" ref={thisRef}>
        <div
          style={{
            border: '1px solid green',
            width: timelineWidth,
            height: timelineHeight,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={[0, 0, timelineWidth, timelineHeight].join(' ')}
            style={{ width: timelineWidth, height: timelineHeight, zIndex: 9 }}
          >
            <polyline
              points={props.bgModels
                .map(model =>
                  isNotNull(model.bloodGlucose) ? [tsToX(model.timestamp), bgToY(model.bloodGlucose)].join() : '',
                )
                .join(' ')}
              stroke="orange"
              strokeWidth="3"
              fill="none"
            />
            {props.bgModels.map((model, i) =>
              isNotNull(model.bloodGlucose) ? (
                <circle
                  key={i}
                  className="point-bg"
                  cx={tsToX(model.timestamp)}
                  cy={bgToY(model.bloodGlucose)}
                  onClick={() => alert(`${new Date(model.timestamp)}\n\nbg = ${model.bloodGlucose}`)}
                ></circle>
              ) : null,
            )}
          </svg>
          {range(startFullHour, props.timelineRangeEnd, HOUR_IN_MS).map(ts => (
            <div
              key={ts}
              style={{
                position: 'absolute',
                left: tsToX(ts) + 'px',
                bottom: 0,
                width: HOUR_IN_MS * PIXELS_PER_MS,
                borderLeft: '1px dotted gray',
                top: 0,
                display: 'flex',
                alignItems: 'flex-end', // i.e. bottom-align the text
                pointerEvents: 'none',
              }}
              title={new Date(ts) + ''}
            >
              {DateTime.fromMillis(ts).toFormat('HH:mm') // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
              }
            </div>
          ))}
          {props.insulinModels.map((model, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: tsToX(model.timestamp) + 'px',
                bottom: 0,
                width: 3,
                background: 'hotpink',
              }}
            >
              {model.amount}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  function scrollRightOnMount() {
    if (!thisRef.current) return;
    thisRef.current.scrollLeft = thisRef.current.scrollWidth;
  }

  function tsToX(ts: number) {
    return (timelinePaddingLeft + (ts - (props.timelineRangeEnd - props.timelineRange)) * PIXELS_PER_MS).toFixed(1);
  }

  function bgToY(bg: number) {
    const kek = timelineHeight - timelinePaddingTop - timelinePaddingBottom;
    return kek - ((bg - yScaleMin) / (yScaleMax - yScaleMin)) * kek + timelinePaddingTop;
  }
}) as React.FC<Props>;
