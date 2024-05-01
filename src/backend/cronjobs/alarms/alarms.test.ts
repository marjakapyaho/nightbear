import { detectAlarmActions, runAlarmChecks } from 'backend/cronjobs/alarms/alarms';
import { createTestContext, truncateDb } from 'backend/utils/test';
import { getMockActiveProfile } from 'shared/utils/test';
import { Alarm } from 'shared/types/alarms';
import { beforeEach, describe, expect, it } from 'vitest';
import { createAlarmWithState } from 'backend/db/alarms/utils';

describe('cronjobs/alarms', () => {
  const context = createTestContext();

  const checkActiveAlarms = async (): Promise<Alarm[]> =>
    (await context.db.alarms.getAlarms({
      onlyActive: true,
    })) as unknown as Alarm[];

  beforeEach(async () => {
    await truncateDb(context);
  });

  it('creates alarm when there is no previous alarm and there is situation', async () => {
    // No alarms before running checks
    expect(await checkActiveAlarms()).toHaveLength(0);

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('LOW', getMockActiveProfile())).toEqual({
      create: 'LOW',
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'LOW', getMockActiveProfile());

    // Should have LOW alarm
    const alarms = await checkActiveAlarms();
    expect(alarms).toHaveLength(1);
    expect(alarms[0].situation).toEqual('LOW');
  });

  it('does not create alarm when alarms are off', async () => {
    const profileWithAlarmsOff = getMockActiveProfile('day', false);

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('LOW', profileWithAlarmsOff)).toEqual({});

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'LOW', profileWithAlarmsOff);

    // Should not have LOW alarm
    expect(await checkActiveAlarms()).toHaveLength(0);
  });

  it('removes existing alarm when alarms are off even if situation persists', async () => {
    const profileWithAlarmsOff = getMockActiveProfile('day', false);

    // Create existing LOW alarm
    const alarm = await createAlarmWithState('LOW', context);

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('LOW', profileWithAlarmsOff, alarm)).toEqual({
      remove: alarm,
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'LOW', profileWithAlarmsOff, alarm);

    // Should have removed previous existing alarm
    expect(await checkActiveAlarms()).toHaveLength(0);
  });

  it('keep alarm when there is previous alarm and situation is same', async () => {
    const alarm = await createAlarmWithState('LOW', context);

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('LOW', getMockActiveProfile(), alarm)).toEqual({
      keep: alarm,
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'LOW', getMockActiveProfile(), alarm);

    // Should keep previous existing alarm
    const alarms = await checkActiveAlarms();
    expect(alarms).toHaveLength(1);
    expect(alarms[0].id).toEqual(alarm.id);
    expect(alarms[0].situation).toEqual('LOW');
  });

  it('removes alarm when there is no longer situation', async () => {
    // Create existing LOW alarm
    const alarm = await createAlarmWithState('LOW', context);

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions(null, getMockActiveProfile(), alarm)).toEqual({
      remove: alarm,
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, null, getMockActiveProfile(), alarm);

    // Should have removed previous existing alarm
    expect(await checkActiveAlarms()).toHaveLength(0);
  });

  it('removes alarm and creates new one when there alarm with wrong situation', async () => {
    // Create existing LOW alarm
    const alarm = await createAlarmWithState('LOW', context);

    // Test alarm actions detection (does not touch db)
    expect(detectAlarmActions('RISING', getMockActiveProfile(), alarm)).toEqual({
      remove: alarm,
      create: 'RISING',
    });

    // Run checks (also uses function above)
    await runAlarmChecks(context, 'RISING', getMockActiveProfile(), alarm);

    // Should have removed previous LOW alarm and added new RISING alarm
    const alarms = await checkActiveAlarms();
    expect(alarms).toHaveLength(1);
    expect(alarms[0].id).not.toEqual(alarm.id);
    expect(alarms[0].situation).toEqual('RISING');
  });
});
