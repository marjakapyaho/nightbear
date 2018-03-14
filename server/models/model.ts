export const MODEL_VERSION = 1;

export type Model
  = Sensor
  | SensorEntry
  | Calibration
  | DeviceStatus
  | Hba1c
  | Insulin
  | Carbs
  | Alarm
  | Settings
  | Profile
  ;

export type ModelMeta = object; // this is storage-type specific

export interface Sensor {
  // Model:
  readonly modelType: 'Sensor';
  readonly modelMeta?: ModelMeta;
  // Sensor:
  readonly sensorId: string; // UUID
  readonly startTimestamp: number;
  readonly endTimestamp: number;
  readonly placementNote: string;
}

export type SensorEntry
  = DexcomSensorEntry
  | DexcomRawSensorEntry
  | ParakeetSensorEntry
  ;

export interface DexcomSensorEntry {
  // Model:
  readonly modelType: 'DexcomSensorEntry';
  readonly modelMeta?: ModelMeta;
  // SensorEntry:
  readonly timestamp: number;
  readonly bloodGlucose: number | null; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // DexcomSensorEntry:
  readonly signalStrength: number; // i.e. "rssi"
  readonly noiseLevel: number;
}

export interface DexcomRawSensorEntry {
  // Model:
  readonly modelType: 'DexcomRawSensorEntry';
  readonly modelMeta?: ModelMeta;
  // SensorEntry:
  readonly timestamp: number;
  readonly bloodGlucose: number | null; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // DexcomRawSensorEntry:
  readonly signalStrength: number; // i.e. "rssi"
  readonly noiseLevel: number;
  readonly rawFiltered: number;
  readonly rawUnfiltered: number;
}

export interface ParakeetSensorEntry {
  // Model:
  readonly modelType: 'ParakeetSensorEntry';
  readonly modelMeta?: ModelMeta;
  // SensorEntry:
  readonly timestamp: number;
  readonly bloodGlucose: number | null; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // ParakeetSensorEntry:
  readonly measuredAtTimestamp: number;
  readonly rawFiltered: number;
  readonly rawUnfiltered: number;
}

export interface AnalyserEntry {
  readonly timestamp: number;
  readonly bloodGlucose: number;
  readonly slope: number | null;
  readonly rawSlope: number | null;
}

export type Calibration
  = DexcomCalibration
  | NightbearCalibration
  ;

export interface MeterEntry {
  readonly bloodGlucose: number;
  readonly measuredAt: number;
}

export interface DexcomCalibration {
  // Model:
  readonly modelType: 'DexcomCalibration';
  readonly modelMeta?: ModelMeta;
  // Calibration:
  readonly timestamp: number;
  readonly meterEntries: MeterEntry[];
  readonly isInitialCalibration: boolean;
  readonly slope: number | null;
  readonly intercept: number | null;
  // DexcomCalibration:
  readonly scale: number | null;
}

export interface NightbearCalibration {
  // Model:
  readonly modelType: 'NightbearCalibration';
  readonly modelMeta?: ModelMeta;
  // Calibration:
  readonly timestamp: number;
  readonly meterEntries: MeterEntry[];
  readonly isInitialCalibration: boolean;
  readonly slope: number;
  readonly intercept: number;
  // NightbearCalibration:
  readonly sensorId: string; // UUID
  readonly rawValueId: string; // UUID
  readonly slopeConfidence: number;
}

export interface DeviceStatus {
  // Model:
  readonly modelType: 'DeviceStatus';
  readonly modelMeta?: ModelMeta;
  // DeviceStatus:
  readonly deviceName: string;
  readonly timestamp: number;
  readonly batteryLevel: number;
  readonly geolocation: string | null;
}

export interface Hba1c {
  // Model:
  readonly modelType: 'Hba1c';
  readonly modelMeta?: ModelMeta;
  // Hba1c:
  readonly source: 'calculated' | 'measured';
  readonly timestamp: number;
  readonly hba1cValue: number;
}

export interface Insulin {
  // Model:
  readonly modelType: 'Insulin';
  readonly modelMeta?: ModelMeta;
  // Insulin:
  readonly timestamp: number;
  readonly amount: number;
  readonly insulinType: string;
}

export interface Carbs {
  // Model:
  readonly modelType: 'Carbs';
  readonly modelMeta?: ModelMeta;
  // Carbs:
  readonly timestamp: number;
  readonly amount: number;
  readonly carbsType: 'fast' | 'normal' | 'slow';
}

export type Situation
  = 'BATTERY'
  | 'OUTDATED'
  | 'LOW'
  | 'FALLING'
  | 'COMPRESSION_LOW'
  | 'HIGH'
  | 'RISING'
  | 'PERSISTENT_HIGH';

export interface Alarm {
  // Model:
  readonly modelType: 'Alarm';
  readonly modelMeta?: ModelMeta;
  // Alarm:
  readonly creationTimestamp: number;
  readonly validAfterTimestamp: number;
  readonly alarmLevel: number;
  readonly situationType: Situation;
  readonly isActive: boolean;
  readonly pushoverReceipts: string[];
}

export type State = {
  [S in Situation]: false
};

export interface Settings {
  // Model:
  readonly modelType: 'Settings';
  readonly modelMeta?: ModelMeta;
  // Settings:
  readonly alarmsEnabled: boolean;
  readonly activeProfile: Profile;
}

export interface Profile {
  // Model:
  readonly modelType: 'Profile';
  readonly modelMeta?: ModelMeta;
  // Profile:
  readonly profileName: string;
  readonly activatedAtUtc: {
    readonly hours: number;
    readonly minutes: number;
  };
  readonly analyserSettings: {
    readonly HIGH_LEVEL_REL: number;
    readonly TIME_SINCE_BG_LIMIT: number; // minutes
    readonly BATTERY_LIMIT: number;
    readonly LOW_LEVEL_ABS: number;
    readonly ALARM_EXPIRE: number; // minutes
    readonly LOW_LEVEL_REL: number;
    readonly HIGH_LEVEL_ABS: number;
    readonly ALARM_RETRY: number; // minutes
  };
  readonly alarmSettings: {
    readonly [S in Situation]: {
      readonly escalationAfterMinutes: number[];
      readonly snoozeMinutes: number;
    }
  };
  readonly pushoverLevels: string[];
}
