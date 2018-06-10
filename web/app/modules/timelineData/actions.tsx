import { TimelineModelType, TimelineModel } from 'core/models/model';

export function TIMELINE_FILTERS_CHANGED(
  range: number,
  rangeEnd: number,
  modelTypes: TimelineModelType[],
) {
  return {
    type: 'TIMELINE_FILTERS_CHANGED' as 'TIMELINE_FILTERS_CHANGED',
    range,
    rangeEnd,
    modelTypes,
  };
}

export function TIMELINE_DATA_RECEIVED(models: TimelineModel[]) {
  return {
    type: 'TIMELINE_DATA_RECEIVED' as 'TIMELINE_DATA_RECEIVED',
    models,
  };
}

export function TIMELINE_DATA_FAILED(err: Error) {
  return {
    type: 'TIMELINE_DATA_FAILED' as 'TIMELINE_DATA_FAILED',
    err,
  };
}

export type TimelineDataAction =
  | Readonly<ReturnType<typeof TIMELINE_FILTERS_CHANGED>>
  | Readonly<ReturnType<typeof TIMELINE_DATA_RECEIVED>>
  | Readonly<ReturnType<typeof TIMELINE_DATA_FAILED>>;
