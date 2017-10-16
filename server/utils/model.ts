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

export interface Sensor {
  // Model:
  readonly modelType: 'Sensor';
  readonly modelVersion: 1;
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
  readonly modelVersion: 1;
  // SensorEntry:
  readonly timestamp: number;
  readonly bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // DexcomSensorEntry:
  readonly signalStrength: number; // i.e. "rssi"
  readonly noiseLevel: number;
}

export interface DexcomRawSensorEntry {
  // Model:
  readonly modelType: 'DexcomRawSensorEntry';
  readonly modelVersion: 1;
  // SensorEntry:
  readonly timestamp: number;
  readonly bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // DexcomRawSensorEntry:
  readonly signalStrength: number; // i.e. "rssi"
  readonly noiseLevel: number;
  readonly rawFiltered: number;
  readonly rawUnfiltered: number;
}

export interface ParakeetSensorEntry {
  // Model:
  readonly modelType: 'ParakeetSensorEntry';
  readonly modelVersion: 1;
  // SensorEntry:
  readonly timestamp: number;
  readonly bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // ParakeetSensorEntry:
  readonly measuredAtTimestamp: number;
  readonly rawFiltered: number;
  readonly rawUnfiltered: number;
}

export type Calibration
  = DexcomCalibration
  | NightbearCalibration
  ;

export interface DexcomCalibration {
  // Model:
  readonly modelType: 'DexcomCalibration';
  readonly modelVersion: 1;
  // Calibration:
  readonly timestamp: number;
  readonly bloodGlucose: number[];
  readonly isInitialCalibration: boolean;
  readonly slope: number;
  readonly intercept: number;
  // DexcomCalibration:
  readonly scale: number;
}

export interface NightbearCalibration {
  // Model:
  readonly modelType: 'NightbearCalibration';
  readonly modelVersion: 1;
  // Calibration:
  readonly timestamp: number;
  readonly bloodGlucose: number[];
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
  readonly modelVersion: 1;
  // DeviceStatus:
  readonly deviceName: string;
  readonly timestamp: number;
  readonly batteryLevel: number;
  readonly geolocation: string | null;
}

export interface Hba1c {
  // Model:
  readonly modelType: 'Hba1c';
  readonly modelVersion: 1;
  // Hba1c:
  readonly source: 'calculated' | 'measured';
  readonly timestamp: number;
  readonly hba1cValue: number;
}

export interface Insulin {
  // Model:
  readonly modelType: 'Insulin';
  readonly modelVersion: 1;
  // Insulin:
  readonly timestamp: number;
  readonly amount: number;
  readonly insulinType: string;
}

export interface Carbs {
  // Model:
  readonly modelType: 'Carbs';
  readonly modelVersion: 1;
  // Carbs:
  readonly timestamp: number;
  readonly amount: number;
  readonly carbsType: 'fast' | 'normal' | 'slow';
}

export type Situation
  = 'OUTDATED'
  | 'HIGH'
  | 'PERSISTENT_HIGH'
  | 'LOW'
  | 'RISING'
  | 'FALLING'
  | 'BATTERY'
  ;

export interface Alarm {
  // Model:
  readonly modelType: 'Alarm';
  readonly modelVersion: 1;
  // Alarm:
  readonly creationTimestamp: number;
  readonly validAfterTimestamp: number;
  readonly alarmLevel: number;
  readonly situationType: Situation;
  readonly isActive: boolean;
  readonly pushoverReceipts: string[];
}

export interface Settings {
  // Model:
  readonly modelType: 'Settings';
  readonly modelVersion: 1;
  // Settings:
  readonly alarmsEnabled: boolean;
}

export interface Profile {
  // Model:
  readonly modelType: 'Profile';
  readonly modelVersion: 1;
  // Profile:
  readonly profileName: string;
  readonly activatedAt: {
    readonly hours: number;
    readonly minutes: number;
  };
  readonly analyserSettings: {
    readonly HIGH_LEVEL_REL: number;
    readonly TIME_SINCE_SGV_LIMIT: number;
    readonly BATTERY_LIMIT: number;
    readonly LOW_LEVEL_ABS: number;
    readonly ALARM_EXPIRE: number;
    readonly LOW_LEVEL_REL: number;
    readonly HIGH_LEVEL_ABS: number;
    readonly ALARM_RETRY: number;
  };
  readonly alarmSettings: {
    readonly [S in Situation]: {
      readonly escalationAfterMinutes: number[];
      readonly snoozeMinutes: number;
    }
  };
}
