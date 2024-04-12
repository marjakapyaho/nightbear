import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import _ from 'lodash';
import 'mocha';

describe('db/alarms', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const res = await context.db.alarms.create({
        situationType: 'LOW',
        isActive: true,
      });

      assert.equal(res.length, 1);
      assert.isTrue(_.isDate(res[0].timestamp));
      assert.equal(res[0].situationType, 'LOW');
      assert.equal(res[0].isActive, true);
    });
  });
});
