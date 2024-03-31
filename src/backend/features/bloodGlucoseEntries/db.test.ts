import { createDb } from 'backend/utils/db';
import { assert } from 'chai';
import _ from 'lodash';
import 'mocha';
import { UUID_REGEX } from 'shared/utils/id';

describe('features/bloodGlucoseEntries/db', () => {
  const db = createDb(String(process.env.DATABASE_URL));

  describe('insert', () => {
    it('works', async () => {
      const res = await db.bloodGlucoseEntries.create({
        type: 'MANUAL',
        bloodGlucose: 11.1,
      });

      assert.equal(res.length, 1);
      assert.match(res[0].id, UUID_REGEX);
      assert.isTrue(_.isDate(res[0].timestamp));
      assert.equal(res[0].type, 'MANUAL');
      assert.equal(res[0].bloodGlucose, 11.1);
    });
  });
});
