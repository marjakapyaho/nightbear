import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import 'mocha';

describe('db/carbEntries', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const res = await context.db.carbEntries.create({
        amount: 20,
        speedFactor: 1.5,
      });

      assert.equal(res.length, 1);
      assert.match(res[0].timestamp, /^\d+-.*T\d+.*Z$/);
      assert.equal(res[0].amount, 20);
      assert.equal(res[0].speedFactor, 1.5);
    });
  });
});
