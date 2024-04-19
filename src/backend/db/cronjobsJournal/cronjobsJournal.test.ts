import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import 'mocha';

describe('db/cronjobsJournal', () => {
  const context = createTestContext();

  describe('update', () => {
    it('works', async () => {
      const row = {
        previousExecutionAt: new Date('2020-01-01').toISOString(),
        dexcomShareLoginAttemptAt: new Date('2021-01-01').toISOString(),
        dexcomShareSessionId: '123-123-123',
      };

      const res = await context.db.cronjobsJournal.update(row);

      assert.deepEqual(res, [row]);
    });

    it('allows nulls', async () => {
      const [row] = await context.db.cronjobsJournal.update({
        dexcomShareSessionId: '123-123-123',
      });

      assert.isNull(row.previousExecutionAt);
    });
  });
});
