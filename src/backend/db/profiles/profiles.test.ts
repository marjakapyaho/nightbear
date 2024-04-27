import { createTestContext } from 'backend/utils/test';
import { mockAnalyserSettings, mockSituationSettings } from 'shared/mocks/profiles';
import { describe, expect, it } from 'vitest';

describe('db/profiles', () => {
  const context = createTestContext();

  // TODO: support for notificationTargets
  it.skip('creates profile', async () => {
    const [analyserSettings] =
      await context.db.profiles.createAnalyserSettings(mockAnalyserSettings);

    const [profileTemplate] = await context.db.profiles.createProfileTemplate({
      profileName: 'Test profile',
      alarmsEnabled: true,
      analyserSettingsId: analyserSettings.id,
      notificationTargets: ['first', 'second'],
    });

    expect(profileTemplate.profileName).toBe('Test profile');
    expect(profileTemplate.alarmsEnabled).toBe(true);

    const [situationSettings] = await Promise.all(
      mockSituationSettings.map(settings =>
        context.db.profiles.createSituationSettings({
          ...settings,
          profileTemplateId: profileTemplate.id,
        }),
      ),
    );

    expect(situationSettings[0].escalationAfterMinutes).toBe(10);
    expect(situationSettings[0].snoozeMinutes).toBe(15);
  });
});
