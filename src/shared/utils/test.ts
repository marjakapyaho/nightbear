import { SensorEntry } from 'shared/types/timelineEntries';
import { Profile } from 'shared/types/profiles';
import { mockProfiles } from 'shared/mocks/profiles';

export const generateSensorEntries = ({
  currentTimestamp,
  bloodGlucoseHistory,
  latestEntryAge = 0, // when omitted, "latest" entry is "now"
  intervalMinutes = 5, // default interval between entries is 5 minutes
}: {
  currentTimestamp: number;
  bloodGlucoseHistory: (number | null)[]; // nulls mean gaps in data
  latestEntryAge?: number; // how long ago (in minutes) was the last entry in the array
  intervalMinutes?: number; // interval in minutes between entries
}): SensorEntry[] => {
  return bloodGlucoseHistory
    .map((bloodGlucose, index) => {
      if (!bloodGlucose) return null;
      const minutesAgo = latestEntryAge + (bloodGlucoseHistory.length - 1 - index) * intervalMinutes;
      const entryTimestamp = new Date(currentTimestamp - minutesAgo * 60 * 1000);
      return {
        type: 'DEXCOM_G6_SHARE',
        timestamp: entryTimestamp.toISOString(),
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
