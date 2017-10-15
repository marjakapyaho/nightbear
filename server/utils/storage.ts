import { Model } from './model';
import { assertExhausted } from './types';
import * as PouchDB from 'pouchdb';

export interface Storage {
  saveModel<T extends Model>(model: T): Promise<T>;
}

export function createCouchDbStorage(dbUrl: string): Storage {
  const db = new PouchDB(dbUrl);
  return {
    saveModel<T extends Model>(model: T): Promise<T> {
      const doc = { ...model as any, _id: getStorageKey(model) }; // see https://github.com/Microsoft/TypeScript/issues/14409 for the need for the "any"
      return db.put(doc)
        .then(() => model);
    },
  };
}

const PREFIX_TIMELINE = 'timeline';
const PREFIX_OTHER = 'other';

export function getStorageKey(model: Model): string {
  switch (model.modelType) {
    case 'Alarm':
      return `${PREFIX_TIMELINE}/${timestampToString(model.creationTimestamp)}/${model.modelType}`;
    case 'Sensor':
      return `${PREFIX_TIMELINE}/${timestampToString(model.startTimestamp)}/${model.modelType}`;
    case 'DexcomSensorValue':
    case 'DexcomRawSensorValue':
    case 'ParakeetSensorValue':
    case 'DexcomCalibration':
    case 'NightbearCalibration':
    case 'DeviceStatus':
    case 'Insulin':
    case 'Carbs':
    case 'Hba1c':
      return `${PREFIX_TIMELINE}/${timestampToString(model.timestamp)}/${model.modelType}`;
    case 'Settings':
      return `${PREFIX_OTHER}/${model.modelType}`;
    case 'Profile':
      return `${PREFIX_OTHER}/${model.modelType}/${model.profileName}`;
    default:
      return assertExhausted(model);
  }
}

function timestampToString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
