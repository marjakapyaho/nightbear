import { Model, CouchDbModelMeta } from './model';
import { assertExhausted, assert } from './types';
import * as PouchDB from 'pouchdb';

type StoredModel<T extends Model>
  = T
  & { _id: string; _rev?: string; }
  ;

export interface Storage {
  saveModel<T extends Model>(model: T): Promise<T>;
  loadTimelineModels(fromTimePeriod: number): Promise<Model[]>;
}

export function createCouchDbStorage(dbUrl: string): Storage {
  const db = new PouchDB(dbUrl);
  return {
    saveModel<T extends Model>(model: T): Promise<T> {
      const doc: StoredModel<T> = { ...model as any, _id: getStorageKey(model) }; // see https://github.com/Microsoft/TypeScript/issues/14409 for the need for the "any"
      return db.put(doc)
        .then(() => model);
    },
    loadTimelineModels(fromTimePeriod: number): Promise<Model[]> {
      return db.allDocs({
        include_docs: true,
        startkey: `${PREFIX_TIMELINE}/${timestampToString(Date.now() - fromTimePeriod)}`,
        endkey: `${PREFIX_TIMELINE}/_`,
      })
        .then(res => res.rows.map(reviveCouchDbRowIntoModel));
    },
  };
}

// Note that here we need to do some runtime checking and/or leaps of faith, as we're at the edge of the system and the DB could (theoretically) give us anything
function reviveCouchDbRowIntoModel({ doc }: any): Model {
  // Perform some basic runtime sanity checks:
  assert(typeof doc === 'object', 'Expected object when reviving model', doc);
  assert(typeof doc.modelType === 'string', 'Expected string "modelType" property when reviving', doc);
  assert(doc.modelType !== '', 'Expected non-empty "modelType" property when reviving', doc);
  assert(doc.modelVersion === 1, 'Expected current "modelVersion" property when reviving', doc);
  // Strip away the CouchDB document metadata:
  const { _id, _rev } = doc;
  Object.keys(doc).forEach(key => {
    if (key.startsWith('_')) delete doc[key];
  });
  // Turn into standard Model object:
  const model: Model = doc;
  const modelMeta: CouchDbModelMeta = { _id, _rev };
  return { ...model, modelMeta };
}

export function stripModelMeta(model: Model): Model {
  const temp: any = model;
  delete temp.modelMeta;
  return temp;
}

const PREFIX_TIMELINE = 'timeline';
const PREFIX_OTHER = 'other';

export function getStorageKey(model: Model): string {
  switch (model.modelType) {
    case 'Alarm':
      return `${PREFIX_TIMELINE}/${timestampToString(model.creationTimestamp)}/${model.modelType}`;
    case 'Sensor':
      return `${PREFIX_TIMELINE}/${timestampToString(model.startTimestamp)}/${model.modelType}`;
    case 'DexcomSensorEntry':
    case 'DexcomRawSensorEntry':
    case 'ParakeetSensorEntry':
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
