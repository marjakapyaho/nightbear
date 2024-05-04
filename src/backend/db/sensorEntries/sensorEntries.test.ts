import { createTestContext, truncateDb } from 'backend/utils/test';
import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it } from 'vitest';

describe('db/sensorEntries', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
  });

  describe('create', () => {
    it('works', async () => {
      const res = await context.db.createSensorEntry({
        bloodGlucose: 5.6,
        type: 'DEXCOM_G6_SHARE',
      });

      expect(res.timestamp).toMatch(/^\d+-.*T\d+.*Z$/);
      expect(res.bloodGlucose).toBe(5.6);
      expect(res.type).toBe('DEXCOM_G6_SHARE');
    });
  });

  describe('byTimestamp', () => {
    it('works', async () => {
      const sensorEntry = await context.db.createSensorEntry({
        bloodGlucose: 8.3,
        type: 'DEXCOM_G6_SHARE',
      });

      const res = await context.db.getSensorEntriesByTimestamp({
        from: sensorEntry.timestamp,
        to: DateTime.fromISO(sensorEntry.timestamp).plus({ millisecond: 1 }).toUTC().toISO()!,
      });

      expect(res).toHaveLength(1);
      expect(res[0].timestamp).toBe(sensorEntry.timestamp);
      expect(res[0].bloodGlucose).toBe(sensorEntry.bloodGlucose);
      expect(res[0].type).toBe(sensorEntry.type);
    });
  });

  describe('latest', () => {
    it('works', async () => {
      const sensorEntry = await context.db.createSensorEntry({
        bloodGlucose: 6.7,
        type: 'DEXCOM_G6_SHARE',
      });

      const res = await context.db.getLatestSensorEntry();

      expect(res.timestamp).toBe(sensorEntry.timestamp);
      expect(res.bloodGlucose).toBe(sensorEntry.bloodGlucose);
      expect(res.type).toBe(sensorEntry.type);
    });
  });
});
