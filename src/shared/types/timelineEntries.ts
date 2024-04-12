export type SensorEntryType = 'DEXCOM_G6_SHARE';
export type InsulinEntryType = 'FAST' | 'LONG';

export type SensorEntry = {
  timestamp: Date;
  bloodGlucose: number;
  type: SensorEntryType;
};

export type InsulinEntry = {
  timestamp: number;
  amount: number;
  type: InsulinEntryType;
};

export type CarbEntry = {
  timestamp: number;
  amount: number;
  speedFactor: number;
};

export type MeterEntry = {
  timestamp: number;
  bloodGlucose: number;
};

export type TimelineEntries = {
  sensorEntries: SensorEntry[];
  insulinEntries: InsulinEntry[];
  carbEntries: CarbEntry[];
  meterEntries: MeterEntry[];
};
