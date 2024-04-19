import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import 'mocha';
import { mockNow } from 'shared/mocks/dates';

describe('db/alarms', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const alarmRes = await context.db.alarms.createAlarm({
        situation: 'LOW',
        isActive: true,
      });

      assert.equal(alarmRes.length, 1);
      assert.match(alarmRes[0].timestamp, /^\d+-.*T\d+.*Z$/);
      assert.equal(alarmRes[0].situation, 'LOW');
      assert.equal(alarmRes[0].isActive, true);

      const alarmStateRes = await context.db.alarms.createAlarmState({
        alarmId: alarmRes[0].id,
        alarmLevel: 1,
        validAfterTimestamp: new Date(mockNow).toISOString(),
        ackedBy: null,
      });

      assert.equal(alarmStateRes.length, 1);
      assert.equal(alarmStateRes[0].alarmLevel, 1);
      assert.deepEqual(alarmStateRes[0].validAfterTimestamp, new Date(mockNow).toISOString());
      assert.equal(alarmStateRes[0].ackedBy, null);
    });
  });
});
