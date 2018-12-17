import { HOUR_IN_MS } from 'core/calculations/calculations';
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
    range: 12 * HOUR_IN_MS,
    rangeEnd: Date.now(),
    modelTypes: [
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
    ],
  },
  status: 'FETCHING',
};
