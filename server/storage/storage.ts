import { Model } from '../models/model';

export interface Storage {
  saveModel<T extends Model>(model: T): Promise<T>;
  saveModels<T extends Model>(models: T[]): Promise<T[]>;
  loadTimelineModels(fromTimePeriod: number): Promise<Model[]>;
  loadLatestTimelineModels(modelType: Model['modelType'], limit?: number): Promise<Model[]>;
  loadGlobalModels(): Promise<Model[]>;
}

export const NO_STORAGE: Storage = {
  saveModel: model => Promise.resolve(model),
  saveModels: models => Promise.resolve(models),
  loadTimelineModels: () => Promise.resolve([]),
  loadLatestTimelineModels: () => Promise.resolve([]),
  loadGlobalModels: () => Promise.resolve([]),
};
