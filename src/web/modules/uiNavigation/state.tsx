import { HOUR_IN_MS } from 'core/calculations/calculations';
import { TimelineModelType } from 'core/models/model';

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
      selectedScreen: 'SettingsScreen';
    }
  | {
      selectedScreen: 'BgGraphScreen';
      timelineRange: number;
      timelineRangeEnd: number;
      selectedModelTypes: TimelineModelType[];
      modelUuidBeingEdited: string | null;
      timelineCursorAt: number | null;
    }
  | {
      selectedScreen: 'TimelineDebugScreen';
      timelineRange: number;
      timelineRangeEnd: number;
      selectedModelTypes: TimelineModelType[];
      modelUuidBeingEdited: string | null;
    }
>;

export const uiNavigationInitState: UiNavigationState = {
  selectedScreen: 'BgGraphScreen',
  timelineRange: 28 * HOUR_IN_MS,
  timelineRangeEnd: Date.now(), // TODO: Having the initial state depend on Date.now() is slightly unorthodox; figure out a better way when we have more time
  selectedModelTypes: TIMELINE_MODEL_TYPES,
  modelUuidBeingEdited: null,
  timelineCursorAt: null,
};
