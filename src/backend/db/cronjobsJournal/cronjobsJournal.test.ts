import { createTestContext, truncateDb } from 'backend/utils/test';
import { beforeEach, describe, expect, it } from 'vitest';

describe('db/cronjobsJournal', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
  });

  describe('update', () => {
    it.skip('works', async () => {
      const row = {
        previousExecutionAt: new Date('2020-01-01').toISOString(),
        dexcomShareLoginAttemptAt: new Date('2021-01-01').toISOString(),
        dexcomShareSessionId: '123-123-123',
      };

      const res = await context.db.cronjobsJournal.update(row);

      expect(res).toEqual([row]);
    });

    it.skip('allows nulls', async () => {
      const [row] = await context.db.cronjobsJournal.update({
        dexcomShareSessionId: '123-123-123',
      });

      expect(row.previousExecutionAt).toBeNull();
    });
  });
});
