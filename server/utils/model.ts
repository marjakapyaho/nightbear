export interface Sensor {
  modelType: 'Sensor';
  modelVersion: 1;
  sensorId: string; // UUID
  startTimestamp: number;
  endTimestamp: number;
  placementNote: string;
}

export interface DexcomSensorValue {
  modelType: 'DexcomSensorValue';
  modelVersion: 1;
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
}

export interface DexcomRawSensorValue {
  modelType: 'DexcomRawSensorValue';
  modelVersion: 1;
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
  rawFiltered: number;
  rawUnfiltered: number;
}

export interface ParakeetSensorValue {
  modelType: 'ParakeetSensorValue';
  modelVersion: 1;
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  rawFiltered: number;
  rawUnfiltered: number;
}

export interface DexcomCalibration {
  modelType: 'DexcomCalibration';
  modelVersion: 1;
  timestamp: number;
  bloodGlucose: number[];
  isInitialCalibration: boolean;
  slope: number;
  intercept: number;
  scale: number;
}

export interface NightbearCalibration {
  modelType: 'NightbearCalibration';
  modelVersion: 1;
  timestamp: number;
  bloodGlucose: number[];
  isInitialCalibration: boolean;
  slope: number;
  intercept: number;
  sensorId: string; // UUID
  rawValueId: string; // UUID
  slopeConfidence: number;
}

export interface DeviceStatus {
  modelType: 'DeviceStatus';
  modelVersion: 1;
  deviceName: string;
  timestamp: number;
  batteryLevel: number;
  geolocation: string | null;
}

export interface Hba1c {
  modelType: 'Hba1c';
  modelVersion: 1;
  source: 'calculated' | 'measured';
  timestamp: number;
  hba1cValue: number;
}

export interface Insulin {
  modelType: 'Insulin';
  modelVersion: 1;
  timestamp: number;
  amount: number;
  insulinType: string;
}

export interface Carbs {
  modelType: 'Carbs';
  modelVersion: 1;
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
  modelType: 'Alarm';
  modelVersion: 1;
  timestamp: number;
  alarmLevel: number;
  validAfterTimestamp: number;
  situationType: Situation;
  isActive: boolean;
  pushoverReceipts: string[];
}

export interface Settings {
  modelType: 'Settings';
  modelVersion: 1;
  alarmsEnabled: boolean;
}

export interface Profile {
  modelType: 'Profile';
  modelVersion: 1;
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
