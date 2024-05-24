import { createTestContext, truncateDb } from '../../utils/test';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockNow } from '../../shared';

describe('db/carbEntries', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
  });

  describe('upsert new carb entry', () => {
    it('works', async () => {
      const carbEntry = await context.db.upsertCarbEntry({
        timestamp: mockNow,
        amount: 20,
        durationFactor: 1.5,
      });

      expect(carbEntry.timestamp).toMatch(/^\d+-.*T\d+.*Z$/);
      expect(carbEntry.amount).toBe(20);
      expect(carbEntry.durationFactor).toBe(1.5);
    });
  });
});
