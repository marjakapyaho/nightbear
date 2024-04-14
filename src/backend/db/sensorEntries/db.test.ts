import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import _ from 'lodash';

describe('db/sensorEntries', () => {
  const context = createTestContext();

  describe('create', () => {
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

  describe('getSensorEntries', () => {
    it('works', async () => {
      const [sensorEntry] = await context.db.sensorEntries.create({
        bloodGlucose: 8.3,
        type: 'DEXCOM_G6_SHARE',
      });

      const res = await context.db.sensorEntries.byTimestamp({
        from: sensorEntry.timestamp,
        to: new Date(sensorEntry.timestamp.getTime() + 1), // not entirely sure why this also can't just be sensorEntry.timestamp...
      });

      assert.equal(res.length, 1);
      assert.deepEqual(res[0].timestamp, sensorEntry.timestamp);
      assert.equal(res[0].bloodGlucose, sensorEntry.bloodGlucose);
      assert.equal(res[0].type, sensorEntry.type);
    });
  });
});
