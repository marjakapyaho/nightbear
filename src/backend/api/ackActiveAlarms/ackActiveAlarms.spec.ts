import { assert } from 'chai';
import 'mocha';
import { ackActiveAlarms } from 'backend/api/ackActiveAlarms/ackActiveAlarms';
import { activeProfile, createTestContext, createTestRequest } from 'backend/utils/test';
import { MIN_IN_MS } from 'shared/calculations/calculations';
import { NO_STORAGE, Storage } from 'shared/storage/storage';
import { Alarm, ModelOfType, ModelType } from 'shared/models/model';
import { WATCH_NAME } from 'shared/models/const';

describe('api/ackActiveAlarms', () => {
  const request = { ...createTestRequest(), requestBody: { acknowledged_by: WATCH_NAME } };
  const currentTimestamp = 324234324;

  // Mock objects
  const alarmBase: Omit<Alarm, 'alarmStates'> = {
    modelUuid: '3fd6e5bb-454a-4a6a-bbd7-06b2a467141b',
    modelType: 'Alarm',
    timestamp: currentTimestamp - 5 * MIN_IN_MS,
    situationType: 'LOW',
    isActive: true,
    deactivationTimestamp: null,
  };

  const mockAlarmsWithValidAlarm: Alarm[] = [
    {
      ...alarmBase,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: currentTimestamp - MIN_IN_MS,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];

  const mockReponseWithUpdatedAlarm: Alarm[] = [
    {
      ...alarmBase,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: currentTimestamp - MIN_IN_MS,
          ackedBy: null,
          pushoverReceipts: [],
        },
        {
          alarmLevel: 1,
          validAfterTimestamp: currentTimestamp + 15 * MIN_IN_MS, // must match profile's LOW snooze time
          ackedBy: WATCH_NAME,
          pushoverReceipts: [],
        },
      ],
    },
  ];

  const mockStorage: Storage = {
    ...NO_STORAGE,
    loadLatestTimelineModels<T extends ModelType>(modelType: T): Promise<Array<ModelOfType<T>>> {
      if (modelType === 'Alarm') {
        return Promise.resolve(mockAlarmsWithValidAlarm as Array<ModelOfType<T>>);
      } else if (modelType === 'ActiveProfile') {
        return Promise.resolve([activeProfile('day', currentTimestamp - 20 * MIN_IN_MS) as ModelOfType<T>]);
      }
      throw new Error('Not supported by test');
    },
  };

  const context = createTestContext(mockStorage, () => currentTimestamp);

  // Assertions
  it('ack active alarm with watch', () => {
    return ackActiveAlarms(request, context).then(res => {
      assert.deepEqual(res.responseBody, mockReponseWithUpdatedAlarm);
    });
  });
});
