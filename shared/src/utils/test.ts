import { SensorEntry } from '../types'
import { Profile } from '../types'
import { mockProfiles } from '../mocks'
import { getTimeAsISOStr, getTimeMinusTimeMs } from './time'
import { mockAlarms } from '../mocks'
import { Alarm } from '../types'
import { Situation } from '../types'

export const generateSensorEntries = ({
  currentTimestamp,
  bloodGlucoseHistory,
  latestEntryAge = 0, // when omitted, "latest" entry is "now"
}: {
  currentTimestamp: string
  bloodGlucoseHistory: (number | null)[] // nulls mean gaps in data
  latestEntryAge?: number // how long ago (in minutes) was the last entry in the array
}): SensorEntry[] => {
  return bloodGlucoseHistory
    .map((bloodGlucose, index) => {
      if (!bloodGlucose) return null
      const intervalMinutes = 5
      const minutesAgo = latestEntryAge + (bloodGlucoseHistory.length - 1 - index) * intervalMinutes
      const entryTimestamp = getTimeMinusTimeMs(currentTimestamp, minutesAgo * 60 * 1000)
      return {
        type: 'DEXCOM_G6_SHARE',
        timestamp: getTimeAsISOStr(entryTimestamp),
        bloodGlucose,
      }
    })
    .filter(entry => entry !== null) as SensorEntry[]
}

export const getMockActiveProfile = (profileName = 'day', alarmsEnabled = true): Profile => ({
  ...mockProfiles[0],
  alarmsEnabled,
  profileName,
})

export const getMockActiveAlarm = (situation: Situation): Alarm => ({
  ...mockAlarms[0],
  situation,
})
