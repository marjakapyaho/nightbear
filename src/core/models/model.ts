import { ModelVersion } from 'core/models/migrations';

export const MODEL_VERSION: ModelVersion = 2;

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

type _Model<T> = Readonly<{
  modelType: T;
  modelUuid: string;
  modelMeta?: ModelMeta;
}>;

export type Sensor = _Model<'Sensor'> &
  Readonly<{
    timestamp: number;
    endTimestamp: number;
    placementNote: string;
  }>;

export type SensorEntry =
  | DexcomG6ShareEntry
  | DexcomG6SensorEntry
  | DexcomSensorEntry
  | DexcomRawSensorEntry
  | ParakeetSensorEntry;

type _SensorEntry = Readonly<{
  timestamp: number;
  bloodGlucose: number | null; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
}>;

export type DexcomG6ShareEntry = _Model<'DexcomG6ShareEntry'> &
  _SensorEntry &
  Readonly<{
    trend: number; // e.g. 4
  }>;

export type DexcomG6SensorEntry = _Model<'DexcomG6SensorEntry'> &
  _SensorEntry &
  Readonly<{
    direction: string; // e.g. "FortyFiveDown"
  }>;

export type DexcomSensorEntry = _Model<'DexcomSensorEntry'> &
  _SensorEntry &
  Readonly<{
    signalStrength: number; // i.e. "rssi"
    noiseLevel: number;
  }>;

export type DexcomRawSensorEntry = _Model<'DexcomRawSensorEntry'> &
  _SensorEntry &
  Readonly<{
    signalStrength: number; // i.e. "rssi"
    noiseLevel: number;
    rawFiltered: number;
    rawUnfiltered: number;
  }>;

export type ParakeetSensorEntry = _Model<'ParakeetSensorEntry'> &
  _SensorEntry &
  Readonly<{
    rawFiltered: number;
    rawUnfiltered: number;
  }>;

export type AnalyserEntry = Readonly<{
  timestamp: number;
  bloodGlucose: number;
  slope: number | null;
  rawSlope: number | null;
}>;

export type MeterEntry = _Model<'MeterEntry'> &
  Readonly<{
    timestamp: number;
    source: 'dexcom' | 'ui';
    bloodGlucose: number;
  }>;

export type Calibration = DexcomCalibration | NightbearCalibration;

type _Calibration = Readonly<{
  timestamp: number;
  meterEntries: Array<ModelRef<MeterEntry>>;
  isInitialCalibration: boolean;
  slope: number | null;
  intercept: number | null;
}>;

export type DexcomCalibration = _Model<'DexcomCalibration'> &
  _Calibration &
  Readonly<{
    scale: number | null;
  }>;

export type NightbearCalibration = _Model<'NightbearCalibration'> &
  _Calibration &
  Readonly<{
    sensorId: string; // UUID
    rawValueId: string; // UUID
    slopeConfidence: number;
  }>;

export type DeviceStatus = _Model<'DeviceStatus'> &
  Readonly<{
    deviceName: 'dexcom-uploader' | 'dexcom-transmitter' | 'parakeet' | 'xdrip-uploader';
    timestamp: number;
    batteryLevel: number;
    geolocation: string | null;
  }>;

export type Hba1c = _Model<'Hba1c'> &
  Readonly<{
    source: 'calculated' | 'measured';
    timestamp: number;
    hba1cValue: number;
  }>;

export type Insulin = _Model<'Insulin'> &
  Readonly<{
    timestamp: number;
    amount: number;
    insulinType: string;
  }>;

export type Carbs = _Model<'Carbs'> &
  Readonly<{
    timestamp: number;
    amount: number;
    carbsType: 'fast' | 'normal' | 'slow';
  }>;

const defaultState = {
  BATTERY: false,
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

export type AlarmState = Readonly<{
  alarmLevel: number;
  validAfterTimestamp: number;
  ackedBy: string | null;
  pushoverReceipts: string[];
}>;

export type Alarm = _Model<'Alarm'> &
  Readonly<{
    timestamp: number;
    situationType: Situation;
    isActive: boolean;
    deactivationTimestamp: number | null;
    alarmStates: [AlarmState, ...AlarmState[]];
  }>;

type _Profile = Readonly<{
  profileName: string;
  alarmsEnabled: boolean;
  analyserSettings: Readonly<{
    HIGH_LEVEL_REL: number;
    TIME_SINCE_BG_LIMIT: number; // minutes
    BATTERY_LIMIT: number;
    LOW_LEVEL_BAD: number;
    LOW_LEVEL_ABS: number;
    LOW_LEVEL_REL: number;
    HIGH_LEVEL_ABS: number;
    HIGH_LEVEL_BAD: number;
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

export type ActiveProfile = _Model<'ActiveProfile'> &
  _Profile &
  Readonly<{
    timestamp: number;
  }>;

export type SavedProfile = _Model<'SavedProfile'> &
  _Profile &
  Readonly<{
    activatedAtUtc?: Readonly<{
      hours: number;
      minutes: number;
    }>;
  }>;
