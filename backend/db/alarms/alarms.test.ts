import { createTestContext, truncateDb } from './utils/test';
import { beforeEach, describe, expect, it } from 'vitest';

describe('db/alarms', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
  });

  it('create alarm with state', async () => {
    const alarm = await context.db.createAlarmWithState('LOW');
    const alarmState = await context.db.getAlarmStateByAlarmId(alarm.id);

    expect(alarm.situation).toBe('LOW');
    expect(alarm.deactivatedAt).toBeUndefined();
    expect(alarmState.timestamp).toMatch(/^\d+-.*T\d+.*Z$/);
    expect(alarmState.alarmLevel).toBe(0);
    expect(alarmState.validAfter).toMatch(/^\d+-.*T\d+.*Z$/);
    expect(alarmState.ackedBy).toBeUndefined();
  });
});
