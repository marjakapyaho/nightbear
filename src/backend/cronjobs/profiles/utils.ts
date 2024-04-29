import { DateTime } from 'luxon';
import { isTimeSmallerOrEqual, TZ } from 'shared/utils/time';
import { DAY_IN_MS } from 'shared/utils/calculations';
import { ProfileActivation } from 'shared/types/profiles';
import { chain } from 'lodash';

type PotentialActivation = {
  id: string;
  activationTimestamp: string | null;
};

export const getActivationAsUTCTimestamp = (
  repeatTimeInLocalTimezone: string,
  now: string,
  timezone: string,
) => {
  const timeParts = repeatTimeInLocalTimezone.split(':').map(part => parseInt(part, 10));
  const currentTimestampInLocalTime = DateTime.fromISO(now).setZone(timezone);
  const repeatTimestampInLocalTime = currentTimestampInLocalTime.set({
    hour: timeParts[0],
    minute: timeParts[1],
  });

  // If time is in the future, move it to yesterday
  const timeInLocalTimezone =
    repeatTimestampInLocalTime > currentTimestampInLocalTime
      ? repeatTimestampInLocalTime.minus(DAY_IN_MS)
      : repeatTimestampInLocalTime;

  return timeInLocalTimezone.toUTC().toISO();
};

export const findRepeatingActivationToActivate = (
  profileActivations: ProfileActivation[],
  currentTimestamp: string,
  timezone: string,
) =>
  chain(profileActivations)
    .map(activation =>
      activation.repeatTimeInLocalTimezone
        ? {
            id: activation.id,
            activationTimestamp: getActivationAsUTCTimestamp(
              activation.repeatTimeInLocalTimezone,
              currentTimestamp,
              timezone,
            ),
          }
        : null,
    )
    .filter(activation => Boolean(activation && activation.activationTimestamp))
    .sortBy('activationTimestamp')
    .last()
    .value();

export const isActivationRepeating = (activation: ProfileActivation) =>
  activation.repeatTimeInLocalTimezone && !activation.deactivatedAt;

export const shouldRepeatingActivationBeSwitched = (
  currentActivation: ProfileActivation,
  potentialActivation: PotentialActivation,
) =>
  isActivationRepeating(currentActivation) &&
  potentialActivation &&
  potentialActivation.id !== currentActivation.id;

export const shouldNonRepeatingActivationBeDeactivated = (
  currentActivation: ProfileActivation,
  currentTimestamp: string,
) =>
  currentActivation.deactivatedAt &&
  isTimeSmallerOrEqual(currentActivation.deactivatedAt, currentTimestamp);
