import { HOUR_IN_MS } from 'core/calculations/calculations';
import { Insulin, MeterEntry, SensorEntry } from 'core/models/model';
import React, { useEffect, useRef } from 'react';
import 'web/ui/utils/timeline/Timeline.scss';
import TimelineGraphBg from 'web/ui/utils/timeline/TimelineGraphBg';
import TimelineMarkerBg from 'web/ui/utils/timeline/TimelineMarkerBg';
import TimelineMarkerInsulin from 'web/ui/utils/timeline/TimelineMarkerInsulin';
import TimelineScaleBg from 'web/ui/utils/timeline/TimelineScaleBg';
import TimelineScaleTs from 'web/ui/utils/timeline/TimelineScaleTs';
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
        <TimelineScaleBg timelineConfig={c} />
      </div>
      <div className="scrollingLayer" ref={thisRef}>
        <div
          className="scrollingLayerCutoff"
          style={{
            border: '1px dotted blue',
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
            <TimelineGraphBg timelineConfig={c} bgModels={props.bgModels} />
            {props.bgModels.map((model, i) => (
              <TimelineMarkerBg key={i} timelineConfig={c} model={model} />
            ))}
          </svg>
          <TimelineScaleTs timelineConfig={c} />
          {props.insulinModels.map((model, i) => (
            <TimelineMarkerInsulin key={i} timelineConfig={c} model={model} />
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
