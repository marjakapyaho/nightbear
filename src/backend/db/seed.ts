import { mockAnalyserSettings, mockSituationSettings } from 'shared/mocks/profiles';
import { Context } from 'backend/utils/api';
import { generateSensorEntries } from 'shared/utils/test';
import { getTimeMinusTime } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';

export const generateSeedData = async (context: Context) => {
  const now = getTimeMinusTime(context.timestamp(), MIN_IN_MS);

  // Create timeline entries
  await context.db.sensorEntries.createSensorEntries({
    sensorEntries: generateSensorEntries({
      currentTimestamp: now,
      bloodGlucoseHistory: [3.8, 4.4, 4.9, 5.1, 5.3, 5.5, 5.6, 5.5, 4.5, 3.9],
      latestEntryAge: 1,
    }),
  });

  await context.db.carbEntries.createCarbEntries({
    carbEntries: [
      {
        timestamp: getTimeMinusTime(now, 50 * MIN_IN_MS),
        amount: 20,
        speedFactor: 1.5,
      },
    ],
  });

  await context.db.insulinEntries.createInsulinEntries({
    insulinEntries: [
      {
        timestamp: getTimeMinusTime(now, 15 * MIN_IN_MS),
        amount: 5,
        type: 'FAST',
      },
    ],
  });

  await context.db.meterEntries.createMeterEntries({
    meterEntries: [
      {
        timestamp: now,
        bloodGlucose: 5.8,
      },
    ],
  });

  // Create active alarm
  const [alarm] = await context.db.alarms.createAlarm({
    situation: 'LOW',
  });

  await context.db.alarms.createAlarmState({
    alarmId: alarm.id,
    alarmLevel: 0,
    validAfter: now,
  });

  // Create not active night profile
  const [analyserSettings1] =
    await context.db.profiles.createAnalyserSettings(mockAnalyserSettings);

  const [profileTemplate1] = await context.db.profiles.createProfileTemplate({
    profileName: 'Day',
    alarmsEnabled: true,
    analyserSettingsId: analyserSettings1.id,
    notificationTargets: ['first', 'second'],
  });

  await Promise.all(
    mockSituationSettings.map(settings =>
      context.db.profiles.createSituationSettings({
        ...settings,
        profileTemplateId: profileTemplate1.id,
      }),
    ),
  );

  await context.db.profiles.createProfileActivation({
    profileTemplateId: profileTemplate1.id,
    activatedAt: now,
  });

  // Create active profile
  const [analyserSettings2] =
    await context.db.profiles.createAnalyserSettings(mockAnalyserSettings);

  const [profileTemplate2] = await context.db.profiles.createProfileTemplate({
    profileName: 'Night',
    alarmsEnabled: true,
    analyserSettingsId: analyserSettings2.id,
    notificationTargets: ['first', 'second'],
  });

  await Promise.all(
    mockSituationSettings.map(settings =>
      context.db.profiles.createSituationSettings({
        ...settings,
        profileTemplateId: profileTemplate2.id,
      }),
    ),
  );

  await context.db.profiles.createProfileActivation({
    profileTemplateId: profileTemplate2.id,
    activatedAt: getTimeMinusTime(now, 300 * MIN_IN_MS),
    deactivatedAt: getTimeMinusTime(now, 2 * MIN_IN_MS),
  });
};
