import { createTestContext } from 'backend/utils/test';
import { mockNow } from 'shared/mocks/dates';
import { describe, expect, it } from 'vitest';

describe('db/alarms', () => {
  const context = createTestContext();

  it('create alarm with state', async () => {
    const [alarm] = await context.db.alarms.createAlarm({
      situation: 'LOW',
    });

    expect(alarm.situation).toBe('LOW');
    expect(alarm.deactivatedAt).toBe(null);

    const [alarmState] = await context.db.alarms.createAlarmState({
      alarmId: alarm.id,
      alarmLevel: 0,
      validAfter: mockNow,
    });

    expect(alarmState.timestamp).toMatch(/^\d+-.*T\d+.*Z$/);
    expect(alarmState.alarmLevel).toBe(0);
    expect(alarmState.validAfter).toEqual(mockNow);
    expect(alarmState.ackedBy).toBeNull();
  });
});
