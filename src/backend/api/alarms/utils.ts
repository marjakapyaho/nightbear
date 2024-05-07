import { isTimeSmaller } from 'shared/utils/time';
import { getAlarmState } from 'shared/utils/alarms';
import { Alarm } from 'shared/types/alarms';
import { Context } from 'backend/utils/api';
import { Profile } from 'shared/types/profiles';

export const isThereNothingToAck = (activeAlarm: Alarm, context: Context) =>
  !activeAlarm || isTimeSmaller(context.timestamp(), getAlarmState(activeAlarm).validAfter);

export const getSnoozeMinutesFromActiveProfile = async (activeAlarm: Alarm, context: Context) => {
  const profiles = await context.db.profiles.getProfiles();
  const activeProfile = profiles.find(profile => profile.isActive) as Profile; // TODO
  return (
    activeProfile?.situationSettings?.find(settings => settings.situation === activeAlarm.situation)
      ?.snoozeMinutes || 0
  );
};
