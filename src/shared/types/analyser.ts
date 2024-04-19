export type AnalyserEntry = {
  timestamp: string;
  bloodGlucose: number;
  slope: number | null;
  rawSlope: number | null;
};

export type State = {
  OUTDATED: boolean;
  FALLING: boolean;
  RISING: boolean;
  LOW: boolean;
  BAD_LOW: boolean;
  COMPRESSION_LOW: boolean;
  HIGH: boolean;
  BAD_HIGH: boolean;
  PERSISTENT_HIGH: boolean;
};

export type Situation = keyof State;
