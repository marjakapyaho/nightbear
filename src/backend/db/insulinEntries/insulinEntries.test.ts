import { createTestContext } from 'backend/utils/test';
import { describe, expect, it } from 'vitest';

describe('db/insulinEntries', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const res = await context.db.insulinEntries.create({
        amount: 5,
        type: 'FAST',
      });

      expect(res).toHaveLength(1);
      expect(res[0].timestamp).toMatch(/^\d+-.*T\d+.*Z$/);
      expect(res[0].amount).toBe(5);
      expect(res[0].type).toBe('FAST');
    });
  });
});
