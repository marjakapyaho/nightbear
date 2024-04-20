import { createTestContext } from 'backend/utils/test';
import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

describe('db/sensorEntries', () => {
  const context = createTestContext();

  describe('create', () => {
    it('works', async () => {
      const res = await context.db.sensorEntries.create({
        bloodGlucose: 5.6,
        type: 'DEXCOM_G6_SHARE',
      });

      expect(res).toHaveLength(1);
      expect(res[0].timestamp).toMatch(/^\d+-.*T\d+.*Z$/);
      expect(res[0].bloodGlucose).toBe(5.6);
      expect(res[0].type).toBe('DEXCOM_G6_SHARE');
    });
  });

  describe('byTimestamp', () => {
    it('works', async () => {
      const [sensorEntry] = await context.db.sensorEntries.create({
        bloodGlucose: 8.3,
        type: 'DEXCOM_G6_SHARE',
      });

      const res = await context.db.sensorEntries.byTimestamp({
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
      const [sensorEntry] = await context.db.sensorEntries.create({
        bloodGlucose: 6.7,
        type: 'DEXCOM_G6_SHARE',
      });

      const res = await context.db.sensorEntries.latest();

      expect(res).toHaveLength(1);
      expect(res[0].timestamp).toBe(sensorEntry.timestamp);
      expect(res[0].bloodGlucose).toBe(sensorEntry.bloodGlucose);
      expect(res[0].type).toBe(sensorEntry.type);
    });
  });
});
