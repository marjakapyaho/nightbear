import { GlobalModel, TimelineModel } from 'shared/models/model';

export type DataState = Readonly<
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

export const dataInitState: DataState = {
  status: 'FETCHING',
  timelineModels: [],
  globalModels: [],
};
