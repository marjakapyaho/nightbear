// @see https://github.com/pouchdb/pouchdb/issues/6692
import PouchDBDefault from 'pouchdb';
// tslint:disable-next-line:no-var-requires
const PouchDB = PouchDBDefault || require('pouchdb');

import * as PouchDBFind from 'pouchdb-find';
import { Storage } from './storage';
import { Model, MODEL_VERSION, ModelOfType, ModelType } from 'core/models/model';
import { assert, assertExhausted } from 'server/utils/types';

PouchDB.plugin(PouchDBFind);

export interface CouchDbModelMeta {
  readonly _id: string;
  readonly _rev: string | null;
  readonly modelVersion: number; // MODEL_VERSION at the time the Model was persisted
}

const PREFIX_TIMELINE = 'timeline';
const PREFIX_GLOBAL = 'global';

type PouchDbResult = PouchDB.Core.Response | PouchDB.Core.Error;

const isErrorResult = (res: PouchDbResult): res is PouchDB.Core.Error => 'error' in res;

export function createCouchDbStorage(dbUrl: string, options: PouchDB.Configuration.DatabaseConfiguration = {}): Storage {
  assert(dbUrl, 'CouchDB storage requires a non-empty DB URL');

  const db = new PouchDB(dbUrl, options);

  let self: Storage;

  return self = {

    saveModel(model) {
      return self.saveModels([ model ]).then(models => models[0]);
    },

    saveModels(models) {
      const metas = models.map(createModelMeta);
      const docs = models.map((model, i) => {
        const { _id, _rev, modelVersion } = metas[i];
        const doc: PouchDB.Core.PutDocument<Model> = {
          ...model as Model, // see https://github.com/Microsoft/TypeScript/pull/13288 for why we need to cast here
          _id,
          _rev: _rev || undefined,
          modelMeta: { modelVersion } as any, // we cheat a bit here, to allow not saving _id & _rev twice
        };
        return doc;
      });
      return db.bulkDocs(docs)
        .then((res: PouchDbResult[]) => {
          if (res.some(isErrorResult)) {
            const resMap = res.map(r => `  "${r.id}" => ${isErrorResult(r) ? `"${r.message}"` : 'OK'}`).join('\n');
            if (res.length === 1) {
              throw new Error(`Couldn't save model: ${resMap.trim()}`);
            } else {
              throw new Error(`Couldn't save some models:\n${resMap}`);
            }
          }
          return models.map((model, i) => {
            const updatedMeta: CouchDbModelMeta = {
              ...metas[i],
              _rev: (res[i] as PouchDB.Core.Response).rev, // update the model meta with the _rev assigned by the DB
            };
            return {
              ...model as Model, // see https://github.com/Microsoft/TypeScript/pull/13288 for why we need to cast here
              modelMeta: updatedMeta,
            } as any;
          });
        });
    },

    loadTimelineModels<T extends ModelType>(modelType: T, range: number, rangeEnd: number): Promise<Array<ModelOfType<T>>> {
      return db.allDocs({
        include_docs: true,
        startkey: `${PREFIX_TIMELINE}/${timestampToString(rangeEnd - range)}`,
        endkey: `${PREFIX_TIMELINE}/${timestampToString(rangeEnd)}`,
      })
        .then(res => res.rows.map(row => row.doc).map(reviveCouchDbRowIntoModel))
        .then(models => models.filter((model): model is ModelOfType<T> => model.modelType === modelType))
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't load timeline models: ${errObj.message}`); // refine the error before giving it out
        });
    },

    loadLatestTimelineModels<T extends ModelType>(modelType: T, limit?: number): Promise<Array<ModelOfType<T>>> {
      return Promise.resolve()
        .then(() =>
          db.createIndex({
            index: { fields: [ 'modelType', '_id' ] }, // index first by "modelType", and then by "_id", since that gives us temporal ordering
          }).catch((errObj: PouchDB.Core.Error) => {
            throw new Error(`Couldn't create index: ${errObj.message}`); // refine the error before giving it out
          }),
        )
        .then(res => {
          if (res.result !== 'exists') {
            // TODO: log res as info/warning
          }
        })
        .then(() =>
          db.find({
            selector: { modelType },
            limit,
            sort: [{ modelType: 'desc' }, { _id: 'desc' }], // { _id: 'desc' } gives us the latest first
          }).catch((errObj: PouchDB.Core.Error) => {
            throw new Error(`Couldn't query index: ${errObj.message}`); // refine the error before giving it out
          }),
        )
        .then(res => res.docs.map(reviveCouchDbRowIntoModel))
        .then(models => models.filter((model): model is ModelOfType<T> => model.modelType === modelType))
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't load latest timeline models: ${errObj.message}`); // refine the error before giving it out
        });
    },

    loadGlobalModels() {
      return db.allDocs({
        include_docs: true,
        startkey: `${PREFIX_GLOBAL}/`,
        endkey: `${PREFIX_GLOBAL}/_`,
      })
        .then(res => res.rows.map(row => row.doc).map(reviveCouchDbRowIntoModel))
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't load global models: ${errObj.message}`); // refine the error before giving it out
        });
    },

  };
}

// Note that here we need to do some runtime checking and/or leaps of faith, as we're at the edge of the system and the DB could (theoretically) give us anything
export function reviveCouchDbRowIntoModel(doc: any): Model {

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

function isModelMeta(meta: any): meta is CouchDbModelMeta {
  return typeof meta === 'object' && meta['_id'];
}

function createModelMeta(model: Model): CouchDbModelMeta {
  const meta = isModelMeta(model.modelMeta) ? model.modelMeta : null;
  return {
    _id: getStorageKey(model),
    _rev: meta ? meta._rev : null, // use existing _rev for Models that have already been saved before
    modelVersion: MODEL_VERSION, // note that the version is fixed because since we're saving, the Model will be of the latest version
  };
}

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
    case 'MeterEntry':
    case 'Insulin':
    case 'Carbs':
    case 'Hba1c':
      return `${PREFIX_TIMELINE}/${timestampToString(model.timestamp)}/${model.modelType}`;
    case 'Settings':
      return `${PREFIX_GLOBAL}/${model.modelType}`;
    case 'Profile':
      return `${PREFIX_GLOBAL}/${model.modelType}/${model.profileName}`;
    default:
      return assertExhausted(model);
  }
}

function timestampToString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
