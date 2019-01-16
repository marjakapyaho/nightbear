import {
  ActiveProfile,
  Alarm,
  AlarmState,
  GlobalModel,
  Model,
  ModelOfType,
  ModelType,
  SavedProfile,
  TimelineModel,
} from 'core/models/model';
import { getStorageKey } from 'core/storage/couchDbStorage';
import { isPlainObject, last as _last } from 'lodash';

// @see https://github.com/Microsoft/TypeScript/issues/21732 for why "any" rather than "undefined" :/
export function isModel(x: any): x is Model {
  return isPlainObject(x) && 'modelType' in x;
}

export function isTimelineModel(x: any): x is TimelineModel {
  return isModel(x) && 'timestamp' in x;
}

export function isGlobalModel(x: any): x is GlobalModel {
  return isModel(x) && !('timestamp' in x);
}

// @example array.filter(is('Alarm'))
// prettier-ignore
export function is<ArrayType extends Model, T1 extends ArrayType['modelType'] & ModelType>(mt1: T1): (model: unknown, _index?: number, array?: ArrayType[]) => model is ModelOfType<T1>;
// prettier-ignore
export function is<ArrayType extends Model, T1 extends ArrayType['modelType'] & ModelType, T2 extends ArrayType['modelType'] & ModelType>(mt1: T1, mt2: T2): (model: unknown, _index?: number, array?: ArrayType[]) => model is ModelOfType<T1> | ModelOfType<T2>;
// prettier-ignore
export function is<ArrayType extends Model, T1 extends ArrayType['modelType'] & ModelType, T2 extends ArrayType['modelType'] & ModelType, T3 extends ArrayType['modelType'] & ModelType>(mt1: T1, mt2: T2, mt3: T3): (model: unknown, _index?: number, array?: ArrayType[]) => model is ModelOfType<T1> | ModelOfType<T2> | ModelOfType<T3>;
export function is(...modelTypes: string[]) {
  return (model: unknown, _index: number, _array: any[]) =>
    isModel(model) ? modelTypes.includes(model.modelType) : false;
}

// @example array.sort(by('timestamp'))
export function by<T extends Model>(property: keyof T, order: 'largest-first' | 'largest-last' = 'largest-last') {
  return (a: T, b: T) => {
    if (a[property] < b[property]) return order === 'largest-last' ? -1 : 1;
    if (a[property] > b[property]) return order === 'largest-last' ? 1 : -1;
    return 0;
  };
}

// @example array.find(first)
export function first<T extends Model>(_: T, index: number, _array: T[]) {
  return index === 0;
}

// @example array.find(last)
export function last<T extends Model>(_: T, index: number, array: T[]) {
  return index === array.length - 1;
}

export function getAlarmState(alarm: Alarm): AlarmState {
  const latest = _last(alarm.alarmStates);
  if (!latest) throw new Error(`Couldn't get latest AlarmState from Alarm "${getStorageKey(alarm)}"`);
  return latest;
}

// This helper converts between a SavedProfile and ActiveProfile.
// Simply extending a SavedProfile into an ActiveProfile IS NOT SAFE, since excess property checks won't catch extra fields.
export function activateSavedProfile(profile: SavedProfile, timestamp: number): ActiveProfile {
  const { profileName, alarmsEnabled, analyserSettings, alarmSettings, pushoverLevels } = profile;
  return {
    modelType: 'ActiveProfile',
    timestamp,
    profileName,
    alarmsEnabled,
    analyserSettings,
    alarmSettings,
    pushoverLevels,
  };
}
