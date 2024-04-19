import { createTestContext } from 'backend/utils/test';
import { describe, expect, it } from 'vitest';

describe('db/carbEntries', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const res = await context.db.carbEntries.create({
        amount: 20,
        speedFactor: 1.5,
      });

      expect(res).toHaveLength(1);
      expect(res[0].timestamp).toMatch(/^\d+-.*T\d+.*Z$/);
      expect(res[0].amount).toBe(20);
      expect(res[0].speedFactor).toBe(1.5);
    });
  });
});
