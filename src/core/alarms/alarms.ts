import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import { ActiveProfile, Alarm, AlarmState, Situation, State } from 'core/models/model';
import { getAlarmState } from 'core/models/utils';
import { generateUuid } from 'core/utils/id';
import { filter, find, findIndex, last, map, sum, take, max } from 'lodash';
import { isNotNull } from 'server/utils/types';
import { objectKeys } from 'web/utils/types';

const INITIAL_ALARM_LEVEL = 1;

const alarmToString = (alarm: Alarm) => `${alarm.situationType} (level ${last(alarm.alarmStates)?.alarmLevel})`;
const situationToString = (situation: Situation) => `${situation} (new)`;

export function runAlarmChecks(context: Context, state: State, activeProfile: ActiveProfile, activeAlarms: Alarm[]) {
  const { log } = context;

  // If alarms are not enabled, remove all existing alarms and exit
  if (!activeProfile.alarmsEnabled) {
    return handleAlarmsToRemove(activeAlarms, context).then(alarms => {
      return context.storage.saveModels(alarms);
    });
  }

  const { alarmsToRemove, alarmsToKeep, alarmsToCreate } = detectAlarmActions(state, activeAlarms);
  const alarmsToLog = alarmsToKeep.map(alarmToString).concat(alarmsToCreate.map(situationToString));
  log(`3. Active alarms: ${alarmsToLog.join(', ') || 'n/a'}`);

  return Promise.all([
    handleAlarmsToRemove(alarmsToRemove, context),
    handleAlarmsToKeep(alarmsToKeep, activeProfile, context),
    handleAlarmsToCreate(alarmsToCreate, context),
  ]).then(modelArrays => {
    const alarmModels = modelArrays.reduce(
      (memo: Alarm[], next: Array<Alarm | null>) => memo.concat(next.filter(isNotNull)),
      [],
    );
    return context.storage.saveModels(alarmModels);
  });
}

export function detectAlarmActions(state: State, activeAlarms: Alarm[]) {
  const alarmsToRemove = filter(activeAlarms, alarm => !state[alarm.situationType]);
  const alarmsToKeep = filter(activeAlarms, alarm => state[alarm.situationType]);
  const alarmsToCreate = objectKeys(state)
    .map(situation => {
      if (!state[situation] || situation === 'COMPRESSION_LOW') return null; // COMPRESSION_LOW is treated as a special case: we don't want alarms created for it, even if the Situation exists
      if (find(alarmsToKeep, { situationType: situation })) return null;
      return situation;
    })
    .filter(isNotNull);

  return {
    alarmsToRemove,
    alarmsToKeep,
    alarmsToCreate,
  };
}

function handleAlarmsToRemove(alarms: Alarm[], context: Context): Promise<Alarm[]> {
  const modelsToSave: Alarm[] = [];

  alarms.forEach(alarm => {
    const changedAlarm = { ...alarm, isActive: false, deactivationTimestamp: context.timestamp() };
    modelsToSave.push(changedAlarm);

    // We're not waiting for the results of pushover acks
    context.pushover.ackAlarms(getAlarmState(alarm).pushoverReceipts);
  });

  return Promise.resolve(modelsToSave);
}

function handleAlarmsToKeep(
  alarms: Alarm[],
  activeProfile: ActiveProfile,
  context: Context,
): Promise<Array<Alarm | null>> {
  const { log } = context;

  return Promise.all(
    alarms.map(alarm => {
      const now = context.timestamp();
      const { alarmLevel, validAfterTimestamp, pushoverReceipts } = getAlarmState(alarm);
      let logPrefix = `Existing alarm ${alarmToString(alarm)}`;

      // Not yet valid
      if (now <= validAfterTimestamp) {
        log(
          `${logPrefix} is not yet valid again (${Math.round(
            (validAfterTimestamp - now) / MIN_IN_MS,
          )} min snooze left)`,
        );
        return Promise.resolve(null);
      }

      const hasBeenValidFor = Math.round((context.timestamp() - validAfterTimestamp) / MIN_IN_MS);
      const levelUpTimes = activeProfile.alarmSettings[alarm.situationType].escalationAfterMinutes;
      const accumulatedTimes = map(levelUpTimes, (_x, i) => sum(take(levelUpTimes, i + 1)));
      const neededLevel =
        findIndex(accumulatedTimes, minutes => minutes > hasBeenValidFor) + 1 || levelUpTimes.length + 1;
      const pushoverLevels = activeProfile.pushoverLevels;
      const pushoverRecipient = pushoverLevels[neededLevel - 2] || 'none';

      const nextTimeMilestone = accumulatedTimes.find(time => time >= hasBeenValidFor) || max(accumulatedTimes) || '?';
      logPrefix = `${logPrefix} has been valid for ${hasBeenValidFor}/${nextTimeMilestone} min`;

      if (neededLevel !== alarmLevel) {
        log(`${logPrefix} => will escalate to level ${neededLevel} (pushover "${pushoverRecipient}")`);

        // If recipient is none, just hold alarm for this level (used for pull notifications)
        if (pushoverRecipient === 'none') {
          return Promise.resolve(
            alarmWithUpdatedState(alarm, {
              alarmLevel: neededLevel,
              validAfterTimestamp,
              ackedBy: null,
              pushoverReceipts,
            }),
          );
        } else {
          return context.pushover
            .sendAlarm(alarm.situationType, pushoverRecipient)
            .then((receipt: string) => {
              // only persist the level upgrade IF the alarm got sent (so we get retries)
              return Promise.resolve(
                alarmWithUpdatedState(alarm, {
                  alarmLevel: neededLevel,
                  validAfterTimestamp,
                  ackedBy: null,
                  pushoverReceipts: [...pushoverReceipts, receipt],
                }),
              );
            })
            .catch(() => Promise.resolve(null));
        }
      } else {
        log(`${logPrefix} => not escalating yet`);

        return Promise.resolve(null);
      }
    }),
  );
}

function handleAlarmsToCreate(situationTypes: Situation[], context: Context): Promise<Alarm[]> {
  const modelsToSave: Alarm[] = [];

  situationTypes.forEach(situationType => {
    modelsToSave.push(createAlarm(situationType, INITIAL_ALARM_LEVEL, context));
  });

  return Promise.resolve(modelsToSave);
}

export function createAlarm(situationType: Situation, alarmLevel: number, context: Context): Alarm {
  return {
    modelType: 'Alarm',
    modelUuid: generateUuid(),
    timestamp: context.timestamp(),
    situationType,
    isActive: true,
    deactivationTimestamp: null,
    alarmStates: [
      {
        alarmLevel,
        validAfterTimestamp: context.timestamp(),
        ackedBy: null,
        pushoverReceipts: [],
      },
    ],
  };
}

export function alarmWithUpdatedState(alarm: Alarm, state: AlarmState) {
  return {
    ...alarm,
    alarmStates: [...alarm.alarmStates, state] as Alarm['alarmStates'],
  };
}
