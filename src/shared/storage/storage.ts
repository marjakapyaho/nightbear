import { GlobalModel, Model, ModelOfType, ModelRef, ModelType } from 'shared/models/model';

export interface Storage {
  saveModel<T extends Model>(model: T): Promise<T>;
  saveModels<T extends Model>(models: T[], upsert?: boolean): Promise<T[]>;
  deleteModel<T extends Model>(model: T): Promise<T>;
  deleteModels<T extends Model>(models: T[]): Promise<T[]>;
  loadTimelineModels<T extends ModelType>(
    modelTypes: T[],
    range: number,
    rangeEnd: number,
  ): Promise<Array<ModelOfType<T>>>;
  loadLatestTimelineModels<T extends ModelType>(
    modelType: T,
    limit?: number,
    mustMatch?: Partial<ModelOfType<T>>,
  ): Promise<Array<ModelOfType<T>>>;
  loadLatestTimelineModel<T extends ModelType>(modelType: T): Promise<ModelOfType<T> | undefined>;
  loadGlobalModels(): Promise<GlobalModel[]>;
  loadModelRef<T extends Model>(ref: ModelRef<T>): Promise<T | undefined>;
}

export const NO_STORAGE: Storage = {
  saveModel: model => Promise.resolve(model),
  saveModels: models => Promise.resolve(models),
  deleteModel: model => Promise.resolve(model),
  deleteModels: models => Promise.resolve(models),
  loadTimelineModels: () => Promise.resolve([]),
  loadLatestTimelineModels: () => Promise.resolve([]),
  loadLatestTimelineModel: () => Promise.resolve(undefined),
  loadGlobalModels: () => Promise.resolve([]),
  loadModelRef: () => Promise.resolve(undefined),
};

export type StorageErrorDetails = Readonly<{
  saveSucceededForModels?: Model[];
  saveFailedForModels?: Array<[Model, string]>; // e.g. [ model, REV_CONFLICT_SAVE_ERROR ]
  deleteSucceededForModels?: Model[];
  deleteFailedForModels?: Array<[Model, string]>; // e.g. [ model, REV_CONFLICT_DELETE_ERROR ]
}>;
export type StorageError = Error & StorageErrorDetails;
export const isStorageError = (err: Error): err is StorageError =>
  'saveSucceededForModels' in err && 'saveFailedForModels' in err;
