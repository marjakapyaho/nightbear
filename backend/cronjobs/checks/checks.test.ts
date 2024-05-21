import { createTestContext, generateSeedData, truncateDb } from '../../utils/test';
import { mockNow } from '@nightbear/shared';
import { Alarm } from '@nightbear/shared';
import { MIN_IN_MS } from '@nightbear/shared';
import { generateSensorEntries } from '@nightbear/shared';
import { getTimePlusTime } from '@nightbear/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { checks } from './checks';

describe('cronjobs/checks', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
    await generateSeedData(context);
  });

  it('runs checks', async () => {
    let currentTimestamp = mockNow;
    let alarm: Alarm | undefined;

    // Current timestamp = mockNow
    alarm = await context.db.getActiveAlarm();
    expect(alarm.situation).toBe('LOW');

    await checks({ ...context, timestamp: () => currentTimestamp });

    // Keeps LOW alarm
    alarm = await context.db.getActiveAlarm();
    expect(alarm.situation).toBe('LOW');

    currentTimestamp = getTimePlusTime(mockNow, 5 * MIN_IN_MS);
    await context.db.createSensorEntries(
      generateSensorEntries({
        currentTimestamp,
        bloodGlucoseHistory: [4.3],
        latestEntryAge: 0,
      }),
    );

    await checks({ ...context, timestamp: () => currentTimestamp });

    // Does not yet remove LOW alarm as we're not enough above limit
    alarm = await context.db.getActiveAlarm();
    expect(alarm.situation).toBe('LOW');

    currentTimestamp = getTimePlusTime(mockNow, 10 * MIN_IN_MS);
    await context.db.createSensorEntries(
      generateSensorEntries({
        currentTimestamp,
        bloodGlucoseHistory: [4.9],
        latestEntryAge: 0,
      }),
    );

    await checks({ ...context, timestamp: () => currentTimestamp });

    // Removes LOW alarm that is no longer current
    alarm = await context.db.getActiveAlarm();
    expect(alarm).toBeUndefined();

    currentTimestamp = getTimePlusTime(mockNow, 35 * MIN_IN_MS);
    await context.db.createSensorEntries(
      generateSensorEntries({
        currentTimestamp,
        bloodGlucoseHistory: [5.6, 6.5, 7.5, 8.7, 9.9],
        latestEntryAge: 0,
      }),
    );
    await checks({ ...context, timestamp: () => currentTimestamp });

    // Adds RISING alarm
    alarm = await context.db.getActiveAlarm();
    expect(alarm.situation).toBe('RISING');
    const risingAlarmId = alarm.id;

    currentTimestamp = getTimePlusTime(mockNow, 40 * MIN_IN_MS);
    await context.db.createSensorEntries(
      generateSensorEntries({
        currentTimestamp,
        bloodGlucoseHistory: [10.5],
        latestEntryAge: 0,
      }),
    );

    await checks({ ...context, timestamp: () => currentTimestamp });

    // Removes RISING alarm and adds new HIGH alarm
    alarm = await context.db.getActiveAlarm();
    expect(alarm.situation).toBe('HIGH');
    expect(alarm.id).not.toEqual(risingAlarmId);
  });
});
