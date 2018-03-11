import 'mocha';
import { assert } from 'chai';
import { getWatchStatus } from './getWatchStatus';
import { createTestContext } from '../../utils/test';

describe('api/getWatchStatus', () => {

  const context = createTestContext();

  // Mock objects
  const mockResponseJson: object = {
    alarms: [{
      modelType: 'Alarm',
      creationTimestamp: 324234324,
      validAfterTimestamp: 234432423,
      alarmLevel: 1,
      situationType: 'PERSISTENT_HIGH',
      isActive: true,
      pushoverReceipts: [],
    }],
    deviceStatus: {
      modelType: 'DeviceStatus',
      deviceName: 'dexcom',
      timestamp: 324234324,
      batteryLevel: 80,
      geolocation: null,
    },
  };

  // Assertations
  // TODO: this doesn't really test anything
  it('get watch status', () => {
    return getWatchStatus(context)
      .then(res => {
        assert.deepEqual(
          res.responseBody,
          mockResponseJson,
        );
      });
  });
});