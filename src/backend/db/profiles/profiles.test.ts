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
    const profile = mockProfiles[0];
    const activation = mockProfileActivations[0];

    const createdProfile = await context.db.createProfile(profile);
    const createdActivation = await context.db.createProfileActivation(activation);

    expect(createdProfile.id).toBe(profile.id);
    expect(createdActivation.profileTemplateId).toBe(profile.id);
    expect(createdActivation.activatedAt).toBe(mockNow);
  });
});
