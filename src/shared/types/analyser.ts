export type AnalyserEntry = {
  timestamp: string;
  bloodGlucose: number;
  slope: number | null;
  rawSlope: number | null;
};

export type Situation =
  | 'CRITICAL_OUTDATED'
  | 'BAD_LOW'
  | 'BAD_HIGH'
  | 'OUTDATED'
  | 'COMPRESSION_LOW'
  | 'LOW'
  | 'HIGH'
  | 'FALLING'
  | 'RISING'
  | 'PERSISTENT_HIGH';
