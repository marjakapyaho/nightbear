import { HOUR_IN_MS } from 'core/calculations/calculations';
import { GlobalModel, TimelineModel, TimelineModelType } from 'core/models/model';
import { TIMELINE_MODEL_TYPES } from 'web/src/app/ui/utils/ModelTypeSelector';

export type UiNavigationState = Readonly<
  | {
      selectedScreen: 'BgGraphScreen';
      // TODO: TEMP
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
  selectedModelTypes: TIMELINE_MODEL_TYPES,
  loadedModels: { status: 'FETCHING' },
  timelineRange: 24 * HOUR_IN_MS,
  timelineRangeEnd: Date.now(), // TODO: Having the initial state depend on Date.now() is slightly unorthodox; figure out a better way when we have more time
  modelBeingEdited: null,
  timelineCursorAt: null,
};
