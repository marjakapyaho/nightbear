import { assert } from 'chai';
import { detectAlarmActions, runAlarmChecks } from 'backend/cronjobs/alarms/alarms';
import { getMockActiveAlarms, getMockAlarm } from 'backend/cronjobs/alarms/testData/mockActiveAlarms';
import { getMockState } from 'backend/cronjobs/alarms/testData/mockState';
import 'mocha';
import { createTestContext, getMockActiveProfile } from 'backend/utils/test';

const currentTimestamp = 1508672249758;

describe('shared/alarms', () => {
  function eraseUuids(x: ReturnType<typeof detectAlarmActions>): ReturnType<typeof detectAlarmActions> {
    return {
      alarmsToRemove: x.alarmsToRemove,
      alarmsToKeep: x.alarmsToKeep,
      alarmsToCreate: x.alarmsToCreate,
    };
  }

  it('alarm actions to create', () => {
    const stateWithLow = getMockState('LOW');
    const activeAlarms = getMockActiveAlarms(currentTimestamp);

    assert.deepEqual(detectAlarmActions(stateWithLow, activeAlarms), {
      alarmsToRemove: [],
      alarmsToKeep: [],
      alarmsToCreate: ['LOW'],
    });
  });

  it('does not create alarm for COMPRESSION_LOW', () => {
    const stateWithCompressionLow = getMockState('COMPRESSION_LOW');
    const activeAlarms = getMockActiveAlarms(currentTimestamp);

    assert.deepEqual(detectAlarmActions(stateWithCompressionLow, activeAlarms), {
      alarmsToRemove: [],
      alarmsToKeep: [],
      alarmsToCreate: [],
    });
  });

  it('alarm actions to keep', () => {
    const stateWithHigh = getMockState('HIGH');
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'HIGH');

    assert.deepEqual(
      eraseUuids(detectAlarmActions(stateWithHigh, activeAlarms)),
      eraseUuids({
        alarmsToRemove: [],
        alarmsToKeep: [getMockAlarm(currentTimestamp, 'HIGH')],
        alarmsToCreate: [],
      }),
    );
  });

  it('alarm actions to remove', () => {
    const stateWithNoSituation = getMockState();
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'RISING');

    assert.deepEqual(
      eraseUuids(detectAlarmActions(stateWithNoSituation, activeAlarms)),
      eraseUuids({
        alarmsToRemove: [getMockAlarm(currentTimestamp, 'RISING')],
        alarmsToKeep: [],
        alarmsToCreate: [],
      }),
    );
  });

  it('run alarm checks with one alarm to create', () => {
    const stateWithFalling = getMockState('FALLING');
    const activeAlarms = getMockActiveAlarms(currentTimestamp);
    const context = createTestContext();

    return runAlarmChecks(context, stateWithFalling, getMockActiveProfile('day'), activeAlarms).then(alarms =>
      assert.deepEqual(alarms, [getMockAlarm(currentTimestamp, 'FALLING')]),
    );
  });

  it('run alarm checks with one alarm to keep', () => {
    const stateWithFalling = getMockState('FALLING');
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'FALLING');
    const context = createTestContext();

    return runAlarmChecks(context, stateWithFalling, getMockActiveProfile('day'), activeAlarms).then(alarms =>
      assert.deepEqual(alarms, []),
    );
  });

  it('run alarm checks with one alarm to remove', () => {
    const stateWithNoSituation = getMockState();
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'RISING');
    const context = createTestContext();

    return runAlarmChecks(context, stateWithNoSituation, getMockActiveProfile('day'), activeAlarms).then(alarms =>
      assert.deepEqual(alarms, [getMockAlarm(currentTimestamp, 'RISING', false, currentTimestamp)]),
    );
  });

  it('run alarm checks with alarms off', () => {
    const stateWithLow = getMockState('LOW');
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'LOW');
    const context = createTestContext();

    return runAlarmChecks(context, stateWithLow, getMockActiveProfile('day', false), activeAlarms).then(alarms =>
      assert.deepEqual(alarms, [getMockAlarm(currentTimestamp, 'LOW', false, currentTimestamp)]),
    );
  });
});
