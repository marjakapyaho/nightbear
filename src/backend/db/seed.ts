import { mockAnalyserSettings, mockProfiles, mockSituationSettings } from 'shared/mocks/profiles';
import { Context } from 'backend/utils/api';
import { generateSensorEntries } from 'shared/utils/test';
import { getTimeMinusTime } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';

export const generateSeedData = async (context: Context) => {
  const now = getTimeMinusTime(context.timestamp(), MIN_IN_MS);

  // Create timeline entries
  await context.db.createSensorEntries(
    generateSensorEntries({
      currentTimestamp: now,
      bloodGlucoseHistory: [3.8, 4.4, 4.9, 5.1, 5.3, 5.5, 5.6, 5.5, 4.5, 3.9],
      latestEntryAge: 1,
    }),
  );

  await context.db.createCarbEntries([
    {
      timestamp: getTimeMinusTime(now, 50 * MIN_IN_MS),
      amount: 20,
      durationFactor: 1.5,
    },
  ]);

  await context.db.createInsulinEntries([
    {
      timestamp: getTimeMinusTime(now, 30 * MIN_IN_MS),
      amount: 1,
      type: 'FAST',
    },
  ]);

  await context.db.createMeterEntries([
    {
      timestamp: getTimeMinusTime(now, 30 * MIN_IN_MS),
      bloodGlucose: 5.8,
    },
  ]);

  // Create active alarm
  await context.db.createAlarmWithState('LOW');

  // Create active day profile
  const dayProfile = await context.db.createProfile(mockProfiles[0]);
  await context.db.createProfileActivation({
    profileTemplateId: dayProfile.id,
    activatedAt: now,
  });

  // Create not active night profile
  const nightProfile = await context.db.createProfile(mockProfiles[1]);
  await context.db.createProfileActivation({
    profileTemplateId: nightProfile.id,
    activatedAt: getTimeMinusTime(now, 300 * MIN_IN_MS),
    deactivatedAt: getTimeMinusTime(now, 2 * MIN_IN_MS),
  });
};
