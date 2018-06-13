import { actionsWithType } from 'web/app/utils/redux';
import { TimelineModelType, TimelineModel } from 'core/models/model';

export const timelineDataActions = actionsWithType({
  TIMELINE_FILTERS_CHANGED: (range: number, rangeEnd: number, modelTypes: TimelineModelType[]) => ({
    range,
    rangeEnd,
    modelTypes,
  }),
  TIMELINE_DATA_RECEIVED: (models: TimelineModel[]) => ({ models }),
  TIMELINE_DATA_FAILED: (err: Error) => ({ err }),
});
