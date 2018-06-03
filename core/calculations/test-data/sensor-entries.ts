import { MIN_IN_MS } from '../calculations';
import { SensorEntry } from 'nightbear/core/models/model';

const currentTimestamp = 1508672249758;

export const sensorEntries1: SensorEntry[] = [
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 35 * MIN_IN_MS,
    bloodGlucose: 6,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 30 * MIN_IN_MS,
    bloodGlucose: 6,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 25 * MIN_IN_MS,
    bloodGlucose: 6,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 20 * MIN_IN_MS,
    bloodGlucose: 8,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 15 * MIN_IN_MS,
    bloodGlucose: 7,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 10 * MIN_IN_MS,
    bloodGlucose: 7,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 5 * MIN_IN_MS,
    bloodGlucose: 8,
    signalStrength: 1,
    noiseLevel: 1,
  },
];

export const sensorEntries2: SensorEntry[] = [
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 35 * MIN_IN_MS,
    bloodGlucose: 14,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 30 * MIN_IN_MS,
    bloodGlucose: 11,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 25 * MIN_IN_MS,
    bloodGlucose: 11.5,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 20 * MIN_IN_MS,
    bloodGlucose: 12.5,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 15 * MIN_IN_MS,
    bloodGlucose: 13.1,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 10 * MIN_IN_MS,
    bloodGlucose: 12,
    signalStrength: 1,
    noiseLevel: 1,
  },
  {
    modelType: 'DexcomSensorEntry',
    timestamp: currentTimestamp - 5 * MIN_IN_MS,
    bloodGlucose: 10,
    signalStrength: 1,
    noiseLevel: 1,
  },
];
