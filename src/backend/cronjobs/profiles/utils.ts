import { DateTime } from 'luxon';
import { TZ } from 'shared/utils/time';
import { DAY_IN_MS } from 'shared/utils/calculations';

export const getActivationAsUTCTimestamp = (repeatTimeInLocalTimezone: string, now: string) => {
  const timeParts = repeatTimeInLocalTimezone.split(':').map(part => parseInt(part, 10));
  const currentTimestampInLocalTime = DateTime.fromISO(now).setZone(TZ);
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
