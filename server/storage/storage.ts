import { Model } from '../utils/model';

export interface Storage {
  saveModel<T extends Model>(model: T): Promise<T>;
  loadTimelineModels(fromTimePeriod: number): Promise<Model[]>;
  loadGlobalModels(): Promise<Model[]>;
}
