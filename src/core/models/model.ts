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
  | SavedProfile
  | ActiveProfile;

export type ModelType = Model['modelType'];
export type ModelOfType<T extends ModelType> = Extract<Model, { modelType: T }>;
export type TimelineModel = Extract<Model, { timestamp: number }>;
export type GlobalModel = Exclude<Model, TimelineModel>;
export type TimelineModelType = TimelineModel['modelType'];

export type ModelMeta = object; // this is storage-type specific
export type ModelRef<T extends Model> = Readonly<{
  modelType: T['modelType'];
  modelRef: string; // this is storage-type specific
}>;

export type Sensor = Readonly<{
  // Model:
  modelType: 'Sensor';
  modelMeta?: ModelMeta;
  // Sensor:
  timestamp: number;
  endTimestamp: number;
  placementNote: string;
}>;

export type SensorEntry = DexcomSensorEntry | DexcomRawSensorEntry | ParakeetSensorEntry;

export type DexcomSensorEntry = Readonly<{
  // Model:
  modelType: 'DexcomSensorEntry';
  modelMeta?: ModelMeta;
  // SensorEntry:
  timestamp: number;
  bloodGlucose: number | null; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // DexcomSensorEntry:
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
}>;

export type DexcomRawSensorEntry = Readonly<{
  // Model:
  modelType: 'DexcomRawSensorEntry';
  modelMeta?: ModelMeta;
  // SensorEntry:
  timestamp: number;
  bloodGlucose: number | null; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // DexcomRawSensorEntry:
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
  rawFiltered: number;
  rawUnfiltered: number;
}>;

export type ParakeetSensorEntry = Readonly<{
  // Model:
  modelType: 'ParakeetSensorEntry';
  modelMeta?: ModelMeta;
  // SensorEntry:
  timestamp: number;
  bloodGlucose: number | null; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // ParakeetSensorEntry:
  rawFiltered: number;
  rawUnfiltered: number;
}>;

export type AnalyserEntry = Readonly<{
  timestamp: number;
  bloodGlucose: number;
  slope: number | null;
  rawSlope: number | null;
}>;

export type Calibration = DexcomCalibration | NightbearCalibration;

export type MeterEntry = Readonly<{
  modelType: 'MeterEntry';
  modelMeta?: ModelMeta;
  timestamp: number;
  source: 'dexcom' | 'ui';
  bloodGlucose: number;
}>;

export type DexcomCalibration = Readonly<{
  // Model:
  modelType: 'DexcomCalibration';
  modelMeta?: ModelMeta;
  // Calibration:
  timestamp: number;
  meterEntries: Array<ModelRef<MeterEntry>>;
  isInitialCalibration: boolean;
  slope: number | null;
  intercept: number | null;
  // DexcomCalibration:
  scale: number | null;
}>;

export type NightbearCalibration = Readonly<{
  // Model:
  modelType: 'NightbearCalibration';
  modelMeta?: ModelMeta;
  // Calibration:
  timestamp: number;
  meterEntries: Array<ModelRef<MeterEntry>>;
  isInitialCalibration: boolean;
  slope: number;
  intercept: number;
  // NightbearCalibration:
  sensorId: string; // UUID
  rawValueId: string; // UUID
  slopeConfidence: number;
}>;

export type DeviceStatus = Readonly<{
  // Model:
  modelType: 'DeviceStatus';
  modelMeta?: ModelMeta;
  // DeviceStatus:
  deviceName: 'dexcom-uploader' | 'dexcom-transmitter' | 'parakeet';
  timestamp: number;
  batteryLevel: number;
  geolocation: string | null;
}>;

export type Hba1c = Readonly<{
  // Model:
  modelType: 'Hba1c';
  modelMeta?: ModelMeta;
  // Hba1c:
  source: 'calculated' | 'measured';
  timestamp: number;
  hba1cValue: number;
}>;

export type Insulin = Readonly<{
  // Model:
  modelType: 'Insulin';
  modelMeta?: ModelMeta;
  // Insulin:
  timestamp: number;
  amount: number;
  insulinType: string;
}>;

export type Carbs = Readonly<{
  // Model:
  modelType: 'Carbs';
  modelMeta?: ModelMeta;
  // Carbs:
  timestamp: number;
  amount: number;
  carbsType: 'fast' | 'normal' | 'slow';
}>;

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

export type AlarmState = Readonly<{
  alarmLevel: number;
  validAfterTimestamp: number;
  ackedBy: string | null;
  pushoverReceipts: string[];
}>;

export type Alarm = Readonly<{
  // Model:
  modelType: 'Alarm';
  modelMeta?: ModelMeta;
  // Alarm:
  timestamp: number;
  situationType: Situation;
  isActive: boolean;
  deactivationTimestamp: number | null;
  alarmStates: [AlarmState, ...AlarmState[]];
}>;

type BaseProfile = Readonly<{
  profileName: string;
  alarmsEnabled: boolean;
  analyserSettings: Readonly<{
    HIGH_LEVEL_REL: number;
    TIME_SINCE_BG_LIMIT: number; // minutes
    BATTERY_LIMIT: number;
    LOW_LEVEL_ABS: number;
    LOW_LEVEL_REL: number;
    HIGH_LEVEL_ABS: number;
    ALARM_RETRY: number; // seconds, min in Pushover 30
    ALARM_EXPIRE: number; // seconds, max in Pushover 10800
  }>;
  alarmSettings: Readonly<
    {
      [S in Situation]: Readonly<{
        escalationAfterMinutes: number[];
        snoozeMinutes: number;
      }>;
    }
  >;
  pushoverLevels: string[];
}>;

export type ActiveProfile = BaseProfile &
  Readonly<{
    // Model:
    modelType: 'ActiveProfile';
    modelMeta?: ModelMeta;
    // ActiveProfile:
    timestamp: number;
  }>;

export type SavedProfile = BaseProfile &
  Readonly<{
    // Model:
    modelType: 'SavedProfile';
    modelMeta?: ModelMeta;
    // SavedProfile:
    activatedAtUtc?: Readonly<{
      hours: number;
      minutes: number;
    }>;
  }>;
