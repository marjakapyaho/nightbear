import { beforeEach, describe, expect, it } from 'vitest';
import { checkAndUpdateProfileActivations } from './profiles';
import { createTestContext, truncateDb } from 'backend/utils/test';
import {
  mockAnalyserSettings,
  mockProfileActivations,
  mockProfiles,
  mockSituationSettings,
} from 'shared/mocks/profiles';
import { createProfileWithActivation } from 'backend/db/profiles/profiles';
import { Profile } from 'shared/types/profiles';

describe('profiles/checkAndUpdateProfileActivations', () => {
  const context = createTestContext();
  let dayProfile: Profile | undefined;
  let nightProfile: Profile | undefined;

  beforeEach(async () => {
    await truncateDb(context);
  });

  // This test needs emptying db before
  it('returns already active day profile', async () => {
    dayProfile = await createProfileWithActivation(
      mockProfiles[0],
      mockProfileActivations[0],
      context,
    );

    nightProfile = await createProfileWithActivation(
      mockProfiles[1],
      mockProfileActivations[1],
      context,
    );

    const activeProfile = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T12:30:00.000Z',
      'utc',
    );
    expect(activeProfile).toEqual(dayProfile);
  });

  it('activates night profile at 20:00', async () => {
    dayProfile = await createProfileWithActivation(
      mockProfiles[0],
      mockProfileActivations[0],
      context,
    );

    nightProfile = await createProfileWithActivation(
      mockProfiles[1],
      mockProfileActivations[1],
      context,
    );

    // Still day at 19:59
    const activeProfile1 = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T19:59:00.000Z',
      'utc',
    );
    expect(activeProfile1).toEqual(dayProfile);

    // Night at 20:01
    const activeProfile2 = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T20:01:00.000Z',
      'utc',
    );
    expect(activeProfile2).toEqual({ ...nightProfile, isActive: true });
  });

  it('does not activate repeating profile when non-repeating profile is still current', async () => {
    nightProfile = await createProfileWithActivation(
      mockProfiles[1],
      mockProfileActivations[1],
      context,
    );

    const nonRepeatingProfile = await createProfileWithActivation(
      {
        id: '3',
        profileName: 'Meeting',
        isActive: true,
        alarmsEnabled: true,
        analyserSettings: mockAnalyserSettings,
        situationSettings: mockSituationSettings,
        notificationTargets: ['first', 'second'],
      },
      {
        id: '789',
        profileTemplateId: '3',
        profileName: 'Meeting',
        activatedAt: '2024-04-27T09:01:23.123Z',
        deactivatedAt: '2024-04-27T10:15:00.000Z',
      },
      context,
    );

    const activeProfile = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T10:05:00.000Z',
      'utc',
    );
    expect(activeProfile).toEqual({ ...nonRepeatingProfile, isActive: true });
  });

  it('activates repeating profile when non-repeating profile is outdated', async () => {
    const nonActiveDayProfile = await createProfileWithActivation(
      {
        id: '1',
        profileName: 'Day',
        isActive: false,
        alarmsEnabled: true,
        analyserSettings: mockAnalyserSettings,
        situationSettings: mockSituationSettings,
        notificationTargets: ['first', 'second'],
      },
      {
        id: '456',
        profileTemplateId: '1',
        profileName: 'Day',
        activatedAt: '2024-04-27T08:00:00.123Z',
        repeatTimeInLocalTimezone: '8:00',
      },
      context,
    );

    const meetingProfile = await createProfileWithActivation(
      {
        id: '3',
        profileName: 'Meeting',
        isActive: false,
        alarmsEnabled: true,
        analyserSettings: mockAnalyserSettings,
        situationSettings: mockSituationSettings,
        notificationTargets: ['first', 'second'],
      },
      {
        id: '789',
        profileTemplateId: '3',
        profileName: 'Meeting',
        activatedAt: '2024-04-27T09:01:23.123Z',
        deactivatedAt: '2024-04-27T10:15:00.000Z',
      },
      context,
    );

    const activeProfile1 = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T10:00:00.000Z',
      'utc',
    );
    expect(activeProfile1).toEqual({ ...meetingProfile, isActive: true });

    const activeProfile2 = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T10:16:00.000Z',
      'utc',
    );
    expect(activeProfile2).toEqual({ ...nonActiveDayProfile, isActive: true });
  });
});
