import { assert } from 'chai';
import { MIN_IN_MS } from 'core/calculations/calculations';
import { Carbs, DexcomSensorEntry, Insulin } from 'core/models/model';
import 'mocha';
import { getEntries } from 'server/api/getEntries/getEntries';
import { createTestContext, createTestRequest, withStorage } from 'server/utils/test';

describe('api/getEntries', () => {
  const timestampNow = 1508672249758;
  const request = createTestRequest();

  const mockDexcomSensorEntry1: DexcomSensorEntry = {
    modelType: 'DexcomSensorEntry',
    timestamp: timestampNow - 6 * MIN_IN_MS,
    bloodGlucose: 6.9,
    signalStrength: 168,
    noiseLevel: 1,
  };

  const mockDexcomSensorEntry2: DexcomSensorEntry = {
    modelType: 'DexcomSensorEntry',
    timestamp: timestampNow - MIN_IN_MS,
    bloodGlucose: 7.5,
    signalStrength: 168,
    noiseLevel: 1,
  };

  const mockInsulinEntry: Insulin = {
    modelType: 'Insulin',
    timestamp: timestampNow - MIN_IN_MS,
    amount: 5,
    insulinType: 'fiasp',
  };

  const mockCarbEntry: Carbs = {
    modelType: 'Carbs',
    timestamp: timestampNow - 3 * MIN_IN_MS,
    amount: 40,
    carbsType: 'slow',
  };

  const mockResponseJson = [
    {
      time: timestampNow - 6 * MIN_IN_MS,
      carbs: undefined,
      insulin: undefined,
      sugar: '6.9',
      is_raw: false,
    },
    {
      time: timestampNow - 3 * MIN_IN_MS,
      carbs: 40,
      insulin: undefined,
      sugar: undefined,
      is_raw: false,
    },
    {
      time: timestampNow - MIN_IN_MS,
      carbs: undefined,
      insulin: 5,
      sugar: '7.5',
      is_raw: false,
    },
  ];

  withStorage(createTestStorage => {
    it('get legacy entries for watch', () => {
      const context = createTestContext(createTestStorage(), () => timestampNow);
      return Promise.resolve()
        .then(() => context.storage.saveModel(mockDexcomSensorEntry1))
        .then(() => context.storage.saveModel(mockDexcomSensorEntry2))
        .then(() => context.storage.saveModel(mockInsulinEntry))
        .then(() => context.storage.saveModel(mockCarbEntry))
        .then(() => getEntries(request, context))
        .then(res => assert.deepEqual(res.responseBody as any, mockResponseJson));
    });
  });
});
