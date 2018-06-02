import { Model, ModelOfType, ModelType } from 'nightbear/core/models/model';

export interface Storage {
  saveModel<T extends Model>(model: T): Promise<T>;
  saveModels<T extends Model>(models: T[]): Promise<T[]>;
  loadTimelineModels<T extends ModelType>(modelType: T, range: number, rangeEnd: number): Promise<Array<ModelOfType<T>>>;
  loadLatestTimelineModels<T extends ModelType>(modelType: T, limit?: number): Promise<Array<ModelOfType<T>>>;
  loadGlobalModels(): Promise<Model[]>;
}

export const NO_STORAGE: Storage = {
  saveModel: model => Promise.resolve(model),
  saveModels: models => Promise.resolve(models),
  loadTimelineModels: () => Promise.resolve([]),
  loadLatestTimelineModels: () => Promise.resolve([]),
  loadGlobalModels: () => Promise.resolve([]),
};
