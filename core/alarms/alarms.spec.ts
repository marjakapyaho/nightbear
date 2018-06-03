import 'mocha';
import { assert } from 'chai';
import { detectAlarmActions } from './alarms';
import { getMockActiveAlarms, getMockAlarm } from './test-data/mock-active-alarms';
import { getMockState } from './test-data/mock-state';

const currentTimestamp = 1508672249758;

describe('core/alarms', () => {

  it('alarm actions to create', () => {
    const stateWithLow = getMockState('LOW');
    const activeAlarms = getMockActiveAlarms(currentTimestamp);

    assert.deepEqual(
      detectAlarmActions(stateWithLow, activeAlarms),
      {
        alarmsToRemove: [],
        alarmsToKeep: [],
        alarmsToCreate: ['LOW'],
      },
    );
  });

  it('alarm actions to keep', () => {
    const stateWithHigh = getMockState('HIGH');
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'HIGH');

    assert.deepEqual(
      detectAlarmActions(stateWithHigh, activeAlarms),
      {
        alarmsToRemove: [],
        alarmsToKeep: [getMockAlarm(currentTimestamp, 'HIGH')],
        alarmsToCreate: [],
      },
    );
  });

  it('alarm actions to remove', () => {
    const stateWithHigh = getMockState();
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'RISING');

    assert.deepEqual(
      detectAlarmActions(stateWithHigh, activeAlarms),
      {
        alarmsToRemove: [getMockAlarm(currentTimestamp, 'RISING')],
        alarmsToKeep: [],
        alarmsToCreate: [],
      },
    );
  });
});
