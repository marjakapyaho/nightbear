import { chain, fill } from 'lodash'
import { DateTime } from 'luxon'
import {
  BloodGlucoseEntry,
  CarbEntry,
  InsulinEntry,
  MeterEntry,
  SensorEntry,
  TimelineEntries,
  ProfileActivation,
  Alarm,
} from '../types'
import { calculateAverageBg, MIN_IN_MS } from './calculations'
import { getTimeInMillis, getTimeMinusMinutes } from './time'
import { getFirstAlarmState } from './alarms'
import { highLimit, lowLimit } from './config'

// TODO
export const getFillColor = (bg: number | null) => {
  if (!bg) {
    return 'white'
  }
  if (bg > highLimit) {
    return '#F8CC6F'
  }
  if (bg < lowLimit) {
    return '#ee5a36'
  }
  return '#54c87e'
}

// TODO
export type Point = {
  isoTimestamp: string
  timestamp: number
  val: number | null
  color: string
  insulinEntry?: InsulinEntry
  meterEntry?: MeterEntry
  carbEntry?: CarbEntry
  profileActivations?: ProfileActivation[]
  alarms?: Alarm[]
}

export const getTimestampFlooredToEveryFiveMinutes = (timestamp: string) => {
  const dateTime = DateTime.fromISO(timestamp)
  const minuteSlot = Math.floor(dateTime.get('minute') / 5)
  return dateTime
    .set({ minute: minuteSlot * 5, second: 0, millisecond: 0 })
    .toUTC()
    .toISO()
}

export const getMergedBgEntries = (
  sensorEntries: SensorEntry[],
  meterEntries?: MeterEntry[],
): BloodGlucoseEntry[] =>
  chain(meterEntries ? [...sensorEntries, ...meterEntries] : sensorEntries)
    .sortBy('timestamp')
    .groupBy(entry => getTimestampFlooredToEveryFiveMinutes(entry.timestamp))
    .flatMap((entries, groupTimestamp) => ({
      bloodGlucose: calculateAverageBg(entries),
      timestamp: groupTimestamp,
    }))
    .value()

const getAndValidateEntry = <T extends BloodGlucoseEntry | InsulinEntry | MeterEntry | CarbEntry>(
  entries: T[],
): T | undefined => {
  if (entries.length > 1) {
    throw new Error('Multiple entries of type in slot.')
  }
  return entries.length === 1 ? entries[0] : undefined
}

export const mapTimelineEntriesToGraphPoints = (
  timelineEntries: TimelineEntries,
  rangeInMs: number,
  currentTimestamp: string,
): Point[] => {
  const {
    bloodGlucoseEntries,
    insulinEntries,
    meterEntries,
    carbEntries,
    profileActivations,
    alarms,
  } = timelineEntries

  const countOfFiveMinSlots = rangeInMs / (5 * MIN_IN_MS)
  const startSlotTimestamp = getTimestampFlooredToEveryFiveMinutes(currentTimestamp)
  const slotArray = fill(Array(countOfFiveMinSlots), null)

  return slotArray
    .map((_val, i): Point => {
      const timestamp = startSlotTimestamp && getTimeMinusMinutes(startSlotTimestamp, i * 5)

      if (!timestamp) {
        throw new Error('Could not calculate timestamp for slot')
      }

      const bgEntry = getAndValidateEntry(
        bloodGlucoseEntries.filter(
          entry => getTimestampFlooredToEveryFiveMinutes(entry.timestamp) === timestamp,
        ),
      )
      const insulinEntry = getAndValidateEntry(
        insulinEntries.filter(
          entry => getTimestampFlooredToEveryFiveMinutes(entry.timestamp) === timestamp,
        ),
      )
      const meterEntry = getAndValidateEntry(
        meterEntries.filter(
          entry => getTimestampFlooredToEveryFiveMinutes(entry.timestamp) === timestamp,
        ),
      )
      const carbEntry = getAndValidateEntry(
        carbEntries.filter(
          entry => getTimestampFlooredToEveryFiveMinutes(entry.timestamp) === timestamp,
        ),
      )

      const profileActivationsInSlot = profileActivations?.filter(
        activation => getTimestampFlooredToEveryFiveMinutes(activation.activatedAt) === timestamp,
      )
      const alarmsInSlot = alarms?.filter(
        alarm =>
          getTimestampFlooredToEveryFiveMinutes(getFirstAlarmState(alarm).timestamp) === timestamp,
      )

      const val = bgEntry ? bgEntry.bloodGlucose : null
      const color = getFillColor(val)

      return {
        isoTimestamp: timestamp,
        timestamp: getTimeInMillis(timestamp),
        val,
        color,
        ...(insulinEntry && { insulinEntry }),
        ...(meterEntry && { meterEntry }),
        ...(carbEntry && { carbEntry }),
        ...(profileActivationsInSlot && { profileActivations: profileActivationsInSlot }),
        ...(alarmsInSlot && { alarms: alarmsInSlot }),
      }
    })
    .reverse()
}
