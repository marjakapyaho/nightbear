import { createTestContext } from 'backend/utils/test';
import { describe, expect, it } from 'vitest';

describe('db/meterEntries', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const res = await context.db.meterEntries.create({
        bloodGlucose: 8.5,
      });

      expect(res).toHaveLength(1);
      expect(res[0].timestamp).toMatch(/^\d+-.*T\d+.*Z$/);
      expect(res[0].bloodGlucose).toBe(8.5);
    });
  });
});
