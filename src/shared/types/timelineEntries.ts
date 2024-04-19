export type SensorEntryType = 'DEXCOM_G6_SHARE';
export type InsulinEntryType = 'FAST' | 'LONG';

export type SensorEntry = {
  timestamp: string;
  bloodGlucose: number;
  type: SensorEntryType;
};

export type InsulinEntry = {
  timestamp: string;
  amount: number;
  type: InsulinEntryType;
};

export type CarbEntry = {
  timestamp: string;
  amount: number;
  speedFactor: number;
};

export type MeterEntry = {
  timestamp: string;
  bloodGlucose: number;
};

export type TimelineEntries = {
  sensorEntries: SensorEntry[];
  insulinEntries: InsulinEntry[];
  carbEntries: CarbEntry[];
  meterEntries: MeterEntry[];
};
