export type AnalyserEntry = {
  timestamp: number;
  bloodGlucose: number;
  slope: number | null;
  rawSlope: number | null;
};

const defaultState = {
  OUTDATED: false,
  FALLING: false,
  RISING: false,
  LOW: false,
  BAD_LOW: false,
  COMPRESSION_LOW: false,
  HIGH: false,
  BAD_HIGH: false,
  PERSISTENT_HIGH: false,
};

export const DEFAULT_STATE: State = defaultState;

export type State = Readonly<typeof defaultState>;

export type Situation = keyof State;
