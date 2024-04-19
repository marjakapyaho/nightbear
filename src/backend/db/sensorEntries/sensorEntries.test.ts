import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import { DateTime } from 'luxon';

describe('db/sensorEntries', () => {
  const context = createTestContext();

  describe('create', () => {
    it('works', async () => {
      const res = await context.db.sensorEntries.create({
        bloodGlucose: 5.6,
        type: 'DEXCOM_G6_SHARE',
      });

      assert.equal(res.length, 1);
      assert.match(res[0].timestamp, /^\d+-.*T\d+.*Z$/);
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
        to: DateTime.fromISO(sensorEntry.timestamp).plus({ millisecond: 1 }).toUTC().toISO()!,
      });

      assert.equal(res.length, 1);
      assert.equal(res[0].timestamp, sensorEntry.timestamp);
      assert.equal(res[0].bloodGlucose, sensorEntry.bloodGlucose);
      assert.equal(res[0].type, sensorEntry.type);
    });
  });
});
