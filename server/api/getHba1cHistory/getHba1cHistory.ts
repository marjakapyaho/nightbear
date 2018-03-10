import { Response, Context, createResponse } from '../../models/api';
import { Hba1c } from '../../models/model';

export function getHba1cHistory(context: Context): Response {
  console.log('use timestamp to fetch hba1c', context.timestamp()); // tslint:disable-line:no-console
  const hba1cHistory: Hba1c[] = [{
    modelType: 'Hba1c',
    source: 'calculated',
    timestamp: 4234243423,
    hba1cValue: 6.3,
  }];

  return createResponse(hba1cHistory);
}
