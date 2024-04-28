import { mockAnalyserSettings, mockSituationSettings } from 'shared/mocks/profiles';
import { Context } from 'backend/utils/api';
import { generateSensorEntries } from 'shared/utils/test';

export const generateSeedData = async (context: Context) => {
  /*  // Create timeline entries
  await Promise.all(
    generateSensorEntries({
      currentTimestamp: context.timestamp(),
      bloodGlucoseHistory: [5.6, 5.5, 5.4, 5.2],
    }).map(sensorEntry => context.db.sensorEntries.create(sensorEntry)),
  );

  await context.db.carbEntries.create({
    amount: 20,
    speedFactor: 1.5,
    timestamp: context.timestamp(),
  });

  await context.db.insulinEntries.create({
    amount: 5,
    type: 'FAST',
    timestamp: context.timestamp(),
  });

  await context.db.meterEntries.create({
    bloodGlucose: 8.5,
  });*/
  /*  // Create active alarm
  const [alarm] = await context.db.alarms.createAlarm({
    situation: 'LOW',
  });

  await context.db.alarms.createAlarmState({
    alarmId: alarm.id,
    alarmLevel: 0,
    validAfter: context.timestamp(),
  });

  // Create active profile
  const [analyserSettings] = await context.db.profiles.createAnalyserSettings(mockAnalyserSettings);

  const [profileTemplate] = await context.db.profiles.createProfileTemplate({
    profileName: 'Test profile',
    alarmsEnabled: true,
    analyserSettingsId: analyserSettings.id,
    notificationTargets: ['first', 'second'],
  });

  await Promise.all(
    mockSituationSettings.map(settings =>
      context.db.profiles.createSituationSettings({
        ...settings,
        profileTemplateId: profileTemplate.id,
      }),
    ),
  );

  await context.db.profiles.createProfileActivation({
    profileTemplateId: profileTemplate.id,
    activatedAt: context.timestamp(),
  });*/
};
