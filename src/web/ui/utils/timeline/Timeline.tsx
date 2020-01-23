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
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  outerHeight: number;
  bgMin: number;
  bgMax: number;
  bgStep: number;
};

type Props = {
  timelineConfig: TimelineConfig;
  bgModels: (SensorEntry | MeterEntry)[];
  insulinModels: Insulin[];
};

export default (props => {
  const { React } = useCssNs('Timeline');
  const thisRef = useRef<HTMLDivElement | null>(null);
  useEffect(scrollRightOnMount, []);

  const {
    timelineRange,
    timelineRangeEnd,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    outerHeight,
    bgMin,
    bgMax,
    bgStep,
  } = props.timelineConfig;
  const flooredHourStart = Math.floor((timelineRangeEnd - timelineRange) / HOUR_IN_MS) * HOUR_IN_MS;
  const innerWidth = Math.round(PIXELS_PER_MS * timelineRange) + paddingLeft + paddingRight;

  return (
    <div className="this">
      <div className="staticLayer">
        {range(bgMin, bgMax + bgStep, bgStep).map(bg => (
          <div
            key={bg}
            style={{
              position: 'absolute',
              left: paddingLeft,
              top: bgToY(bg),
              right: paddingRight,
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
            bottom: paddingBottom,
            width: paddingRight,
            background: 'white',
            zIndex: 10,
          }}
        >
          {range(bgMin, bgMax + bgStep, bgStep).map(bg => (
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
            width: innerWidth,
            height: outerHeight,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={[0, 0, innerWidth, outerHeight].join(' ')}
            style={{ width: innerWidth, height: outerHeight, zIndex: 9 }}
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
          {range(flooredHourStart, timelineRangeEnd, HOUR_IN_MS).map(ts => (
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
    return (paddingLeft + (ts - (timelineRangeEnd - timelineRange)) * PIXELS_PER_MS).toFixed(1);
  }

  function bgToY(bg: number) {
    const kek = outerHeight - paddingTop - paddingBottom;
    return kek - ((bg - bgMin) / (bgMax - bgMin)) * kek + paddingTop;
  }
}) as React.FC<Props>;
