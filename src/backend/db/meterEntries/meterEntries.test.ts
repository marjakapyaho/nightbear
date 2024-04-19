import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import _ from 'lodash';
import 'mocha';

describe('db/meterEntries', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const res = await context.db.meterEntries.create({
        bloodGlucose: 8.5,
      });

      assert.equal(res.length, 1);
      assert.isTrue(_.isDate(res[0].timestamp));
      assert.equal(res[0].bloodGlucose, 8.5);
    });
  });
});
