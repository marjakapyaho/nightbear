import { GlobalModel, TimelineModel } from 'core/models/model';

export type TimelineDataState = Readonly<
  (
    | { status: 'FETCHING' }
    | { status: 'READY' }
    | {
        status: 'ERROR';
        errorMessage: string; // i.e. what went wrong
      }
  ) & {
    timelineModels: TimelineModel[];
    globalModels: GlobalModel[];
  }
>;

export const timelineDataInitState: TimelineDataState = {
  status: 'FETCHING',
  timelineModels: [],
  globalModels: [],
};
