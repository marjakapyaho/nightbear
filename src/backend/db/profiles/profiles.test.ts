import { createTestContext } from 'backend/utils/test';
import { mockAnalyserSettings, mockSituationSettings } from 'shared/mocks/profiles';
import { expect } from 'vitest';

describe('db/profiles', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const analyserSettingsRes = await context.db.profiles.createAnalyserSettings(mockAnalyserSettings);

      const profileTemplateRes = await context.db.profiles.createProfileTemplate({
        profileName: 'Test profile',
        alarmsEnabled: true,
        analyserSettingsId: analyserSettingsRes[0].id,
      });

      expect(profileTemplateRes).toHaveLength(1);
      expect(profileTemplateRes[0].profileName).toBe('Test profile');
      expect(profileTemplateRes[0].alarmsEnabled).toBe(true);

      const situationSettingsRes = await Promise.all(
        mockSituationSettings.map(settings =>
          context.db.profiles.createSituationSettings({ ...settings, profileTemplateId: profileTemplateRes[0].id }),
        ),
      );

      expect(situationSettingsRes).toHaveLength(9); // Assuming the length should be checked after flattening if nested
      expect(situationSettingsRes[0][0].escalationAfterMinutes).toBe(10);
      expect(situationSettingsRes[0][0].snoozeMinutes).toBe(15);
    });
  });
});
