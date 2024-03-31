import { roundTo1Decimals } from 'shared/calculations/calculations';
import { isNotNull } from 'backend/utils/types';

export type BaseGraphConfig = {
  timelineRange: number; // How many ms worth of graph data are we showing
  timelineRangeEnd: number; // What's the most recent bit of graph data we are showing (e.g. Date.now())
  paddingTop: number; // Extra space above the BG scale lines
  paddingBottom: number; // Extra space below the BG scale lines
  paddingLeft: number; // Extra space to the left of the scale lines (does not move with the graph)
  paddingRight: number; // Extra space to the right of the scale lines (does not move with the graph)
  outerHeight: number; // How much height from the layout should the whole graph take (width is automatic)
  valMin: number; // Lowest value to show on the scale lines
  valMax: number; // Highest value to show on the scale lines
  valStep: number; // How often to draw a value line
  timeStep: number; // Step unit for timescale (e.g. HOUR_IN_MILLIS, DAY_IN_MILLIS)
  pixelsPerTimeStep: number; // One step of timeline data takes this many pixels of horizontal space
  timeFormat: string; // Format for timescale labels
  showEveryNthTimeLabel: number; // Only show every n:th time label
  showTarget: boolean; // Show target area (used for blood glucose)
  showCurrentValue: boolean; // Show current value (used for blood glucose)
};

export type GraphConfig = BaseGraphConfig & {
  flooredHourStart: number; // When rendering the timescale (i.e. X-axis), this is the first full time unit we need to render
  innerWidth: number; // Regardless of the outer width of the timeline, within it, there will be this many pixels to scroll
  innerHeight: number; // Height of the chart area (i.e. without vertical paddings)
  pixelsPerMs: number; // This is the less intuitive, but more programmatically useful version of pixelsPerTimeStep
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

export const getGraphConfig = (baseConfig: BaseGraphConfig): GraphConfig => {
  const {
    pixelsPerTimeStep,
    timeStep,
    timelineRangeEnd,
    timelineRange,
    outerHeight,
    paddingRight,
    paddingLeft,
    paddingTop,
    paddingBottom,
  } = baseConfig;
  const pixelsPerMs = pixelsPerTimeStep / timeStep;

  return {
    ...baseConfig,
    flooredHourStart: Math.floor((timelineRangeEnd - timelineRange) / timeStep) * timeStep,
    innerWidth: Math.round(pixelsPerMs * timelineRange) + paddingLeft + paddingRight,
    innerHeight: outerHeight - paddingTop - paddingBottom,
    pixelsPerMs,
  };
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

export const mapGraphPointsForPolyline = (graphPoints: Point[], config: GraphConfig) =>
  graphPoints
    .map(point => (isNotNull(point.val) ? [tsToLeft(config, point.timestamp), valToTop(config, point.val)].join() : ''))
    .join(' ');
