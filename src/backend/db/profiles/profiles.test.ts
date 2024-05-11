import { createTestContext, truncateDb } from 'backend/utils/test';
import { mockProfileActivations, mockProfiles } from 'shared/mocks/profiles';
import { UUID_REGEX } from 'shared/utils/id';
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
    const createdActivation = await context.db.createProfileActivation({
      ...activation,
      profileTemplateId: createdProfile.id,
    });

    expect(createdProfile.id).toMatch(UUID_REGEX);

    const profiles = await context.db.getProfiles();

    console.log({ profiles });
  });
});
