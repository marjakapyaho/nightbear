import { assert } from 'chai';
import 'mocha';
import { getWatchStatus } from 'backend/api/getWatchStatus/getWatchStatus';
import { createTestContext, createTestRequest } from 'backend/utils/test';
import { MIN_IN_MS } from 'shared/calculations/calculations';
import { NO_STORAGE, Storage } from 'shared/storage/storage';
import { Alarm, DeviceStatus, ModelOfType, ModelType } from 'shared/models/model';

describe('api/getWatchStatus', () => {
  const request = createTestRequest();
  const currentTimestamp = 324234324;

  // Mock objects
  const responseWithAlarm = {
    alarms: [
      {
        modelUuid: '3fd6e5bb-454a-4a6a-bbd7-06b2a467141b',
        modelType: 'Alarm',
        timestamp: currentTimestamp,
        situationType: 'PERSISTENT_HIGH',
        isActive: true,
        deactivationTimestamp: null,
        alarmStates: [
          {
            alarmLevel: 1,
            validAfterTimestamp: currentTimestamp - MIN_IN_MS,
            ackedBy: null,
            pushoverReceipts: [],
          },
        ],
      },
    ],
    deviceStatus: {
      modelUuid: '3fd6e5bb-454a-4a6a-bbd7-06b2a467141b',
      modelType: 'DeviceStatus',
      deviceName: 'dexcom-uploader',
      timestamp: currentTimestamp,
      batteryLevel: 80,
      geolocation: null,
    },
  };

  // Mock objects
  const responseWithoutAlarm = {
    alarms: [],
    deviceStatus: {
      modelUuid: '3fd6e5bb-454a-4a6a-bbd7-06b2a467141b',
      modelType: 'DeviceStatus',
      deviceName: 'dexcom-uploader',
      timestamp: currentTimestamp,
      batteryLevel: 80,
      geolocation: null,
    },
  };

  const mockAlarmsWithValidAlarm: Alarm[] = [
    {
      modelUuid: '3fd6e5bb-454a-4a6a-bbd7-06b2a467141b',
      modelType: 'Alarm',
      timestamp: currentTimestamp,
      situationType: 'PERSISTENT_HIGH',
      isActive: true,
      deactivationTimestamp: null,
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

  const mockAlarmsWithoutValidAlarm: Alarm[] = [
    {
      modelUuid: '3fd6e5bb-454a-4a6a-bbd7-06b2a467141b',
      modelType: 'Alarm',
      timestamp: currentTimestamp,
      situationType: 'PERSISTENT_HIGH',
      isActive: true,
      deactivationTimestamp: null,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: currentTimestamp + MIN_IN_MS,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];

  const mockDeviceStatus: DeviceStatus = {
    modelUuid: '3fd6e5bb-454a-4a6a-bbd7-06b2a467141b',
    modelType: 'DeviceStatus',
    deviceName: 'dexcom-uploader',
    timestamp: currentTimestamp,
    batteryLevel: 80,
    geolocation: null,
  };

  // Assertions
  it('get watch status with valid alarm', () => {
    const mockStorage: Storage = {
      ...NO_STORAGE,
      loadLatestTimelineModels<T extends ModelType>(modelType: T): Promise<Array<ModelOfType<T>>> {
        if (modelType === 'Alarm') {
          return Promise.resolve(mockAlarmsWithValidAlarm as Array<ModelOfType<T>>);
        } else if (modelType === 'DeviceStatus') {
          return Promise.resolve([mockDeviceStatus as ModelOfType<T>]);
        }
        throw new Error('Not supported by test');
      },
    };

    const context = createTestContext(mockStorage, () => currentTimestamp);

    return getWatchStatus(request, context).then(res => {
      assert.deepEqual(res.responseBody, responseWithAlarm);
    });
  });

  // Assertions
  it('get watch status without valid alarm', () => {
    const mockStorage: Storage = {
      ...NO_STORAGE,
      loadLatestTimelineModels<T extends ModelType>(modelType: T): Promise<Array<ModelOfType<T>>> {
        if (modelType === 'Alarm') {
          return Promise.resolve(mockAlarmsWithoutValidAlarm as Array<ModelOfType<T>>);
        } else if (modelType === 'DeviceStatus') {
          return Promise.resolve([mockDeviceStatus as ModelOfType<T>]);
        }
        throw new Error('Not supported by test');
      },
    };

    const context = createTestContext(mockStorage, () => currentTimestamp);

    return getWatchStatus(request, context).then(res => {
      assert.deepEqual(res.responseBody, responseWithoutAlarm);
    });
  });
});
