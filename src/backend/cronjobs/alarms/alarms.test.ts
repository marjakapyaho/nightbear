import { detectAlarmActions, runAlarmChecks } from 'backend/cronjobs/alarms/alarms';
import { checkActiveAlarm, createTestContext, truncateDb } from 'backend/utils/test';
import { getMockActiveProfile } from 'shared/utils/test';
import { beforeEach, describe, expect, it } from 'vitest';

describe('cronjobs/alarms', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
  });

  it('creates alarm when there is no previous alarm and there is situation', async () => {
    // No alarms before running checks
    expect(await checkActiveAlarm(context)).toHaveLength(0);

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('LOW', getMockActiveProfile())).toEqual({
      create: 'LOW',
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'LOW', getMockActiveProfile());

    // Should have LOW alarm
    const alarm = await checkActiveAlarm(context);
    expect(alarm.situation).toEqual('LOW');
  });

  it('does not create alarm when alarms are off', async () => {
    const profileWithAlarmsOff = getMockActiveProfile('day', false);

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('LOW', profileWithAlarmsOff)).toEqual({});

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'LOW', profileWithAlarmsOff);

    // Should not have LOW alarm
    expect(await checkActiveAlarm(context)).toBeUndefined();
  });

  it('removes existing alarm when alarms are off even if situation persists', async () => {
    const profileWithAlarmsOff = getMockActiveProfile('day', false);

    // Create existing LOW alarm
    const alarm = await context.db.createAlarmWithState('LOW');

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('LOW', profileWithAlarmsOff, alarm)).toEqual({
      remove: alarm,
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'LOW', profileWithAlarmsOff, alarm);

    // Should have removed previous existing alarm
    expect(await checkActiveAlarm(context)).toBeUndefined();
  });

  it('keep alarm when there is previous alarm and situation is same', async () => {
    const alarm = await context.db.createAlarmWithState('LOW');

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('LOW', getMockActiveProfile(), alarm)).toEqual({
      keep: alarm,
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'LOW', getMockActiveProfile(), alarm);

    // Should keep previous existing alarm
    const alarmAfterChecks = await checkActiveAlarm(context);
    expect(alarmAfterChecks.situation).toEqual('LOW');
    expect(alarmAfterChecks.id).toEqual(alarm.id);
  });

  it('removes alarm when there is no longer situation', async () => {
    // Create existing LOW alarm
    const alarm = await context.db.createAlarmWithState('LOW');

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('NO_SITUATION', getMockActiveProfile(), alarm)).toEqual({
      remove: alarm,
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'NO_SITUATION', getMockActiveProfile(), alarm);

    // Should have removed previous existing alarm
    expect(await checkActiveAlarm(context)).toHaveLength(0);
  });

  it('removes alarm and creates new one when there alarm with wrong situation', async () => {
    // Create existing LOW alarm
    const alarm = await context.db.createAlarmWithState('LOW');

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('RISING', getMockActiveProfile(), alarm)).toEqual({
      remove: alarm,
      create: 'RISING',
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'RISING', getMockActiveProfile(), alarm);

    // Should have removed previous LOW alarm and added new RISING alarm
    const alarmAfterChecks = await checkActiveAlarm(context);
    expect(alarmAfterChecks.situation).toEqual('RISING');
    expect(alarmAfterChecks.id).not.toEqual(alarm.id);
  });
});
