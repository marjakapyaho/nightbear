export interface Sensor {
  docType: 'Sensor';
  sensorId: string; // UUID
  startTimestamp: number;
  endTimestamp: number;
  placementNote: string;
}

export interface SensorEntry {
  docType: 'SensorEntry';
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
  docType: 'Calibration';
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
  docType: 'DeviceStatus';
  deviceName: string;
  timestamp: number;
  batteryLevel: number;
  geolocation: string | null;
}

export interface Hba1c {
  docType: 'Hba1c';
  source: 'calculated' | 'measured';
  timestamp: number;
  hba1cValue: number;
}

export interface Insulin {
  docType: 'Insulin';
  timestamp: number;
  amount: number;
  insulinType: string;
}

export interface Carbs {
  docType: 'Carbs';
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
  docType: 'Alarm';
  timestamp: number;
  alarmLevel: number;
  validAfterTimestamp: number;
  situationType: Situation;
  isActive: boolean;
  pushoverReceipts: string[];
}

export interface Settings {
  docType: 'Settings';
  alarmsEnabled: boolean;
}

export interface Profile {
  docType: 'Profile';
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
