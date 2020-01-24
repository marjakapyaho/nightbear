import { HOUR_IN_MS } from 'core/calculations/calculations';

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
