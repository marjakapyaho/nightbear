import { createTestContext } from 'backend/utils/test';
import { mockNow } from 'shared/mocks/dates';
import { expect } from 'vitest';

describe('db/alarms', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const alarmRes = await context.db.alarms.createAlarm({
        situation: 'LOW',
        isActive: true,
      });

      expect(alarmRes).toHaveLength(1);
      expect(alarmRes[0].timestamp).toMatch(/^\d+-.*T\d+.*Z$/);
      expect(alarmRes[0].situation).toBe('LOW');
      expect(alarmRes[0].isActive).toBe(true);

      const alarmStateRes = await context.db.alarms.createAlarmState({
        alarmId: alarmRes[0].id,
        alarmLevel: 1,
        validAfterTimestamp: new Date(mockNow),
        ackedBy: null,
      });

      expect(alarmStateRes).toHaveLength(1);
      expect(alarmStateRes[0].alarmLevel).toBe(1);
      expect(alarmStateRes[0].validAfterTimestamp).toEqual(new Date(mockNow).toISOString());
      expect(alarmStateRes[0].ackedBy).toBeNull();
    });
  });
});
