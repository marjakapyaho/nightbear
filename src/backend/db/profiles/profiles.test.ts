import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import 'mocha';
import { mockAnalyserSettings, mockSituationSettings } from 'shared/mocks/profiles';

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

      assert.equal(profileTemplateRes.length, 1);
      assert.equal(profileTemplateRes[0].profileName, 'Test profile');
      assert.equal(profileTemplateRes[0].alarmsEnabled, true);

      const situationSettingsRes = await Promise.all(mockSituationSettings.map((settings) =>
        context.db.profiles.createSituationSettings({ ...settings, profileTemplateId: profileTemplateRes[0].id })))

      assert.equal(situationSettingsRes.length, 9);
      assert.equal(situationSettingsRes[0][0].escalationAfterMinutes, 10);
      assert.equal(situationSettingsRes[0][0].snoozeMinutes, 15);
    });
  });
});
