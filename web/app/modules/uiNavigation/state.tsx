import { GlobalModel, TimelineModel, TimelineModelType } from 'core/models/model';

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
        | { status: 'READY'; timelineModels: TimelineModel[]; globalModels: GlobalModel[] }
        | { status: 'ERROR'; errorMessage: string };
      modelBeingEdited: TimelineModel | null;
      timelineCursorAt: number | null;
    }
>;

export const uiNavigationInitState: UiNavigationState = {
  selectedScreen: 'BgGraphScreen',
};
