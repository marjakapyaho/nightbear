import { Alarm, Model, Profile, Situation, State } from 'core/models/model';
import { filter, compact, map, find, sum, take, findIndex } from 'lodash';
import { MIN_IN_MS } from '../calculations/calculations';
import { Context } from 'core/models/api';

const INITIAL_ALARM_LEVEL = 1;

export function runAlarmChecks(
  state: State,
  context: Context,
  currentTimestamp: number,
  activeProfile: Profile,
  activeAlarms: Alarm[]) {

  const { alarmsToRemove, alarmsToKeep, alarmsToCreate } = detectAlarmActions(state, activeAlarms);

  handleAlarmsToRemove(alarmsToRemove, context);
  handleAlarmsToKeep(alarmsToKeep, currentTimestamp, activeProfile, context);
  handleAlarmsToCreate(alarmsToCreate, context);
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

function handleAlarmsToRemove(alarms: Alarm[], context: Context) {
  const modelsToSave: Model[] = [];

  alarms.forEach((alarm) => {
    const changedAlarm = Object.assign(alarm, ({
      isActive: false,
      pushoverReceipts: [],
    }));
    modelsToSave.push(changedAlarm);

    // We're not waiting for the results of pushover acks
    context.pushover.ackAlarms(alarm.pushoverReceipts);
  });

  context.storage.saveModels(modelsToSave)
    .then(() => console.log('Removed alarms'));
}

function handleAlarmsToKeep(
  alarms: Alarm[],
  currentTimestamp: number,
  activeProfile: Profile,
  context: Context,
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

    const pushoverLevels = activeProfile.pushoverLevels;
    const pushoverRecipient = neededLevel <= pushoverLevels.length ? pushoverLevels[neededLevel - 1] : 'none';

    if (neededLevel !== alarm.alarmLevel) {

      const changedAlarm = Object.assign(alarm, ({ alarmLevel: neededLevel }));

      // If recipient is none, just hold alarm for this level (used for pull notifications)
      if (pushoverRecipient === 'none') {
        return context.storage.saveModels([changedAlarm]);
      }
      else {
        return context.pushover.sendAlarm(changedAlarm.situationType, pushoverRecipient)
          .then((receipt: string) => { // only persist the level upgrade IF the alarm got sent (so we get retries)
            changedAlarm.pushoverReceipts.push(receipt);
            return context.storage.saveModels([changedAlarm]);
          })
          .catch(() => console.log('Sending Pushover alarm failed:'));
      }
    }

  });

}

function handleAlarmsToCreate(situationTypes: Situation[], context: Context) {
  const modelsToSave: Model[] = [];

  situationTypes.forEach((situationType) => {
    modelsToSave.push(createAlarm(situationType, INITIAL_ALARM_LEVEL, context));
  });

  context.storage.saveModels(modelsToSave)
    .then(() => console.log('Saved new alarms'));
}

export function createAlarm(
  situationType: Situation,
  alarmLevel: number,
  context: Context,
  ): Model {
  return {
    modelType: 'Alarm',
    timestamp: context.timestamp(),
    validAfterTimestamp: context.timestamp(),
    alarmLevel,
    situationType,
    isActive: true,
    pushoverReceipts: [],
  };
}
