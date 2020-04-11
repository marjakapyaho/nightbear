import { migrateModelIfNeeded } from 'core/models/migrations';
import { Model, ModelOfType, ModelRef, ModelType, MODEL_VERSION } from 'core/models/model';
import { is, isGlobalModel } from 'core/models/utils';
import PouchDB from 'core/storage/PouchDb';
import { Storage, StorageErrorDetails } from 'core/storage/storage';
import { extendLogger, NO_LOGGING } from 'core/utils/logging';
import { first } from 'lodash';
import { assert, assertExhausted, isNotNull } from 'server/utils/types';

export interface CouchDbModelMeta {
  readonly _id: string;
  readonly _rev: string | null;
  readonly modelVersion: number; // MODEL_VERSION at the time the Model was persisted
}

export const HIGH_UNICODE_TERMINATOR = '\uffff'; // @see https://pouchdb.com/api.html#prefix-search
export const PREFIX_TIMELINE = 'timeline';
export const PREFIX_GLOBAL = 'global';
export const REV_CONFLICT_SAVE_ERROR = 'Document update conflict.';
export const UNKNOWN_SAVE_ERROR = 'UNKNOWN_SAVE_ERROR';
export const REV_CONFLICT_DELETE_ERROR = 'Document update conflict.';
export const UNKNOWN_DELETE_ERROR = 'UNKNOWN_DELETE_ERROR';

type PouchDbResult = PouchDB.Core.Response | PouchDB.Core.Error;

const isErrorResult = (res: PouchDbResult): res is PouchDB.Core.Error => 'error' in res;
const isNotErrorResult = (res: PouchDbResult): res is PouchDB.Core.Response => !('error' in res);

export function createCouchDbStorage(
  dbUrl: string,
  options: PouchDB.Configuration.DatabaseConfiguration = {},
  logger = NO_LOGGING,
): Storage {
  assert(dbUrl, 'CouchDB storage requires a non-empty DB URL');

  const log = extendLogger(logger, 'db');
  const db = new PouchDB(dbUrl, options);
  const indexPrepLookup: { [key: string]: Promise<void> } = {};

  let self: Storage;

  return (self = {
    saveModel(model) {
      return self.saveModels([model]).then(models => {
        const model = first(models);
        if (!model) throw new Error(`No model returned after saveModels()`);
        return model;
      });
    },

    saveModels(models, upsert = false) {
      const metas = models.map(createModelMeta);
      const docs = models.map((model, i) => {
        const { _id, _rev, modelVersion } = metas[i];
        const doc: PouchDB.Core.PutDocument<Model> = {
          _id,
          _rev: _rev || undefined,
          ...{ modelType: null, modelUuid: null, modelMeta: null }, // ensure pleasant property order, for vanity (these fields get overwritten below)
          ...(model as Model), // see https://github.com/Microsoft/TypeScript/pull/13288 for why we need to cast here
          modelMeta: { modelVersion } as any, // we cheat a bit here, to allow not saving _id & _rev twice
        };
        return doc;
      });
      return Promise.resolve()
        .then(() =>
          upsert
            ? Promise.resolve()
                .then(() => db.allDocs({ keys: metas.map(meta => meta._id) }))
                .then(res => res.rows.map(row => (row.value && row.value.rev) || null))
                .then(revs =>
                  docs.map((doc, i) =>
                    revs[i] ? ({ ...doc, _rev: revs[i] } as PouchDB.Core.PutDocument<Model>) : doc,
                  ),
                )
            : docs,
        )
        .then(docs => db.bulkDocs(docs))
        .then((res: PouchDbResult[]) => {
          if (res.some(isErrorResult)) {
            const resMap = res.map(r => `  "${r.id}" => ${isErrorResult(r) ? `"${r.message}"` : 'OK'}`).join('\n');
            const errorDetails: StorageErrorDetails = {
              saveSucceededForModels: res.map((res, i) => (isNotErrorResult(res) ? models[i] : null)).filter(isNotNull),
              saveFailedForModels: res
                .map((res, i) =>
                  isErrorResult(res)
                    ? ([
                        models[i],
                        res.name === 'conflict' ? REV_CONFLICT_SAVE_ERROR : res.reason || UNKNOWN_SAVE_ERROR,
                      ] as [Model, string])
                    : null,
                )
                .filter(isNotNull),
            };
            if (res.length === 1) {
              throw Object.assign(new Error(`Couldn't save model: ${resMap.trim()}`), errorDetails);
            } else {
              throw Object.assign(new Error(`Couldn't save some models:\n${resMap}`), errorDetails);
            }
          }
          return models.map((model, i) => {
            const updatedMeta: CouchDbModelMeta = {
              ...metas[i],
              _rev: (res[i] as PouchDB.Core.Response).rev, // update the model meta with the _rev assigned by the DB
            };
            return {
              ...(model as Model), // see https://github.com/Microsoft/TypeScript/pull/13288 for why we need to cast here
              modelMeta: updatedMeta,
            } as any;
          });
        });
    },

    deleteModel(model) {
      return self.deleteModels([model]).then(models => {
        const model = first(models);
        if (!model) throw new Error(`No model returned after deleteModels()`);
        return model;
      });
    },

    deleteModels(models) {
      return Promise.resolve()
        .then(() =>
          models.map(createModelMeta).map(meta => ({
            _id: meta._id,
            _rev: meta._rev || undefined,
            _deleted: true, // https://pouchdb.com/api.html#batch_create
          })),
        )
        .then(docs => db.bulkDocs(docs))
        .then((res: PouchDbResult[]) => {
          if (res.some(isErrorResult)) {
            const resMap = res.map(r => `  "${r.id}" => ${isErrorResult(r) ? `"${r.message}"` : 'OK'}`).join('\n');
            const errorDetails: StorageErrorDetails = {
              deleteSucceededForModels: res
                .map((res, i) => (isNotErrorResult(res) ? models[i] : null))
                .filter(isNotNull),
              deleteFailedForModels: res
                .map((res, i) =>
                  isErrorResult(res)
                    ? ([
                        models[i],
                        res.name === 'conflict' ? REV_CONFLICT_DELETE_ERROR : res.reason || UNKNOWN_DELETE_ERROR,
                      ] as [Model, string])
                    : null,
                )
                .filter(isNotNull),
            };
            if (res.length === 1) {
              throw Object.assign(new Error(`Couldn't delete model: ${resMap.trim()}`), errorDetails);
            } else {
              throw Object.assign(new Error(`Couldn't delete some models:\n${resMap}`), errorDetails);
            }
          }
          return models;
        });
    },

    loadTimelineModels<T extends ModelType>(
      modelTypes: T[],
      range: number,
      rangeEnd: number,
    ): Promise<Array<ModelOfType<T>>> {
      return db
        .allDocs({
          include_docs: true,
          startkey: `${PREFIX_TIMELINE}/${timestampToString(rangeEnd - range)}`,
          endkey: `${PREFIX_TIMELINE}/${timestampToString(rangeEnd)}_`,
        })
        .then(res => res.rows.map(row => row.doc).map(reviveCouchDbRowIntoModel))
        .then(models => models.filter((model): model is ModelOfType<T> => modelTypes.includes(model.modelType as T)))
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't load timeline models (caused by\n${errObj.message}\n)`); // refine the error before giving it out
        });
    },

    loadLatestTimelineModels<T extends ModelType>(
      modelType: T,
      limit?: number,
      mustMatch?: Partial<ModelOfType<T>>,
    ): Promise<Array<ModelOfType<T>>> {
      const fields = [
        'modelType', // first, we only care about a specific modelType
        ...Object.keys(mustMatch || {}), // then, index by all the extra keys that were requested (if any)
        '_id', // finally, include "_id" in the index, so we get temporal ordering
      ];
      return Promise.resolve()
        .then(() => ensureIndexExists(fields))
        .then(() =>
          db
            .find({
              selector: { ...mustMatch, modelType },
              limit,
              sort: fields.map(name => ({ [name]: 'desc' as 'desc' })), // note: the last condition becoming { _id: 'desc' } gives us the latest first (because all preceding fields will have the same values)
            })
            .catch((errObj: PouchDB.Core.Error) => {
              throw new Error(`Couldn't query index in loadLatestTimelineModels() (caused by\n${errObj.message}\n)`); // refine the error before giving it out
            }),
        )
        .then(res => res.docs.map(reviveCouchDbRowIntoModel))
        .then(models => models.filter((model): model is ModelOfType<T> => model.modelType === modelType))
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't load latest timeline models (caused by\n${errObj.message}\n)`); // refine the error before giving it out
        });
    },

    loadLatestTimelineModel<T extends ModelType>(modelType: T): Promise<ModelOfType<T> | undefined> {
      return self.loadLatestTimelineModels(modelType, 1).then(([model]) => model);
    },

    loadGlobalModels() {
      return db
        .allDocs({
          include_docs: true,
          startkey: `${PREFIX_GLOBAL}/`,
          endkey: `${PREFIX_GLOBAL}/_`,
        })
        .then(res =>
          res.rows
            .map(row => row.doc)
            .map(reviveCouchDbRowIntoModel)
            .filter(isGlobalModel),
        )
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't load global models (caused by\n${errObj.message}\n)`); // refine the error before giving it out
        });
    },

    loadModelRef<T extends Model>(ref: ModelRef<T>): Promise<T> {
      const { modelType, modelRef } = ref;
      return db
        .get(modelRef)
        .then(reviveCouchDbRowIntoModel)
        .then(model => {
          const retrievedType = model.modelType;
          if (is(modelType)(model)) {
            return model as any; // TODO: Figure out if the generics could be made work without resorting to the any cast
          } else {
            throw new Error(`Got unexpected modelType "${retrievedType}", expecting "${modelType}"`);
          }
        })
        .catch((errObj: PouchDB.Core.Error | Error) => {
          throw new Error(`Couldn't load modelRef "${modelRef}" (caused by\n${errObj.message}\n)`); // refine the error before giving it out
        });
    },
  });

  // Promises that an index for the given fields exists in the DB; until we try, we don't know.
  // Also ensures two db.createIndex() calls aren't ran in parallel, as that can cause a document update conflict.
  function ensureIndexExists(fields: string[]): Promise<void> {
    const key = fields.join(',');
    if (!indexPrepLookup[key]) {
      log(`Running createIndex() for "${key}"`);
      indexPrepLookup[key] = Promise.resolve() // once started, don't allow others to start the creation of this specific index
        .then(() => db.createIndex({ index: { fields } }))
        .then(res => log(`Finished createIndex() for "${key}" with result "${res.result}"`))
        .catch((errObj: PouchDB.Core.Error) => {
          delete indexPrepLookup[key]; // if the operation failed, allow it to be retried later
          throw new Error(`Couldn't create index for loadLatestTimelineModels() (caused by\n${errObj.message}\n)`); // refine the error before giving it out
        });
    }
    return indexPrepLookup[key];
  }
}

// Note that here we need to do some runtime checking and/or leaps of faith, as we're at the edge of the system and the DB could (theoretically) give us anything
export function reviveCouchDbRowIntoModel(doc: any): Model {
  // Perform some basic runtime sanity checks:
  assert(typeof doc === 'object', 'Expected object when reviving model', doc);
  assert(typeof doc.modelType === 'string', 'Expected string "modelType" property when reviving', doc);
  assert(doc.modelType !== '', 'Expected non-empty "modelType" property when reviving', doc);
  assert(typeof doc.modelUuid === 'string', 'Expected string "modelUuid" property when reviving', doc);
  assert(doc.modelUuid !== '', 'Expected non-empty "modelUuid" property when reviving', doc);
  assert(typeof doc.modelMeta === 'object', 'Expected modelMeta object when reviving model', doc);
  assert(typeof doc.modelMeta.modelVersion === 'number', 'Expected a "modelVersion" property when reviving', doc);

  // Strip away the CouchDB document metadata:
  const {
    _id,
    _rev,
    modelMeta: { modelVersion },
  } = doc;
  Object.keys(doc).forEach(key => {
    if (key.startsWith('_')) delete doc[key];
  });

  // Turn into standard Model object:
  const modelPayload: Model = doc;
  const modelMeta: CouchDbModelMeta = { _id, _rev, modelVersion };
  const model = { ...modelPayload, modelMeta };

  // Run migrations if necessary:
  return migrateModelIfNeeded(model, modelVersion);
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

// Generates a unique string which can be used as a primary key for storing the given Model in the DB
// @example "timeline/2018-12-09T16:25:04.829Z/8b71dc77-42ee-4edd-8679-04fc2a3b29a5"
export function getStorageKey(model: Model): string {
  if (isModelMeta(model.modelMeta) && model.modelMeta._id) {
    return model.modelMeta._id; // the Model already has an assigned storage key -> use it
  } else if (!model.modelUuid) {
    throw new Error(`Can't generate storage key for given ${model.modelType}: it doesn't have a UUID set`);
  }
  switch (model.modelType) {
    case 'Alarm':
    case 'Sensor':
    case 'DexcomG6SensorEntry':
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
    case 'ActiveProfile':
      if (typeof model.timestamp === 'number') {
        return `${PREFIX_TIMELINE}/${timestampToString(model.timestamp)}/${model.modelUuid}`;
      } else {
        throw new Error(`Can't generate storage key for given ${model.modelType}: it doesn't have a timestamp set`);
      }
    case 'SavedProfile':
      return `${PREFIX_GLOBAL}/${model.modelType}/${model.modelUuid}`;
    default:
      return assertExhausted(model);
  }
}

// Formats the given timestamp for use in persistence-related contexts
// @example "2018-12-09T14:59:47.513Z"
// Importantly, because our queries use this for ordering, it should include milliseconds.
export function timestampToString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

// Creates a ModelRef-object (which is used to point to another Model in the DB).
// The created ref points to the given Model.
// Because ModelRef's are DB-specific, we can use the CouchDB _id here, to make subsequent lookups via the ref faster.
export function getModelRef<T extends Model>(model: T): ModelRef<T> {
  const { modelMeta } = model;
  if (isModelMeta(modelMeta) && modelMeta._id) {
    return { modelType: model.modelType, modelRef: modelMeta._id };
  } else {
    throw new Error(`Can't create ModelRef for given ${model.modelType}: it doesn't have its modelMeta set`);
  }
}
