import { Context, createResponse, Request, Response } from 'core/models/api';
import { Carbs, Insulin, MeterEntry } from 'core/models/model';

export function uploadEntries(request: Request, context: Context): Response {
  const { bloodSugar, insulin, carbs } = request.requestBody as any;
  const timestamp = context.timestamp(); // TODO: we should get timestamp from user
  const modelsToSave = [];

  if (bloodSugar) {
    const meterEntry: MeterEntry = parseMeterEntry(bloodSugar, timestamp);
    modelsToSave.push(meterEntry);
  }

  if (insulin) {
    const insulinEntry: Insulin = parseInsulinEntry(insulin, timestamp);
    modelsToSave.push(insulinEntry);
  }

  if (carbs) {
    const carbsEntry: Carbs = parseCarbsEntry(carbs, timestamp);
    modelsToSave.push(carbsEntry);
  }

  return context.storage.saveModels(modelsToSave).then(() => createResponse());
}

export function parseMeterEntry(bloodGlucose: number, timestamp: number): MeterEntry {
  return {
    modelType: 'MeterEntry',
    timestamp,
    source: 'ui',
    bloodGlucose,
  };
}

export function parseInsulinEntry(insulin: number, timestamp: number): Insulin {
  return {
    modelType: 'Insulin',
    timestamp,
    amount: insulin,
    insulinType: 'Humalog',
  };
}

export function parseCarbsEntry(carbs: number, timestamp: number): Carbs {
  return {
    modelType: 'Carbs',
    timestamp,
    amount: carbs,
    carbsType: 'normal',
  };
}
