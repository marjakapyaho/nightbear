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

export type NavigationState = Readonly<
  | {
      selectedScreen: 'ConfigScreen';
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

export const navigationInitState: NavigationState = getNavigationInitState();

export function getNavigationInitState() {
  return {
    selectedScreen: 'BgGraphScreen' as const,
    timelineRange: 28 * HOUR_IN_MS,
    timelineRangeEnd: Date.now(), // TODO: Having the initial state depend on Date.now() is slightly unorthodox; figure out a better way when we have more time
    selectedModelTypes: TIMELINE_MODEL_TYPES,
    modelUuidBeingEdited: null,
    timelineCursorAt: null,
  };
}
