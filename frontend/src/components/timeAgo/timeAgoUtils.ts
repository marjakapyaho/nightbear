import { roundTo0Decimals, roundTo1Decimals } from '@nightbear/shared'
import { Duration } from 'luxon'

// @example "15 min"
// @example "1.3 h"
// @example "1 h 15 min 30 s" (verbose)
// @example "5 days 10 h" (verbose)
export const getFormattedTs = (
  ts: number,
  verbose?: boolean,
  decimalsForMinutes?: boolean,
): string => {
  const d = Duration.fromMillis(Date.now() - ts)
  const { days, hours, minutes, seconds } = d
    .shiftTo('days', 'hours', 'minutes', 'seconds', 'milliseconds') // we ask for the ms just so that Luxon only gives us full seconds, not fractional ones
    .toObject()
  if (verbose) {
    if (days) {
      return `${days} days ${hours} h`
    } else if (hours) {
      return `${hours} h ${minutes} min ${seconds} s`
    } else if (minutes) {
      return `${minutes} min ${seconds} s`
    } else {
      return `${seconds} s`
    }
  } else {
    if (days) {
      return String(roundTo1Decimals(d.shiftTo('days').days)) + ' days'
    } else if (hours) {
      return String(roundTo1Decimals(d.shiftTo('hours').hours)) + ' h'
    } else if (minutes) {
      if (decimalsForMinutes) {
        return String(roundTo1Decimals(d.shiftTo('minutes').minutes)) + ' min'
      }
      return String(roundTo0Decimals(d.shiftTo('minutes').minutes)) + ' min'
    } else {
      return String(seconds) + ' s'
    }
  }
}
