import { createTestContext, truncateDb } from 'backend/utils/test';
import { mockNow } from 'shared/mocks/dates';
import { mockAnalyserSettings, mockSituationSettings } from 'shared/mocks/profiles';
import { beforeEach, describe, expect, it } from 'vitest';

describe('db/profiles', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
  });

  it('creates profile', async () => {
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

    expect(situationSettings[0].escalationAfterMinutes).toEqual([10, 10]);
    expect(situationSettings[0].snoozeMinutes).toBe(15);

    const [profileActivation] = await context.db.profiles.createProfileActivation({
      profileTemplateId: profileTemplate.id,
      activatedAt: mockNow,
    });

    expect(profileActivation.profileTemplateId).toBe(profileTemplate.id);
    expect(profileActivation.activatedAt).toBe(mockNow);
  });
});
