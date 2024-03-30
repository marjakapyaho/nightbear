import { HOUR_IN_MS } from 'shared/calculations/calculations';
import { TimelineModelType } from 'shared/models/model';

export const TIMELINE_MODEL_TYPES: TimelineModelType[] = [
  'Sensor',
  'DexcomG6ShareEntry',
  'DexcomG6SensorEntry',
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
      selectedScreen: 'Config';
    }
  | {
      selectedScreen: 'BgGraph';
      timelineRange: number;
      timelineRangeEnd: number;
      selectedModelTypes: TimelineModelType[];
      modelUuidBeingEdited: string | null;
      timelineCursorAt: number | null;
    }
  | {
      selectedScreen: 'Stats';
      timelineRange: number;
      timelineRangeEnd: number;
      selectedModelTypes: TimelineModelType[];
    }
>;

export const navigationInitState: NavigationState = getNavigationInitState();

export function getNavigationInitState() {
  return {
    selectedScreen: 'BgGraph' as const,
    timelineRange: 28 * HOUR_IN_MS,
    timelineRangeEnd: Date.now(), // TODO: Having the initial state depend on Date.now() is slightly unorthodox; figure out a better way when we have more time
    selectedModelTypes: TIMELINE_MODEL_TYPES,
    modelUuidBeingEdited: null,
    timelineCursorAt: null,
  };
}
