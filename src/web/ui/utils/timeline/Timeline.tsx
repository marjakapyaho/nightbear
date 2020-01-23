import { HOUR_IN_MS } from 'core/calculations/calculations';
import { Insulin, MeterEntry, SensorEntry } from 'core/models/model';
import { css, cx } from 'emotion';
import React, { useEffect, useRef } from 'react';
import TimelineGraphBg from 'web/ui/utils/timeline/TimelineGraphBg';
import TimelineMarkerBg from 'web/ui/utils/timeline/TimelineMarkerBg';
import TimelineMarkerInsulin from 'web/ui/utils/timeline/TimelineMarkerInsulin';
import TimelineScaleBg from 'web/ui/utils/timeline/TimelineScaleBg';
import TimelineScaleTs from 'web/ui/utils/timeline/TimelineScaleTs';

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

const rootCss = css({
  position: 'relative', // a lot of children are positioned according to this root element
  overflow: 'hidden', // if anything pokes out, hide it; scrolling is implemented using a separate element
});
const baseLayerCss = css({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
});
const scrollingLayerCss = cx(
  baseLayerCss,
  css({
    overflowX: 'scroll',
    overflowY: 'hidden',
    // IMPORTANT: Even though this doesn't seem to be needed for momentum scrolling anymore (tested on iOS 13.3),
    // at least SVG elements within a scroll container may randomly skip repaints without it. ¯\_(ツ)_/¯
    WebkitOverflowScrolling: 'touch',
  }),
);
const scrollingCutoffCss = css({
  overflow: 'hidden',
  position: 'relative',
});
const svgCss = css({
  display: 'block',
  zIndex: 9,
});

export default (props => {
  const thisRef = useRef<HTMLDivElement | null>(null);
  useEffect(scrollRightOnMount, []);

  const c = getExtendedTimelineConfig(props.timelineConfig);

  return (
    <div className={rootCss}>
      <div className={baseLayerCss}>
        <TimelineScaleBg timelineConfig={c} />
      </div>
      <div className={scrollingLayerCss} ref={thisRef}>
        <div className={scrollingCutoffCss} style={{ width: c.innerWidth, height: c.outerHeight }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={[0, 0, c.innerWidth, c.outerHeight].join(' ')}
            className={svgCss}
            style={{ width: c.innerWidth, height: c.outerHeight }}
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
