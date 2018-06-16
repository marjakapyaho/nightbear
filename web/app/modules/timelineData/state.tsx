import { TimelineModel, TimelineModelType } from 'core/models/model';

export type TimelineDataState = Readonly<
  {
    filters: {
      range: number;
      rangeEnd: number;
      modelTypes: TimelineModelType[];
    };
  } & (
    | { status: 'FETCHING' }
    | { status: 'READY'; models: TimelineModel[] }
    | { status: 'ERROR'; errorMessage: string })
>;

export const timelineDataInitState: TimelineDataState = {
  filters: {
    range: 0,
    rangeEnd: 0,
    modelTypes: [],
  },
  status: 'FETCHING',
};
