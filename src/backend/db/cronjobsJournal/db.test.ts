import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import 'mocha';

describe('features/cronjobsJournal/db', () => {
  const {
    db: { cronjobsJournal },
  } = createTestContext();

  describe('update', () => {
    it('works', async () => {
      const row = {
        previousExecutionAt: new Date('2020-01-01'),
        dexcomShareLoginAttemptAt: new Date('2021-01-01'),
        dexcomShareSessionId: '123-123-123',
      };

      const res = await cronjobsJournal.update(row);

      assert.deepEqual(res, [row]);
    });

    it('allows nulls', async () => {
      const [row] = await cronjobsJournal.update({
        dexcomShareSessionId: '123-123-123',
      });

      assert.isNull(row.previousExecutionAt);
    });
  });
});
