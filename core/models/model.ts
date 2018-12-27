export const MODEL_VERSION = 1;

export type Model =
  | Sensor
  | SensorEntry
  | Calibration
  | DeviceStatus
  | Hba1c
  | MeterEntry
  | Insulin
  | Carbs
  | Alarm
  | Settings
  | Profile;

export type ModelType = Model['modelType'];
export type ModelOfType<T extends ModelType> = Extract<Model, { modelType: T }>;
export type TimelineModel = Extract<Model, { timestamp: number }>;
export type TimelineModelType = TimelineModel['modelType'];

export type ModelMeta = object; // this is storage-type specific
export type ModelRef<T extends Model> = {
  readonly modelType: T['modelType'];
  readonly modelRef: string; // this is storage-type specific
};

export interface Sensor {
  // Model:
  readonly modelType: 'Sensor';
  readonly modelMeta?: ModelMeta;
  // Sensor:
  readonly timestamp: number;
  readonly endTimestamp: number;
  readonly placementNote: string;
}

export type SensorEntry = DexcomSensorEntry | DexcomRawSensorEntry | ParakeetSensorEntry;

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
  readonly rawFiltered: number;
  readonly rawUnfiltered: number;
}

export interface AnalyserEntry {
  readonly timestamp: number;
  readonly bloodGlucose: number;
  readonly slope: number | null;
  readonly rawSlope: number | null;
}

export type Calibration = DexcomCalibration | NightbearCalibration;

export interface MeterEntry {
  readonly modelType: 'MeterEntry';
  readonly modelMeta?: ModelMeta;
  readonly timestamp: number;
  readonly source: 'dexcom' | 'ui';
  readonly bloodGlucose: number;
}

export interface DexcomCalibration {
  // Model:
  readonly modelType: 'DexcomCalibration';
  readonly modelMeta?: ModelMeta;
  // Calibration:
  readonly timestamp: number;
  readonly meterEntries: Array<ModelRef<MeterEntry>>;
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
  readonly meterEntries: Array<ModelRef<MeterEntry>>;
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
  readonly deviceName: 'dexcom-uploader' | 'dexcom-transmitter' | 'parakeet';
  readonly timestamp: number;
  readonly batteryLevel: number;
  readonly geolocation: string | null;
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

const defaultState = {
  BATTERY: false,
  OUTDATED: false,
  LOW: false,
  FALLING: false,
  COMPRESSION_LOW: false,
  HIGH: false,
  RISING: false,
  PERSISTENT_HIGH: false,
};

export const DEFAULT_STATE: State = defaultState;

export type State = Readonly<typeof defaultState>;

export type Situation = keyof State;

export interface Alarm {
  // Model:
  readonly modelType: 'Alarm';
  readonly modelMeta?: ModelMeta;
  // Alarm:
  readonly timestamp: number;
  readonly validAfterTimestamp: number;
  readonly alarmLevel: number;
  readonly situationType: Situation;
  readonly isActive: boolean;
  readonly pushoverReceipts: string[];
}

export interface Settings {
  // Model:
  readonly modelType: 'Settings';
  readonly modelMeta?: ModelMeta;
  // Settings:
  readonly timestamp: number;
  readonly profileName: string;
  readonly alarmsEnabled: boolean;
  readonly analyserSettings: {
    readonly HIGH_LEVEL_REL: number;
    readonly TIME_SINCE_BG_LIMIT: number; // minutes
    readonly BATTERY_LIMIT: number;
    readonly LOW_LEVEL_ABS: number;
    readonly LOW_LEVEL_REL: number;
    readonly HIGH_LEVEL_ABS: number;
    readonly ALARM_RETRY: number; // seconds, min in Pushover 30
    readonly ALARM_EXPIRE: number; // seconds, max in Pushover 10800
  };
  readonly alarmSettings: {
    readonly [S in Situation]: {
      readonly escalationAfterMinutes: number[];
      readonly snoozeMinutes: number;
    }
  };
  readonly pushoverLevels: string[];
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>; // https://stackoverflow.com/a/48216010

export interface Profile {
  // Model:
  readonly modelType: 'Profile';
  readonly modelMeta?: ModelMeta;
  // Profile:
  readonly activatedAtUtc?: {
    readonly hours: number;
    readonly minutes: number;
  };
  readonly activateSettings: Omit<Settings, 'modelType' | 'modelMeta' | 'timestamp'>; // some properties of Settings don't make sense here
}
