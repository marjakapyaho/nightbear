import { HOUR_IN_MS } from 'core/calculations/calculations';
import { Insulin, MeterEntry, SensorEntry } from 'core/models/model';
import { range } from 'lodash';
import { DateTime } from 'luxon';
import React, { useEffect, useRef } from 'react';
import { isNotNull } from 'server/utils/types';
import 'web/ui/utils/timeline/Timeline.scss';
import { useCssNs } from 'web/utils/react';

export type TimelineConfig = {
  timelineRange: number; // how many ms worth of timeline data are we showing
  timelineRangeEnd: number; // what's the most recent bit of timeline data we are showing (e.g. Date.now())
  paddingTop: number; // extra space above the BG scale lines
  paddingBottom: number; // extra space below the BG scale lines
  paddingLeft: number; // extra space to the left of the BG scale lines (does not move with the timeline)
  paddingRight: number; // extra space to the right of the BG scale lines (does not move with the timeline)
  outerHeight: number; // how much height from the layout should the whole timeline take (width is automatic)
  bgMin: number; // lowest BG to show on the scale lines
  bgMax: number; // highest BG to show on the scale lines
  bgStep: number; // how often to draw a BG line
  pixelsPerHour: number; // one hour of timeline data takes this many pixels of horizontal space
};

export type ExtendedTimelineConfig = TimelineConfig & {
  flooredHourStart: number; // when rendering the time scale (i.e. X-axis), this is the first full hour we need to render
  innerWidth: number; // regardless of the outer width of the timeline, within it, there will be this many pixels to scroll
  innerHeight: number; // height of the chart area (i.e. without vertical paddings)
  pixelsPerMs: number; // this is the less intuitive, but more programmatically useful version of pixelsPerHour
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

  const c = getExtendedTimelineConfig(props.timelineConfig);

  return (
    <div className="this">
      <div className="staticLayer">
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
      <div className="scrollingLayer" ref={thisRef}>
        <div
          style={{
            border: '1px solid green',
            width: c.innerWidth,
            height: c.outerHeight,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={[0, 0, c.innerWidth, c.outerHeight].join(' ')}
            style={{ width: c.innerWidth, height: c.outerHeight, zIndex: 9 }}
          >
            <polyline
              points={props.bgModels
                .map(model =>
                  isNotNull(model.bloodGlucose)
                    ? [tsToLeft(c, model.timestamp), bgToTop(c, model.bloodGlucose)].join()
                    : '',
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
                  cx={tsToLeft(c, model.timestamp)}
                  cy={bgToTop(c, model.bloodGlucose)}
                  onClick={() => alert(`${new Date(model.timestamp)}\n\nbg = ${model.bloodGlucose}`)}
                ></circle>
              ) : null,
            )}
          </svg>
          {range(c.flooredHourStart, c.timelineRangeEnd, HOUR_IN_MS).map(ts => (
            <div
              key={ts}
              style={{
                position: 'absolute',
                left: tsToLeft(c, ts),
                bottom: 0,
                width: HOUR_IN_MS * c.pixelsPerMs,
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
                left: tsToLeft(c, model.timestamp),
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
}) as React.FC<Props>;

// Calculates additional useful values from the TimelineConfig, which would introduce duplicated state if kept in TimelineConfig itself
export function getExtendedTimelineConfig(c: TimelineConfig): ExtendedTimelineConfig {
  const pixelsPerMs = c.pixelsPerHour / HOUR_IN_MS;
  return {
    ...c,
    flooredHourStart: Math.floor((c.timelineRangeEnd - c.timelineRange) / HOUR_IN_MS) * HOUR_IN_MS,
    innerWidth: Math.round(pixelsPerMs * c.timelineRange) + c.paddingLeft + c.paddingRight,
    innerHeight: c.outerHeight - c.paddingTop - c.paddingBottom,
    pixelsPerMs,
  };
}

// The CSS left value for rendering the given timestamp
export function tsToLeft(c: ExtendedTimelineConfig, ts: number) {
  return Math.round((c.paddingLeft + (ts - (c.timelineRangeEnd - c.timelineRange)) * c.pixelsPerMs) * 10) / 10; // round to 1 decimal; anything more is a nuisance when debugging
}

// The CSS top value for rendering the given BG
export function bgToTop(c: ExtendedTimelineConfig, bg: number) {
  return c.innerHeight - ((bg - c.bgMin) / (c.bgMax - c.bgMin)) * c.innerHeight + c.paddingTop;
}
