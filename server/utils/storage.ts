import { Model, CouchDbModelMeta, MODEL_VERSION } from './model';
import { assertExhausted, assert } from './types';
import * as PouchDB from 'pouchdb';

export interface Storage {
  saveModel<T extends Model>(model: T): Promise<T>;
  loadTimelineModels(fromTimePeriod: number): Promise<Model[]>;
  loadOtherModels(): Promise<Model[]>;
}

function createModelMeta(model: Model): CouchDbModelMeta {
  return {
    _id: getStorageKey(model),
    _rev: model.modelMeta && model.modelMeta._rev || null, // use existing _rev for Models that have already been saved before
    modelVersion: MODEL_VERSION, // note that the version is fixed because since we're saving, the Model will be of the latest version
  };
}

export function createCouchDbStorage(dbUrl: string): Storage {
  const db = new PouchDB(dbUrl);
  return {
    saveModel<T extends Model>(model: T) {
      const modelMeta = createModelMeta(model);
      const { _id, _rev, modelVersion } = modelMeta;
      const doc: PouchDB.Core.PutDocument<Model> = {
        ...model as Model, // see https://github.com/Microsoft/TypeScript/pull/13288 for why we need to cast here
        _id,
        _rev: _rev || undefined,
        modelMeta: { modelVersion } as any, // we cheat a bit here, to allow not saving _id & _rev twice
      };
      return db.put(doc) // save the doc in the DB
        .then(res => {
          const updatedMeta = { ...modelMeta, _rev: res.rev }; // update the model with the _rev assigned by the DB
          return { ...model as Model, modelMeta: updatedMeta } as T; // see https://github.com/Microsoft/TypeScript/pull/13288 for why we need to cast here
        })
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't save model "${modelMeta._id}": ${errObj.message}`); // refine the error before giving it out
        });
    },
    loadTimelineModels(fromTimePeriod) {
      return db.allDocs({
        include_docs: true,
        startkey: `${PREFIX_TIMELINE}/${timestampToString(Date.now() - fromTimePeriod)}`,
        endkey: `${PREFIX_TIMELINE}/_`,
      })
        .then(res => res.rows.map(reviveCouchDbRowIntoModel))
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't load timeline models: ${errObj.message}`); // refine the error before giving it out
        });
    },
    loadOtherModels() {
      return db.allDocs({
        include_docs: true,
        startkey: `${PREFIX_OTHER}/`,
        endkey: `${PREFIX_OTHER}/_`,
      })
        .then(res => res.rows.map(reviveCouchDbRowIntoModel))
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't load other models: ${errObj.message}`); // refine the error before giving it out
        });
    },
  };
}

// Note that here we need to do some runtime checking and/or leaps of faith, as we're at the edge of the system and the DB could (theoretically) give us anything
function reviveCouchDbRowIntoModel({ doc }: any): Model {
  // Perform some basic runtime sanity checks:
  assert(typeof doc === 'object', 'Expected object when reviving model', doc);
  assert(typeof doc.modelType === 'string', 'Expected string "modelType" property when reviving', doc);
  assert(doc.modelType !== '', 'Expected non-empty "modelType" property when reviving', doc);
  assert(typeof doc.modelMeta === 'object', 'Expected modelMeta object when reviving model', doc);
  assert(typeof doc.modelMeta.modelVersion === 'number', 'Expected a "modelVersion" property when reviving', doc);
  // Strip away the CouchDB document metadata:
  const { _id, _rev, modelMeta: { modelVersion } } = doc;
  Object.keys(doc).forEach(key => {
    if (key.startsWith('_')) delete doc[key];
  });
  // Turn into standard Model object:
  const model: Model = doc;
  const modelMeta: CouchDbModelMeta = { _id, _rev, modelVersion };
  return { ...model, modelMeta };
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
