import { describe, expect, it } from 'vitest';
import { checkAndUpdateProfileActivations } from './profiles';
import { createTestContext } from 'backend/utils/test';
import { mockProfileActivations, mockProfiles } from 'shared/mocks/profiles';
import { createProfileWithActivation } from 'backend/db/profiles/profiles';
import { mockNow } from 'shared/mocks/dates';
import { getTimePlusTime } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';

describe('profiles/checkAndUpdateProfileActivations', () => {
  const context = createTestContext();

  // This test needs emptying db before
  it.skip('returns already active profile', async () => {
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

    const activeProfile = await checkAndUpdateProfileActivations(
      context,
      getTimePlusTime(mockNow, MIN_IN_MS),
    );
    expect(activeProfile).toEqual(profile1);
  });
});
