import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import _ from 'lodash';
import 'mocha';

describe('db/sensorEntries', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const res = await context.db.sensorEntries.create({
        bloodGlucose: 5.6,
        type: 'DEXCOM_G6_SHARE',
      });

      assert.equal(res.length, 1);
      assert.isTrue(_.isDate(res[0].timestamp));
      assert.equal(res[0].bloodGlucose, 5.6);
      assert.equal(res[0].type, 'DEXCOM_G6_SHARE');
    });
  });
});
