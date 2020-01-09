import { GlobalModel, TimelineModel, TimelineModelType } from 'core/models/model';
import { actionsWithType } from 'web/src/utils/redux';

export const timelineDataActions = actionsWithType({
  TIMELINE_FILTERS_CHANGED: (range: number, rangeEnd: number, modelTypes: TimelineModelType[]) => ({
    range,
    rangeEnd,
    modelTypes,
  }),
  TIMELINE_DATA_RECEIVED: (timelineModels: TimelineModel[], globalModels: GlobalModel[]) => ({
    timelineModels,
    globalModels,
  }),
  TIMELINE_DATA_FAILED: (err: Error) => ({ err }),
});
