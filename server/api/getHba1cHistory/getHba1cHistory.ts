import { Response, Context, createResponse, Request } from '../../models/api';
import { Hba1c } from '../../models/model';

export function getHba1cHistory(_request: Request, context: Context): Response {
  console.log('use timestamp to fetch hba1c', context.timestamp()); // tslint:disable-line:no-console
  const hba1cHistory: Hba1c[] = [{
    modelType: 'Hba1c',
    source: 'calculated',
    timestamp: 4234243423,
    hba1cValue: 6.3,
  }];

  return createResponse(hba1cHistory);
}
