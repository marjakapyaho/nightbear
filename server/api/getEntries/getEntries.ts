import { Response, Context, createResponse, Request } from '../../models/api';
import { Carbs, Insulin, SensorEntry } from '../../models/model';
import { HOUR_IN_MS } from '../../core/calculations/calculations';

export function getEntries(request: Request, context: Context): Response {
  const { from, to } = request.requestParams;

  const fromTimestamp = from ? parseInt(from, 10) : context.timestamp() - 24 * HOUR_IN_MS; // default to 24 hours ago
  const toTimestamp = to ? parseInt(to, 10) : context.timestamp(); // default to present time

  const sensorEntries: SensorEntry[] = getSensorEntries(fromTimestamp, toTimestamp);
  const insulin: Insulin[] = getInsulin(fromTimestamp, toTimestamp);
  const carbs: Carbs[] = getCarbs(fromTimestamp, toTimestamp);

  return createResponse({
    sensorEntries,
    insulin,
    carbs,
  });
}

export function getSensorEntries(
  from: number,
  to: number): SensorEntry[] {
  console.log('Fetch sensor entries from time range', from, to); // tslint:disable-line:no-console
  return [];
}

export function getInsulin(
  from: number,
  to: number): Insulin[] {
  console.log('Fetch insulin from time range', from, to); // tslint:disable-line:no-console
  return [];
}

export function getCarbs(
  from: number,
  to: number): Carbs[] {
  console.log('Fetch carbs from time range', from, to); // tslint:disable-line:no-console
  return [];
}
