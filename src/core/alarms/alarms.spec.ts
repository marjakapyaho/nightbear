import { assert } from 'chai';
import { detectAlarmActions, runAlarmChecks } from 'core/alarms/alarms';
import { getMockActiveAlarms, getMockAlarm } from 'core/alarms/test-data/mock-active-alarms';
import { getMockState } from 'core/alarms/test-data/mock-state';
import 'mocha';
import { activeProfile, createTestContext } from 'server/utils/test';

const currentTimestamp = 1508672249758;

describe('core/alarms', () => {
  it('alarm actions to create', () => {
    const stateWithLow = getMockState('LOW');
    const activeAlarms = getMockActiveAlarms(currentTimestamp);

    assert.deepEqual(detectAlarmActions(stateWithLow, activeAlarms), {
      alarmsToRemove: [],
      alarmsToKeep: [],
      alarmsToCreate: ['LOW'],
    });
  });

  it('alarm actions to keep', () => {
    const stateWithHigh = getMockState('HIGH');
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'HIGH');

    assert.deepEqual(detectAlarmActions(stateWithHigh, activeAlarms), {
      alarmsToRemove: [],
      alarmsToKeep: [getMockAlarm(currentTimestamp, 'HIGH')],
      alarmsToCreate: [],
    });
  });

  it('alarm actions to remove', () => {
    const stateWithNoSituation = getMockState();
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'RISING');

    assert.deepEqual(detectAlarmActions(stateWithNoSituation, activeAlarms), {
      alarmsToRemove: [getMockAlarm(currentTimestamp, 'RISING')],
      alarmsToKeep: [],
      alarmsToCreate: [],
    });
  });

  it('run alarm checks with one alarm to create', () => {
    const stateWithFalling = getMockState('FALLING');
    const activeAlarms = getMockActiveAlarms(currentTimestamp);
    const context = createTestContext();

    return runAlarmChecks(
      context,
      stateWithFalling,
      activeProfile('day', currentTimestamp),
      activeAlarms,
    ).then(alarms => assert.deepEqual(alarms, [getMockAlarm(currentTimestamp, 'FALLING')]));
  });

  it('run alarm checks with one alarm to keep', () => {
    const stateWithFalling = getMockState('FALLING');
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'FALLING');
    const context = createTestContext();

    return runAlarmChecks(
      context,
      stateWithFalling,
      activeProfile('day', currentTimestamp),
      activeAlarms,
    ).then(alarms => assert.deepEqual(alarms, []));
  });

  it('run alarm checks with one alarm to remove', () => {
    const stateWithNoSituation = getMockState();
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'RISING');
    const context = createTestContext();

    return runAlarmChecks(
      context,
      stateWithNoSituation,
      activeProfile('day', currentTimestamp),
      activeAlarms,
    ).then(alarms => assert.deepEqual(alarms, [getMockAlarm(currentTimestamp, 'RISING', false, currentTimestamp)]));
  });
});
