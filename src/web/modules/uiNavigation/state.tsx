import { HOUR_IN_MS } from 'core/calculations/calculations';
import { GlobalModel, TimelineModel, TimelineModelType } from 'core/models/model';

export const TIMELINE_MODEL_TYPES: TimelineModelType[] = [
  'Sensor',
  'DexcomSensorEntry',
  'DexcomRawSensorEntry',
  'ParakeetSensorEntry',
  'DexcomCalibration',
  'NightbearCalibration',
  'DeviceStatus',
  'Hba1c',
  'MeterEntry',
  'Insulin',
  'Carbs',
  'Alarm',
  'ActiveProfile',
];

export type UiNavigationState = Readonly<
  | {
      selectedScreen: 'BgGraphScreen';
      // TODO: BEGIN COPY-PASTA
      timelineRange: number;
      timelineRangeEnd: number;
      selectedModelTypes: TimelineModelType[];
      loadedModels:
        | { status: 'FETCHING' }
        | { status: 'READY'; timelineModels: TimelineModel[]; globalModels: GlobalModel[] }
        | { status: 'ERROR'; errorMessage: string };
      modelUuidBeingEdited: string | null;
      timelineCursorAt: number | null;
      // TODO: END COPY-PASTA
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
      modelUuidBeingEdited: string | null;
      timelineCursorAt: number | null;
    }
>;

export const uiNavigationInitState: UiNavigationState = {
  selectedScreen: 'BgGraphScreen',
  selectedModelTypes: TIMELINE_MODEL_TYPES,
  loadedModels: { status: 'FETCHING' },
  timelineRange: 24 * HOUR_IN_MS,
  timelineRangeEnd: Date.now(), // TODO: Having the initial state depend on Date.now() is slightly unorthodox; figure out a better way when we have more time
  modelUuidBeingEdited: null,
  timelineCursorAt: null,
};
