import { Alarm, Profile, Situation, State } from 'server/models/model';
import { filter, compact, map, find, sum, take, findIndex } from 'lodash';
import { MIN_IN_MS } from '../calculations/calculations';

export function runAlarmChecks(
  state: State,
  currentTimestamp: number,
  activeProfile: Profile,
  activeAlarms: Alarm[]) {

  const { alarmsToRemove, alarmsToKeep, alarmsToCreate } = detectAlarmActions(state, activeAlarms);

  handleAlarmsToRemove(alarmsToRemove);
  handleAlarmsToKeep(alarmsToKeep, currentTimestamp, activeProfile);
  handleAlarmsToCreate(alarmsToCreate);
}

export function detectAlarmActions(
  state: State,
  activeAlarms: Alarm[]) {

  const alarmsToRemove = filter(activeAlarms, (alarm) => !state[alarm.situationType]);
  const alarmsToKeep = filter(activeAlarms, (alarm) => state[alarm.situationType]);
  const alarmsToCreate = compact(map(state, (value, key) => {
    if (!value) return;
    if (find(alarmsToKeep, { situationType: key })) return;
    return key as Situation;
  }));

  return {
    alarmsToRemove,
    alarmsToKeep,
    alarmsToCreate,
  };
}

function handleAlarmsToRemove(alarms: Alarm[]) {
  alarms.forEach((alarm) => {
    const changedAlarm = Object.assign(alarm, ({ isActive: false }));
    console.log('Save changed alarm', changedAlarm);
    // We're not waiting for the results of pushover acks
    // TODO: pushover.ackAlarms(alarm.pushoverReceipts);
    // TODO: operations.push(app.data.updateAlarm(alarm));
  });
}

function handleAlarmsToKeep(
  alarms: Alarm[],
  currentTimestamp: number,
  activeProfile: Profile,
)  {
  alarms.forEach((alarm) => {

    // Not yet valid
    if (currentTimestamp <= alarm.validAfterTimestamp) {
      return;
    }

    const hasBeenValidFor = (currentTimestamp - alarm.validAfterTimestamp) / MIN_IN_MS;
    const levelUpTimes = activeProfile.alarmSettings[alarm.situationType].escalationAfterMinutes;
    const accumulatedTimes = map(levelUpTimes, (_x, i) => sum(take(levelUpTimes, i + 1)));
    const neededLevel = findIndex(accumulatedTimes, minutes => minutes > hasBeenValidFor) + 1 || levelUpTimes.length + 1;

    // TODO: find out correct level from settings.profile
    // this doesn't do anything yet
    const pushoverLevels = activeProfile.pushoverLevels;
    const pushoverRecipient = neededLevel <= pushoverLevels.length ? pushoverLevels[neededLevel - 1] : null;
    console.log(pushoverRecipient);

    if (neededLevel !== alarm.alarmLevel) {
      const changedAlarm = Object.assign(alarm, ({ alarmLevel: neededLevel }));
      console.log('Save changed alarm', changedAlarm); // Note: only if pushover is successful

      /*
      TODO: retry pushover logic here
      operations.push(
        app.pushover.sendAlarm(alarm.level, alarm.type, activeProfile.ALARM_RETRY, activeProfile.ALARM_EXPIRE)
          .then(receipt => { // only persist the level upgrade IF the alarm got sent (so we get retries)
            alarm.pushoverReceipts = alarm.pushoverReceipts || [];
            alarm.pushoverReceipts.push(receipt);
            return app.data.updateAlarm(alarm);
          })
          .catch(err => log.error('Sending alarm failed:', err))
      );
      */
    }

  });

}

function handleAlarmsToCreate(alarmTypes: Situation[]) {
  alarmTypes.forEach((alarmType) => {
    console.log('creating new alarm with type', alarmType);
    // TODO: operations.push(app.data.createAlarm(alarmType, 1)); // Initial alarm level
  });
}
