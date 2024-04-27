import { detectAlarmActions, runAlarmChecks } from 'backend/cronjobs/alarms/alarms';
import { createTestContext } from 'backend/utils/test';
import { getMockActiveAlarm, getMockActiveProfile } from 'shared/utils/test';
import { Alarm } from 'shared/types/alarms';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';

const currentTimestamp = mockNow;

export const removeId = (alarm: Alarm) => {
  return { ...alarm, id: 'ERASED_ID' };
};

describe('cronjobs/alarms', () => {
  const context = createTestContext();

  it('creates alarm when there is no previous alarm and there is situation', async () => {
    expect(detectAlarmActions('LOW', getMockActiveProfile())).toEqual({
      create: 'LOW',
    });

    /*    await runAlarmChecks(context, 'LOW', getMockActiveProfile());
    const createdAlarm = await context.db.alarms.getActiveAlarm();
    expect(createdAlarm).toEqual({});*/
  });

  it('does not create alarm when alarms are off', () => {
    expect(detectAlarmActions('LOW', getMockActiveProfile('day', false))).toEqual({});
  });

  it.only('removes existing alarm when alarms are off even if situation persists', () => {
    const activeAlarm = getMockActiveAlarm('LOW');
    expect(detectAlarmActions('LOW', getMockActiveProfile('day', false), activeAlarm)).toEqual({
      remove: activeAlarm,
    });
  });

  it('does not create alarm for compression low', () => {
    expect(detectAlarmActions('COMPRESSION_LOW', getMockActiveProfile())).toEqual({});
  });

  it('keep alarm when there is previous alarm and situation is same', () => {
    const activeAlarm = getMockActiveAlarm('LOW');
    expect(detectAlarmActions('LOW', getMockActiveProfile(), activeAlarm)).toEqual({
      keep: activeAlarm,
    });
  });

  it('removes alarm when there is no longer situation', () => {
    const activeAlarm = getMockActiveAlarm('LOW');
    expect(detectAlarmActions(null, getMockActiveProfile(), activeAlarm)).toEqual({
      remove: activeAlarm,
    });
  });

  it('removes alarm and creates new one when there alarm with wrong situation', () => {
    const activeAlarm = getMockActiveAlarm('LOW');
    expect(detectAlarmActions('RISING', getMockActiveProfile(), getMockActiveAlarm('LOW'))).toEqual(
      {
        remove: activeAlarm,
        create: 'RISING',
      },
    );
  });
});
