export interface Sensor {
  modelType: 'Sensor';
  sensorId: string; // UUID
  startTimestamp: number;
  endTimestamp: number;
  placementNote: string;
}

export interface DexcomSensorEntry {
  modelType: 'DexcomSensorEntry';
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
}

export interface DexcomRawSensorEntry {
  modelType: 'DexcomRawSensorEntry';
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
  rawFiltered: number;
  rawUnfiltered: number;
}

export interface ParakeetSensorEntry {
  modelType: 'ParakeetSensorEntry';
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
  rawFiltered: number;
  rawUnfiltered: number;
}

export interface DexcomCalibration {
  modelType: 'DexcomCalibration';
  timestamp: number;
  bloodGlucose: number[];
  isInitialCalibration: boolean;
  slope: number;
  intercept: number;
  scale: number;
}

export interface NightbearCalibration {
  modelType: 'NightbearCalibration';
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
  deviceName: string;
  timestamp: number;
  batteryLevel: number;
  geolocation: string | null;
}

export interface Hba1c {
  modelType: 'Hba1c';
  source: 'calculated' | 'measured';
  timestamp: number;
  hba1cValue: number;
}

export interface Insulin {
  modelType: 'Insulin';
  timestamp: number;
  amount: number;
  insulinType: string;
}

export interface Carbs {
  modelType: 'Carbs';
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
  timestamp: number;
  alarmLevel: number;
  validAfterTimestamp: number;
  situationType: Situation;
  isActive: boolean;
  pushoverReceipts: string[];
}

export interface Settings {
  modelType: 'Settings';
  alarmsEnabled: boolean;
}

export interface Profile {
  modelType: 'Profile';
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
