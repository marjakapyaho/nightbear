import { Model } from '../models/model';

export interface Storage {
  saveModel<T extends Model>(model: T): Promise<T>;
  loadTimelineModels(fromTimePeriod: number): Promise<Model[]>;
  loadGlobalModels(): Promise<Model[]>;
}

export const NO_STORAGE: Storage = {
  saveModel: model => Promise.resolve(model),
  loadTimelineModels: () => Promise.resolve([]),
  loadGlobalModels: () => Promise.resolve([]),
};
