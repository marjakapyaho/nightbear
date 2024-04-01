export type SensorEntry = {
  timestamp: number;
  bloodGlucose: number;
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
