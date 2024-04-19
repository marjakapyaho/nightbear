import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import 'mocha';

describe('db/insulinEntries', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const res = await context.db.insulinEntries.create({
        amount: 5,
        type: 'FAST',
      });

      assert.equal(res.length, 1);
      assert.match(res[0].timestamp, /^\d+-.*T\d+.*Z$/);
      assert.equal(res[0].amount, 5);
      assert.equal(res[0].type, 'FAST');
    });
  });
});
