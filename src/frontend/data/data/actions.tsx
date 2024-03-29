import { GlobalModel, TimelineModel, TimelineModelType, Model } from 'shared/models/model';
import { actionsWithType } from 'frontend/utils/redux';

export const dataActions = actionsWithType({
  TIMELINE_FILTERS_CHANGED: (range: number, rangeEnd: number, modelTypes: TimelineModelType[]) => ({
    range,
    rangeEnd,
    modelTypes,
  }),
  TIMELINE_DATA_UPDATED: (timelineModels: TimelineModel[], globalModels: GlobalModel[]) => ({
    timelineModels,
    globalModels,
  }),
  TIMELINE_DATA_DELETED: (deletedModels: Model[]) => ({
    deletedModels,
  }),
  TIMELINE_DATA_FAILED: (err: Error) => ({ err }),
  MODEL_UPDATED_BY_USER: (model: TimelineModel) => ({ model }),
  MODEL_DELETED_BY_USER: (model: TimelineModel) => ({ model }),
});
