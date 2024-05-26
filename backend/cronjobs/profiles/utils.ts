import { DateTime } from 'luxon'
import { isTimeSmallerOrEqual } from '@nightbear/shared'
import { DAY_IN_MS } from '@nightbear/shared'
import { Profile, ProfileActivation } from '@nightbear/shared'
import { chain } from 'lodash'

type PotentialProfile = {
  id: string
  activationTimestamp: string | null
}

export const getActivationAsUTCTimestamp = (
  repeatTimeInLocalTimezone: string,
  now: string,
  timezone: string,
) => {
  const timeParts = repeatTimeInLocalTimezone.split(':').map(part => parseInt(part, 10))
  const currentTimestampInLocalTime = DateTime.fromISO(now).setZone(timezone)
  const repeatTimestampInLocalTime = currentTimestampInLocalTime.set({
    hour: timeParts[0],
    minute: timeParts[1],
  })

  // If time is in the future, move it to yesterday
  const timeInLocalTimezone =
    repeatTimestampInLocalTime > currentTimestampInLocalTime
      ? repeatTimestampInLocalTime.minus(DAY_IN_MS)
      : repeatTimestampInLocalTime

  return timeInLocalTimezone.toUTC().toISO()
}

export const findRepeatingTemplateToActivate = (
  profiles: Profile[],
  currentTimestamp: string,
  timezone: string,
): PotentialProfile | null =>
  chain(profiles)
    .map(profile =>
      profile.repeatTimeInLocalTimezone
        ? {
            id: profile.id,
            activationTimestamp: getActivationAsUTCTimestamp(
              profile.repeatTimeInLocalTimezone,
              currentTimestamp,
              timezone,
            ),
          }
        : null,
    )
    .filter(mappedProfile => Boolean(mappedProfile && mappedProfile.activationTimestamp))
    .sortBy('activationTimestamp')
    .last()
    .value()

export const isActivationRepeating = (activation: ProfileActivation) => !activation.deactivatedAt

export const shouldRepeatingActivationBeSwitched = (
  currentActivation: ProfileActivation,
  potentialProfileTemplate: PotentialProfile,
) =>
  isActivationRepeating(currentActivation) &&
  potentialProfileTemplate &&
  potentialProfileTemplate.id !== currentActivation.profileTemplateId

export const shouldNonRepeatingActivationBeDeactivated = (
  currentActivation: ProfileActivation,
  currentTimestamp: string,
) =>
  currentActivation.deactivatedAt &&
  isTimeSmallerOrEqual(currentActivation.deactivatedAt, currentTimestamp)

export const getLatestProfileActivation = (profileActivations: ProfileActivation[]) => {
  const latestActivation = chain(profileActivations).sortBy('activatedAt').last().value()
  if (!latestActivation) {
    throw new Error('Could not find any profile activations')
  }
  return latestActivation
}
