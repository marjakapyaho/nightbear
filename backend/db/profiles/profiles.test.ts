import { createTestContext, truncateDb } from '../../utils/test';
import { mockProfileActivations, mockProfiles } from '@nightbear/shared';
import { UUID_REGEX } from '@nightbear/shared';
import { beforeEach, describe, expect, it } from 'vitest';

describe('db/profiles', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
  });

  it('creates profile', async () => {
    const profile = mockProfiles[0];
    const activation = mockProfileActivations[0];

    const createdProfile = await context.db.createProfile(profile);

    await context.db.createProfileActivation({
      ...activation,
      profileTemplateId: createdProfile.id,
    });

    expect(createdProfile.id).toMatch(UUID_REGEX);

    const profiles = await context.db.getProfiles();

    expect(profiles).toHaveLength(1);
    expect(profiles[0]).toEqual({
      id: expect.stringMatching(UUID_REGEX),
      profileName: 'Day',
      repeatTimeInLocalTimezone: '8:00',
      isActive: true,
      alarmsEnabled: true,
      analyserSettings: {
        highLevelRel: 8,
        highLevelAbs: 10,
        highLevelBad: 14,
        lowLevelRel: 6,
        lowLevelAbs: 4,
        timeSinceBgMinutes: 30,
      },
      situationSettings: {
        outdated: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        criticalOutdated: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        falling: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        rising: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        low: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        badLow: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        compressionLow: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        high: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        badHigh: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        persistentHigh: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
        missingDayInsulin: { escalationAfterMinutes: [10, 10], snoozeMinutes: 15 },
      },
      notificationTargets: ['first', 'second'],
    });
  });
});
