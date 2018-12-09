import { Alarm, Profile, Situation, State } from 'core/models/model';
import { filter, compact, map, find, sum, take, findIndex } from 'lodash';
import { MIN_IN_MS } from '../calculations/calculations';
import { Context } from 'core/models/api';
import { isNotNull } from 'server/utils/types';

const INITIAL_ALARM_LEVEL = 1;

export function runAlarmChecks(
  context: Context,
  state: State,
  activeProfile: Profile,
  activeAlarms: Alarm[]) {

  const { alarmsToRemove, alarmsToKeep, alarmsToCreate } = detectAlarmActions(state, activeAlarms);

  return Promise.all([
    handleAlarmsToRemove(alarmsToRemove, context),
    handleAlarmsToKeep(alarmsToKeep, context.timestamp(), activeProfile, context),
    handleAlarmsToCreate(alarmsToCreate, context),
  ])
    .then((modelArrays) => {
      const alarmModels = modelArrays.reduce((memo: Alarm[], next: Array<Alarm | null>) => memo.concat(next.filter(isNotNull)), []);
      return context.storage.saveModels(alarmModels);
    });
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

function handleAlarmsToRemove(alarms: Alarm[], context: Context): Promise<Alarm[]> {
  const modelsToSave: Alarm[] = [];

  alarms.forEach((alarm) => {
    const changedAlarm = Object.assign(alarm, ({
      isActive: false,
      pushoverReceipts: [],
    }));
    modelsToSave.push(changedAlarm);

    // We're not waiting for the results of pushover acks
    context.pushover.ackAlarms(alarm.pushoverReceipts);
  });

  return Promise.resolve(modelsToSave);
}

function handleAlarmsToKeep(
  alarms: Alarm[],
  currentTimestamp: number,
  activeProfile: Profile,
  context: Context,
): Promise<Array<Alarm | null>>  {

  return Promise.all(alarms.map((alarm) => {

    // Not yet valid
    if (currentTimestamp <= alarm.validAfterTimestamp) {
      return Promise.resolve(null);
    }

    const hasBeenValidFor = (currentTimestamp - alarm.validAfterTimestamp) / MIN_IN_MS;
    const levelUpTimes = activeProfile.alarmSettings[alarm.situationType].escalationAfterMinutes;
    const accumulatedTimes = map(levelUpTimes, (_x, i) => sum(take(levelUpTimes, i + 1)));
    const neededLevel = findIndex(accumulatedTimes, minutes => minutes > hasBeenValidFor) + 1 || levelUpTimes.length + 1;
    const pushoverLevels = activeProfile.pushoverLevels;
    const pushoverRecipient = neededLevel <= pushoverLevels.length ? pushoverLevels[neededLevel - 1] : 'none';

    if (neededLevel !== alarm.alarmLevel) {

      const changedAlarm = { ...alarm, alarmLevel: neededLevel };

      // If recipient is none, just hold alarm for this level (used for pull notifications)
      if (pushoverRecipient === 'none') {
        return Promise.resolve(changedAlarm);
      }
      else {
        return context.pushover.sendAlarm(changedAlarm.situationType, pushoverRecipient)
          .then((receipt: string) => { // only persist the level upgrade IF the alarm got sent (so we get retries)
            changedAlarm.pushoverReceipts.push(receipt);
            return Promise.resolve(changedAlarm);
          })
          .catch(() => Promise.resolve(null));
      }
    }
    else {
      return Promise.resolve(null);
    }
  }));
}

function handleAlarmsToCreate(situationTypes: Situation[], context: Context): Promise<Alarm[]> {
  const modelsToSave: Alarm[] = [];

  situationTypes.forEach((situationType) => {
    modelsToSave.push(createAlarm(situationType, INITIAL_ALARM_LEVEL, context));
  });

  return Promise.resolve(modelsToSave);
}

export function createAlarm(
  situationType: Situation,
  alarmLevel: number,
  context: Context,
  ): Alarm {
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
