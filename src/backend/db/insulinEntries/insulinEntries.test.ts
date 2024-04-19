import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import _ from 'lodash';
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
      assert.isTrue(_.isDate(res[0].timestamp));
      assert.equal(res[0].amount, 5);
      assert.equal(res[0].type, 'FAST');
    });
  });
});
