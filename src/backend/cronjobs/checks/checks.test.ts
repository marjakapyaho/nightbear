import { checkActiveAlarms, createTestContext, truncateDb } from 'backend/utils/test';
import { beforeEach, describe, expect, it } from 'vitest';
import { generateSeedData } from 'backend/db/seed';
import { checks } from './checks';
import { generateSensorEntries } from 'shared/utils/test';
import { getTimePlusTime } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { mockNow } from 'shared/mocks/dates';
import { Alarm } from 'shared/types/alarms';

describe('cronjobs/checks', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
    await generateSeedData(context);
  });

  it('runs checks', async () => {
    let currentTimestamp = mockNow;
    let alarms: Alarm[];

    // Current timestamp = mockNow
    alarms = await checkActiveAlarms(context);
    expect(alarms).toHaveLength(1);
    expect(alarms[0].situation).toEqual('LOW');

    await checks({ ...context, timestamp: () => currentTimestamp });

    // Keeps LOW alarm
    alarms = await checkActiveAlarms(context);
    expect(alarms).toHaveLength(1);
    expect(alarms[0].situation).toEqual('LOW');

    currentTimestamp = getTimePlusTime(mockNow, 5 * MIN_IN_MS);
    await context.db.sensorEntries.createSensorEntries({
      sensorEntries: generateSensorEntries({
        currentTimestamp,
        bloodGlucoseHistory: [4.3],
        latestEntryAge: 0,
      }),
    });

    await checks({ ...context, timestamp: () => currentTimestamp });

    // Does not yet remove LOW alarm as we're not enough above limit
    alarms = await checkActiveAlarms(context);
    expect(alarms).toHaveLength(1);
    expect(alarms[0].situation).toEqual('LOW');

    currentTimestamp = getTimePlusTime(mockNow, 10 * MIN_IN_MS);
    await context.db.sensorEntries.createSensorEntries({
      sensorEntries: generateSensorEntries({
        currentTimestamp,
        bloodGlucoseHistory: [4.9],
        latestEntryAge: 0,
      }),
    });

    await checks({ ...context, timestamp: () => currentTimestamp });

    // Removes LOW alarm that is no longer current
    alarms = await checkActiveAlarms(context);
    expect(alarms).toHaveLength(0);

    currentTimestamp = getTimePlusTime(mockNow, 35 * MIN_IN_MS);
    await context.db.sensorEntries.createSensorEntries({
      sensorEntries: generateSensorEntries({
        currentTimestamp,
        bloodGlucoseHistory: [5.6, 6.5, 7.5, 8.7, 9.9],
        latestEntryAge: 0,
      }),
    });
    await checks({ ...context, timestamp: () => currentTimestamp });

    // Adds RISING alarm
    alarms = await checkActiveAlarms(context);
    expect(alarms).toHaveLength(1);
    expect(alarms[0].situation).toEqual('RISING');
    const risingAlarmId = alarms[0].id;

    currentTimestamp = getTimePlusTime(mockNow, 40 * MIN_IN_MS);
    await context.db.sensorEntries.createSensorEntries({
      sensorEntries: generateSensorEntries({
        currentTimestamp,
        bloodGlucoseHistory: [10.5],
        latestEntryAge: 0,
      }),
    });

    await checks({ ...context, timestamp: () => currentTimestamp });

    // Removes RISING alarm and adds new HIGH alarm
    alarms = await checkActiveAlarms(context);
    expect(alarms).toHaveLength(1);
    expect(alarms[0].id).not.toEqual(risingAlarmId);
    expect(alarms[0].situation).toEqual('HIGH');
  });
});
