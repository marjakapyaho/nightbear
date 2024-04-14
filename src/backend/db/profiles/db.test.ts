import { createTestContext } from 'backend/utils/test';
import { assert } from 'chai';
import 'mocha';
import { mockAnalyserSettings, mockSituationSettings } from 'shared/mocks/profiles';

describe('db/profiles', () => {
  const context = createTestContext();

  describe('insert', () => {
    it('works', async () => {
      const analyserSettingsRes = await context.db.profiles.createAnalyserSettings(mockAnalyserSettings);

      const alarmSettingsRes = await context.db.profiles.createAlarmSettings({
        outdated: (await context.db.profiles.createSituationSettings(mockSituationSettings))[0].id,
        falling: (await context.db.profiles.createSituationSettings(mockSituationSettings))[0].id,
        rising: (await context.db.profiles.createSituationSettings(mockSituationSettings))[0].id,
        low: (await context.db.profiles.createSituationSettings(mockSituationSettings))[0].id,
        badLow: (await context.db.profiles.createSituationSettings(mockSituationSettings))[0].id,
        compressionLow: (await context.db.profiles.createSituationSettings(mockSituationSettings))[0].id,
        high: (await context.db.profiles.createSituationSettings(mockSituationSettings))[0].id,
        badHigh: (await context.db.profiles.createSituationSettings(mockSituationSettings))[0].id,
        persistentHigh: (await context.db.profiles.createSituationSettings(mockSituationSettings))[0].id,
      });

      const res = await context.db.profiles.createProfileTemplate({
        profileName: 'Test profile',
        alarmsEnabled: true,
        analyserSettingsId: analyserSettingsRes[0].id,
        alarmSettingsId: alarmSettingsRes[0].id
      });

      assert.equal(res.length, 1);
      assert.equal(res[0].profileName, 'Test profile');
      assert.equal(res[0].alarmsEnabled, true);
    });
  });
});
