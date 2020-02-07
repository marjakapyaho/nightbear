import { GlobalModel, TimelineModel, TimelineModelType, Model } from 'core/models/model';
import { actionsWithType } from 'web/utils/redux';

export const timelineDataActions = actionsWithType({
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
});
