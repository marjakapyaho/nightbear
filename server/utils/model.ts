export type Model
  = Sensor
  | SensorValue
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
  modelType: 'Sensor';
  modelVersion: 1;
  // Sensor:
  sensorId: string; // UUID
  startTimestamp: number;
  endTimestamp: number;
  placementNote: string;
}

export type SensorValue
  = DexcomSensorValue
  | DexcomRawSensorValue
  | ParakeetSensorValue
  ;

export interface DexcomSensorValue {
  // Model:
  modelType: 'DexcomSensorValue';
  modelVersion: 1;
  // SensorValue:
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // DexcomSensorValue:
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
}

export interface DexcomRawSensorValue {
  // Model:
  modelType: 'DexcomRawSensorValue';
  modelVersion: 1;
  // SensorValue:
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // DexcomRawSensorValue:
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
  rawFiltered: number;
  rawUnfiltered: number;
}

export interface ParakeetSensorValue {
  // Model:
  modelType: 'ParakeetSensorValue';
  modelVersion: 1;
  // SensorValue:
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  // ParakeetSensorValue:
  rawFiltered: number;
  rawUnfiltered: number;
}

export type Calibration
  = DexcomCalibration
  | NightbearCalibration
  ;

export interface DexcomCalibration {
  // Model:
  modelType: 'DexcomCalibration';
  modelVersion: 1;
  // Calibration:
  timestamp: number;
  bloodGlucose: number[];
  isInitialCalibration: boolean;
  slope: number;
  intercept: number;
  // DexcomCalibration:
  scale: number;
}

export interface NightbearCalibration {
  // Model:
  modelType: 'NightbearCalibration';
  modelVersion: 1;
  // Calibration:
  timestamp: number;
  bloodGlucose: number[];
  isInitialCalibration: boolean;
  slope: number;
  intercept: number;
  // NightbearCalibration:
  sensorId: string; // UUID
  rawValueId: string; // UUID
  slopeConfidence: number;
}

export interface DeviceStatus {
  // Model:
  modelType: 'DeviceStatus';
  modelVersion: 1;
  // DeviceStatus:
  deviceName: string;
  timestamp: number;
  batteryLevel: number;
  geolocation: string | null;
}

export interface Hba1c {
  // Model:
  modelType: 'Hba1c';
  modelVersion: 1;
  // Hba1c:
  source: 'calculated' | 'measured';
  timestamp: number;
  hba1cValue: number;
}

export interface Insulin {
  // Model:
  modelType: 'Insulin';
  modelVersion: 1;
  // Insulin:
  timestamp: number;
  amount: number;
  insulinType: string;
}

export interface Carbs {
  // Model:
  modelType: 'Carbs';
  modelVersion: 1;
  // Carbs:
  timestamp: number;
  amount: number;
  carbsType: 'fast' | 'normal' | 'slow';
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
  modelType: 'Alarm';
  modelVersion: 1;
  // Alarm:
  creationTimestamp: number;
  validAfterTimestamp: number;
  alarmLevel: number;
  situationType: Situation;
  isActive: boolean;
  pushoverReceipts: string[];
}

export interface Settings {
  // Model:
  modelType: 'Settings';
  modelVersion: 1;
  // Settings:
  alarmsEnabled: boolean;
}

export interface Profile {
  // Model:
  modelType: 'Profile';
  modelVersion: 1;
  // Profile:
  profileName: string;
  activatedAt: {
    hours: number;
    minutes: number;
  };
  analyserSettings: {
    HIGH_LEVEL_REL: number;
    TIME_SINCE_SGV_LIMIT: number;
    BATTERY_LIMIT: number;
    LOW_LEVEL_ABS: number;
    ALARM_EXPIRE: number;
    LOW_LEVEL_REL: number;
    HIGH_LEVEL_ABS: number;
    ALARM_RETRY: number;
  };
  alarmSettings: {
    [S in Situation]: {
      escalationAfterMinutes: number[];
      snoozeMinutes: number;
    }
  };
}
