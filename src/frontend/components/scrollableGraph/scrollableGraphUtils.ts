import { roundTo1Decimals } from 'shared/calculations/calculations';

export type BaseGraphConfig = {
  timelineRange: number; // how many ms worth of timeline data are we showing
  timelineRangeEnd: number; // what's the most recent bit of timeline data we are showing (e.g. Date.now())
  paddingTop: number; // extra space above the BG scale lines
  paddingBottom: number; // extra space below the BG scale lines
  paddingLeft: number; // extra space to the left of the BG scale lines (does not move with the timeline)
  paddingRight: number; // extra space to the right of the BG scale lines (does not move with the timeline)
  outerHeight: number; // how much height from the layout should the whole timeline take (width is automatic)
  valMin: number; // lowest BG to show on the scale lines
  valMax: number; // highest BG to show on the scale lines
  valStep: number; // how often to draw a BG line
  pixelsPerTimeStep: number; // one hour of timeline data takes this many pixels of horizontal space
  showTarget: boolean;
  showCurrentValue: boolean;
  timeStep: number;
  timeFormat: string;
};

export type GraphConfig = BaseGraphConfig & {
  flooredHourStart: number; // when rendering the timescale (i.e. X-axis), this is the first full hour we need to render
  innerWidth: number; // regardless of the outer width of the timeline, within it, there will be this many pixels to scroll
  innerHeight: number; // height of the chart area (i.e. without vertical paddings)
  pixelsPerMs: number; // this is the less intuitive, but more programmatically useful version of pixelsPerTimeStep
};

export type Point = {
  timestamp: number;
  val: number | null;
  color: string;
  valTop?: number;
  valTopColor?: string;
  valBottom?: number;
  valBottomColor?: string;
};

// The CSS left value for rendering the given timestamp
export const tsToLeft = (c: GraphConfig, ts: number) => {
  return roundTo1Decimals(c.paddingLeft + (ts - (c.timelineRangeEnd - c.timelineRange)) * c.pixelsPerMs);
};

// Inverse of tsToLeft()
export const leftToTs = (c: GraphConfig, left: number) => {
  return roundTo1Decimals((left - c.paddingLeft) / c.pixelsPerMs + (c.timelineRangeEnd - c.timelineRange));
};

// The CSS top value for rendering the given value
export const valToTop = (c: GraphConfig, val: number) => {
  return roundTo1Decimals(c.innerHeight - ((val - c.valMin) / (c.valMax - c.valMin)) * c.innerHeight + c.paddingTop);
};
