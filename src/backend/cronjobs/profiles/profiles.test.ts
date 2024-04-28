import { describe, expect, it } from 'vitest';
import { checkAndUpdateProfileActivations } from './profiles';
import { createTestContext } from 'backend/utils/test';
import { mockProfileActivations, mockProfiles } from 'shared/mocks/profiles';
import { createProfileWithActivation } from 'backend/db/profiles/profiles';

describe('profiles/checkAndUpdateProfileActivations', () => {
  const context = createTestContext();

  it.skip('activates profile', async () => {
    const profile1 = await createProfileWithActivation(
      mockProfiles[0],
      mockProfileActivations[0],
      context,
    );
    const profile2 = await createProfileWithActivation(
      mockProfiles[1],
      mockProfileActivations[1],
      context,
    );

    const activeProfile = await checkAndUpdateProfileActivations(context);
    expect(activeProfile).toEqual(profile2);
  });
});
