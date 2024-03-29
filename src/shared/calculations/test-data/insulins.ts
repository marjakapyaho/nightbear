import { MIN_IN_MS } from 'shared/calculations/calculations';
import { Insulin } from 'shared/models/model';
import { generateUuid } from 'shared/utils/id';

const currentTimestamp = 1508672249758;

export const insulins: Insulin[] = [
  {
    modelType: 'Insulin',
    modelUuid: generateUuid(),
    timestamp: currentTimestamp - 80 * MIN_IN_MS,
    amount: 8,
    insulinType: 'fiasp',
  },
  {
    modelType: 'Insulin',
    modelUuid: generateUuid(),
    timestamp: currentTimestamp - 35 * MIN_IN_MS,
    amount: 10,
    insulinType: 'fiasp',
  },
  {
    modelType: 'Insulin',
    modelUuid: generateUuid(),
    timestamp: currentTimestamp - 10 * MIN_IN_MS,
    amount: 3,
    insulinType: 'fiasp',
  },
];
