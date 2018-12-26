import { TimelineModel, TimelineModelType } from 'core/models/model';

export type UiNavigationState = Readonly<
  | {
      selectedScreen: 'BgGraphScreen';
    }
  | {
      selectedScreen: 'TimelineDebugScreen';
      timelineRange: number;
      timelineRangeEnd: number;
      selectedModelTypes: TimelineModelType[];
      loadedModels:
        | { status: 'FETCHING' }
        | { status: 'READY'; models: TimelineModel[] }
        | { status: 'ERROR'; errorMessage: string };
    }
>;

export const uiNavigationInitState: UiNavigationState = {
  selectedScreen: 'BgGraphScreen',
};
