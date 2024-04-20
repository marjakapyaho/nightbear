import { detectAlarmActions, runAlarmChecks } from 'backend/cronjobs/alarms/alarms';
import { getMockActiveAlarms, getMockAlarm } from 'backend/cronjobs/alarms/testData/mockActiveAlarms';
import { getMockState } from 'backend/cronjobs/alarms/testData/mockState';
import { createTestContext } from 'backend/utils/test';
import { getMockActiveProfile } from 'shared/utils/test';
import { Alarm } from 'shared/types/alarms';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';

const currentTimestamp = mockNow;

export const removeId = (alarm: Alarm) => {
  return { ...alarm, id: 'ERASED_ID' };
};

const eraseIds = (x: ReturnType<typeof detectAlarmActions>): ReturnType<typeof detectAlarmActions> => {
  return {
    alarmsToRemove: x.alarmsToRemove.map(removeId),
    alarmsToKeep: x.alarmsToKeep.map(removeId),
    alarmsToCreate: x.alarmsToCreate,
  };
};

describe('cronjobs/alarms', () => {
  it('alarm actions to create', () => {
    const stateWithLow = getMockState('LOW');
    const activeAlarms = getMockActiveAlarms(currentTimestamp);

    expect(detectAlarmActions(stateWithLow, activeAlarms)).toEqual({
      alarmsToRemove: [],
      alarmsToKeep: [],
      alarmsToCreate: ['LOW'],
    });
  });

  it('does not create alarm for COMPRESSION_LOW', () => {
    const stateWithCompressionLow = getMockState('COMPRESSION_LOW');
    const activeAlarms = getMockActiveAlarms(currentTimestamp);

    expect(detectAlarmActions(stateWithCompressionLow, activeAlarms)).toEqual({
      alarmsToRemove: [],
      alarmsToKeep: [],
      alarmsToCreate: [],
    });
  });

  it('alarm actions to keep', () => {
    const stateWithHigh = getMockState('HIGH');
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'HIGH');

    expect(eraseIds(detectAlarmActions(stateWithHigh, activeAlarms))).toEqual(
      eraseIds({
        alarmsToRemove: [],
        alarmsToKeep: [getMockAlarm(currentTimestamp, 'HIGH')],
        alarmsToCreate: [],
      }),
    );
  });

  it('alarm actions to remove', () => {
    const stateWithNoSituation = getMockState();
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'RISING');

    expect(eraseIds(detectAlarmActions(stateWithNoSituation, activeAlarms))).toEqual(
      eraseIds({
        alarmsToRemove: [getMockAlarm(currentTimestamp, 'RISING')],
        alarmsToKeep: [],
        alarmsToCreate: [],
      }),
    );
  });

  // TODO: FIX THESE

  /*  it('run alarm checks with one alarm to create', async () => {
    const stateWithFalling = getMockState('FALLING');
    const activeAlarms = getMockActiveAlarms(currentTimestamp);
    const context = createTestContext();

    const alarms = await runAlarmChecks(context, stateWithFalling, getMockActiveProfile('day'), activeAlarms);
    expect(alarms).toEqual([getMockAlarm(currentTimestamp, 'FALLING')]);
  });

  it('run alarm checks with one alarm to keep', async () => {
    const stateWithFalling = getMockState('FALLING');
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'FALLING');
    const context = createTestContext();

    const alarms = await runAlarmChecks(context, stateWithFalling, getMockActiveProfile('day'), activeAlarms);
    expect(alarms).toEqual([]);
  });

  it('run alarm checks with one alarm to remove', async () => {
    const stateWithNoSituation = getMockState();
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'RISING');
    const context = createTestContext();

    const alarms = await runAlarmChecks(context, stateWithNoSituation, getMockActiveProfile('day'), activeAlarms);
    expect(alarms.map(removeId)).toEqual([removeId(getMockAlarm(currentTimestamp, 'RISING', false, currentTimestamp))]);
  });

  it('run alarm checks with alarms off', async () => {
    const stateWithLow = getMockState('LOW');
    const activeAlarms = getMockActiveAlarms(currentTimestamp, 'LOW');
    const context = createTestContext();

    const alarms = await runAlarmChecks(context, stateWithLow, getMockActiveProfile('day', false), activeAlarms);
    expect(alarms.map(removeId)).toEqual([removeId(getMockAlarm(currentTimestamp, 'LOW', false, currentTimestamp))]);
  });*/
});
