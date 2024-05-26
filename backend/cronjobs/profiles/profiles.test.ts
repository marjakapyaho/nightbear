import { beforeEach, describe, expect, it } from 'vitest'
import { checkAndUpdateProfileActivations } from './profiles'
import { createTestContext, truncateDb } from '../../utils/test'
import {
  mockAnalyserSettings,
  mockProfileActivations,
  mockProfiles,
  mockSituationSettings,
} from '@nightbear/shared'
import { Profile, ProfileActivation } from '@nightbear/shared'
import { Context } from '../../utils/api'

const createProfileWithActivation = async (
  profile: Profile,
  profileActivation: ProfileActivation,
  context: Context,
) => {
  const profileTemplate = await context.db.createProfile(profile)
  await context.db.createProfileActivation({
    ...profileActivation,
    profileTemplateId: profileTemplate.id,
  })
  return context.db.getProfileById(profileTemplate.id)
}

describe('profiles/checkAndUpdateProfileActivations', () => {
  const context = createTestContext()
  let dayProfile: Profile | undefined
  let nightProfile: Profile | undefined

  beforeEach(async () => {
    await truncateDb(context)
  })

  it('returns already active day profile', async () => {
    dayProfile = await createProfileWithActivation(
      mockProfiles[0],
      mockProfileActivations[0],
      context,
    )

    nightProfile = await createProfileWithActivation(
      mockProfiles[1],
      mockProfileActivations[1],
      context,
    )
    const activeProfile = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T12:30:00.000Z',
      'utc',
    )
    expect(activeProfile).toEqual(dayProfile)
  })

  it('activates night profile at 20:00', async () => {
    dayProfile = await createProfileWithActivation(
      mockProfiles[0],
      mockProfileActivations[0],
      context,
    )

    nightProfile = await createProfileWithActivation(
      mockProfiles[1],
      mockProfileActivations[1],
      context,
    )

    // Still day at 19:59
    const activeProfile1 = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T19:59:00.000Z',
      'utc',
    )
    expect(activeProfile1).toEqual(dayProfile)

    // Night at 20:01
    const activeProfile2 = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T20:01:00.000Z',
      'utc',
    )
    expect(activeProfile2).toEqual({ ...nightProfile, isActive: true })
  })

  it('does not activate repeating profile when non-repeating profile is still valid', async () => {
    nightProfile = await createProfileWithActivation(
      mockProfiles[1],
      mockProfileActivations[1],
      context,
    )

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
    )

    const activeProfile = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T10:05:00.000Z',
      'utc',
    )
    expect(activeProfile).toEqual({ ...nonRepeatingProfile, isActive: true })
  })

  it('activates correct repeating profile when non-repeating profile is outdated', async () => {
    dayProfile = await createProfileWithActivation(
      { ...mockProfiles[0], isActive: false },
      mockProfileActivations[0],
      context,
    )

    nightProfile = await createProfileWithActivation(
      mockProfiles[1],
      mockProfileActivations[1],
      context,
    )

    // Temporary meeting profile that is now active
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
    )

    // Still meeting profile
    const activeProfile1 = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T10:00:00.000Z',
      'utc',
    )
    expect(activeProfile1).toEqual({ ...meetingProfile, isActive: true })

    // Meeting profile reached deactivatedAt so repeating day profile was activated
    const activeProfile2 = await checkAndUpdateProfileActivations(
      context,
      '2024-04-27T10:16:00.000Z',
      'utc',
    )
    expect(activeProfile2).toEqual({ ...dayProfile, isActive: true })
  })
})
