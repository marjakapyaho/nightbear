export type BloodGlucoseEntryType = 'DEXCOM_G6_SHARE' | 'MANUAL';

export type SensorEntry = {
  id: string;
  timestamp: Date;
  bloodGlucose: number;
  type: BloodGlucoseEntryType;
};

export type InsulinEntry = {
  timestamp: number;
  amount: number;
};

export type CarbEntry = {
  timestamp: number;
  amount: number;
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
