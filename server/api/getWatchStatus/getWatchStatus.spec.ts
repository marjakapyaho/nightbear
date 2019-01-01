import { assert } from 'chai';
import 'mocha';
import { getWatchStatus } from 'server/api/getWatchStatus/getWatchStatus';
import { createTestContext, createTestRequest } from 'server/utils/test';

describe('api/getWatchStatus', () => {
  const request = createTestRequest();
  const context = createTestContext();

  // Mock objects
  const mockResponseJson: object = {
    alarms: [
      {
        modelType: 'Alarm',
        timestamp: 324234324,
        situationType: 'PERSISTENT_HIGH',
        isActive: true,
        deactivationTimestamp: null,
        alarmStates: [
          {
            alarmLevel: 1,
            validAfterTimestamp: 234432423,
            ackedBy: null,
            pushoverReceipts: [],
          },
        ],
      },
    ],
    deviceStatus: {
      modelType: 'DeviceStatus',
      deviceName: 'dexcom',
      timestamp: 324234324,
      batteryLevel: 80,
      geolocation: null,
    },
  };

  // Assertations
  xit('get watch status', () => {
    return getWatchStatus(request, context).then(res => {
      assert.deepEqual(res.responseBody, mockResponseJson);
    });
  });
});
