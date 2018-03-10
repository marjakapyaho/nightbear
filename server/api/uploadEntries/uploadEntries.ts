import { Response, Context, createResponse, Request } from '../../models/api';
import { MeterEntry, Insulin, Carbs } from '../../models/model';

export function uploadEntries(request: Request, context: Context): Response {
  const { bloodSugar, insulin, carbs } = request.requestBody as any;
  const timestamp = context.timestamp();

  if (bloodSugar) {
    const meterEntry: MeterEntry = parseMeterEntry(bloodSugar, timestamp);
    console.log('Save meter entry to db with timestamp', timestamp, meterEntry); // tslint:disable-line:no-console
    console.log('Note: this should be saved as new calibration - see. uploadDexcomEntry for details'); // tslint:disable-line:no-console
  }

  if (insulin) {
    const insulinEntry: Insulin = parseInsulinEntry(insulin, timestamp);
    console.log('Save insulin entry to db with timestamp', timestamp, insulinEntry); // tslint:disable-line:no-console
  }

  if (carbs) {
    const carbsEntry: Carbs = parseCarbsEntry(carbs, timestamp);
    console.log('Save carbs entry to db with timestamp', timestamp, carbsEntry); // tslint:disable-line:no-console
  }

  return createResponse({});
}

export function parseMeterEntry(
  bloodGlucose: number,
  timestamp: number,
): MeterEntry {
  return {
    bloodGlucose,
    measuredAt: timestamp,
  };
}

export function parseInsulinEntry(
  insulin: number,
  timestamp: number,
): Insulin {
  return {
    modelType: 'Insulin',
    timestamp,
    amount: insulin,
    insulinType: 'Humalog',
  };
}

export function parseCarbsEntry(
  carbs: number,
  timestamp: number,
): Carbs {
  return {
    modelType: 'Carbs',
    timestamp,
    amount: carbs,
    carbsType: 'normal',
  };
}
