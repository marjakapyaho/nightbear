import { HOUR_IN_MS, roundTo1Decimals } from 'core/calculations/calculations';
import { css } from 'emotion';

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
  return roundTo1Decimals(c.paddingLeft + (ts - (c.timelineRangeEnd - c.timelineRange)) * c.pixelsPerMs);
}

// Inverse of tsToLeft()
export function leftToTs(c: ExtendedTimelineConfig, left: number) {
  return roundTo1Decimals((left - c.paddingLeft) / c.pixelsPerMs + (c.timelineRangeEnd - c.timelineRange));
}

// The CSS top value for rendering the given BG
export function bgToTop(c: ExtendedTimelineConfig, bg: number) {
  return roundTo1Decimals(c.innerHeight - ((bg - c.bgMin) / (c.bgMax - c.bgMin)) * c.innerHeight + c.paddingTop);
}

const WIDTH_CLICKABLE = 20;
const WIDTH_LINE = 1;
const WIDTH_MAX = 150;

// Common base styles for all vertical markers.
// Some things (like colors) should be overridden before use to make them unique.
export const markerStyles = {
  root: css({
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: WIDTH_CLICKABLE,
    marginLeft: WIDTH_CLICKABLE / -2,
  }),
  verticalLine: css({
    position: 'absolute',
    top: 32,
    left: WIDTH_CLICKABLE / 2 - WIDTH_LINE / 2,
    width: WIDTH_LINE,
    bottom: 39,
    background: '#bbb',
    zIndex: -1,
  }),
  centeringWrapper: css({
    position: 'absolute',
    top: 10,
    left: (WIDTH_MAX - WIDTH_CLICKABLE) / -2,
    width: WIDTH_MAX,
    right: 0,
    textAlign: 'center',
  }),
  textLabel: css({
    border: 'none',
    borderRadius: 100,
    padding: 0,
    background: 'none',
    'font-size': '0.8em',
  }),
  numberBubble: css({
    background: 'gray',
    margin: '35px auto 0 auto',
    width: 35,
    borderRadius: '100%',
    padding: 7,
  }),
};
