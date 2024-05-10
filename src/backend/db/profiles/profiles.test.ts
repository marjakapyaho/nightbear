import { createTestContext, truncateDb } from 'backend/utils/test';
import { mockNow } from 'shared/mocks/dates';
import { mockProfileActivations, mockProfiles } from 'shared/mocks/profiles';
import { beforeEach, describe, expect, it } from 'vitest';

describe('db/profiles', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
  });

  it('creates profile', async () => {
    const createdProfile = context.db.createProfile(mockProfiles[0]);

    expect(createdProfile.profileName).toBe('Test profile');
    expect(createdProfile.alarmsEnabled).toBe(true);
    expect(createdProfile.situationSettings.escalationAfterMinutes).toEqual([10, 10]);
    expect(createdProfile.situationSettings.snoozeMinutes).toBe(15);

    const [profileActivation] = await context.db.createProfileActivation(mockProfileActivations[0]);

    expect(profileActivation.profileTemplateId).toBe(mockProfileActivations[0].id);
    expect(profileActivation.activatedAt).toBe(mockNow);
  });
});
