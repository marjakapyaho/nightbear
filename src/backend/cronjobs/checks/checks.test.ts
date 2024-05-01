import { createTestContext, truncateDb } from 'backend/utils/test';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockProfileActivations, mockProfiles } from 'shared/mocks/profiles';
import { createProfileWithActivation } from 'backend/db/profiles/utils';
import { checks } from 'backend/cronjobs/checks/checks';
import { generateSeedData } from 'backend/db/seed';

describe('cronjobs/checks', () => {
  const context = createTestContext();

  beforeEach(async () => {
    await truncateDb(context);
    await generateSeedData(context);
  });

  it.skip('runs checks', async () => {
    /*    await checks(context);

    // TODO
    expect().toEqual();*/
  });
});
