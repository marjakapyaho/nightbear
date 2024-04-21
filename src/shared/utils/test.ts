import { SensorEntry } from 'shared/types/timelineEntries';
import { Profile } from 'shared/types/profiles';
import { mockProfiles } from 'shared/mocks/profiles';
import { getTimeAsISOStr, getTimeSubtractedFrom } from 'shared/utils/time';

export const generateSensorEntries = ({
  currentTimestamp,
  bloodGlucoseHistory,
  latestEntryAge = 0, // when omitted, "latest" entry is "now"
}: {
  currentTimestamp: string;
  bloodGlucoseHistory: (number | null)[]; // nulls mean gaps in data
  latestEntryAge?: number; // how long ago (in minutes) was the last entry in the array
}): SensorEntry[] => {
  return bloodGlucoseHistory
    .map((bloodGlucose, index) => {
      if (!bloodGlucose) return null;
      const intervalMinutes = 5;
      const minutesAgo =
        latestEntryAge + (bloodGlucoseHistory.length - 1 - index) * intervalMinutes;
      const entryTimestamp = getTimeSubtractedFrom(currentTimestamp, minutesAgo * 60 * 1000);
      return {
        type: 'DEXCOM_G6_SHARE',
        timestamp: getTimeAsISOStr(entryTimestamp),
        bloodGlucose,
      };
    })
    .filter(entry => entry !== null) as SensorEntry[];
};

export const getMockActiveProfile = (profileName: string, alarmsEnabled?: boolean): Profile => ({
  ...mockProfiles[0],
  alarmsEnabled: alarmsEnabled || true,
  profileName,
});
