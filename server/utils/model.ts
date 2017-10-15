export interface Sensor {
  modelType: 'Sensor';
  sensorId: string; // UUID
  startTimestamp: number;
  endTimestamp: number;
  placementNote: string;
}

export interface SensorEntry {
  modelType: 'SensorEntry';
  timestamp: number;
  bloodGlucose: number; // in mmol/L (as opposed to mg/dL, as used by Dexcom)
}

export interface DexcomSensorEntry extends SensorEntry {
  sensorEntryType: 'DexcomSensorEntry';
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
}

export interface DexcomRawSensorEntry extends SensorEntry {
  sensorEntryType: 'DexcomRawSensorEntry';
  signalStrength: number; // i.e. "rssi"
  noiseLevel: number;
  rawFiltered: number;
  rawUnfiltered: number;
}

export interface ParakeetSensorEntry extends SensorEntry {
  sensorEntryType: 'ParakeetSensorEntry';
  rawFiltered: number;
  rawUnfiltered: number;
}

export interface Calibration {
  modelType: 'Calibration';
  timestamp: number;
  bloodGlucose: number[];
  isInitialCalibration: boolean;
  slope: number;
  intercept: number;
}

export interface DexcomCalibration extends Calibration {
  calibrationType: 'DexcomCalibration';
  scale: number;
}

export interface NightbearCalibration extends Calibration {
  calibrationType: 'NightbearCalibration';
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
