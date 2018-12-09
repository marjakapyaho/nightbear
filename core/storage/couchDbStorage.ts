import { Model, MODEL_VERSION, ModelOfType, ModelType } from 'core/models/model';
import PouchDB from 'core/storage/PouchDb';
import { Storage, StorageErrorDetails } from 'core/storage/storage';
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

type PouchDbResult = PouchDB.Core.Response | PouchDB.Core.Error;

const isErrorResult = (res: PouchDbResult): res is PouchDB.Core.Error => 'error' in res;
const isNotErrorResult = (res: PouchDbResult): res is PouchDB.Core.Response => !('error' in res);

export function createCouchDbStorage(
  dbUrl: string,
  options: PouchDB.Configuration.DatabaseConfiguration = {},
): Storage {
  assert(dbUrl, 'CouchDB storage requires a non-empty DB URL');

  const db = new PouchDB(dbUrl, options);

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
          ...(model as Model), // see https://github.com/Microsoft/TypeScript/pull/13288 for why we need to cast here
          _id,
          _rev: _rev || undefined,
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

    loadTimelineModels<T extends ModelType>(
      modelType: T,
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
        .then(models => models.filter((model): model is ModelOfType<T> => model.modelType === modelType))
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
        .then(() =>
          db
            .createIndex({
              index: { fields },
            })
            .catch((errObj: PouchDB.Core.Error) => {
              throw new Error(`Couldn't create index for loadLatestTimelineModels() (caused by\n${errObj.message}\n)`); // refine the error before giving it out
            }),
        )
        .then(res => {
          if (res.result !== 'exists') {
            // TODO: log res as info/warning
          }
        })
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
        .then(res => res.rows.map(row => row.doc).map(reviveCouchDbRowIntoModel))
        .catch((errObj: PouchDB.Core.Error) => {
          throw new Error(`Couldn't load global models (caused by\n${errObj.message}\n)`); // refine the error before giving it out
        });
    },
  });
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
  const {
    _id,
    _rev,
    modelMeta: { modelVersion },
  } = doc;
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
      return `${PREFIX_TIMELINE}/${timestampToString(model.timestamp)}/${model.modelType}`;
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

// Generates a random string for similar purposes as UUID's, but easier for a human to remember.
// @example generateUniqueId(8) => "TEvGnkwr"
export function generateUniqueId(length = 8): string {
  let uid = '';
  while (uid.length < length) {
    const char = String.fromCharCode(Math.round(Math.random() * 255));
    if (!char.match(/[9-9a-zA-Z]/)) continue; // result space: 0-9 + a-z + A-Z = 10 + 26 + 26 = 62
    uid += char;
  }
  return uid; // possible permutations: 62^8 ~= 2.18e+14 ~= 218 trillion = enough
}
