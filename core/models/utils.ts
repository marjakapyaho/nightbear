import { Model, ModelType, ModelOfType } from 'core/models/model';
import { isPlainObject } from 'lodash';

export function isModel(x: any): x is Model {
  return isPlainObject(x) && 'modelType' in x;
}

// @example array.filter(is('Alarm'))
// prettier-ignore
export function is<ArrayType extends Model, T1 extends ArrayType['modelType'] & ModelType>(mt1: T1): (model: Model, _index: number, array: ArrayType[]) => model is ModelOfType<T1>;
// prettier-ignore
export function is<ArrayType extends Model, T1 extends ArrayType['modelType'] & ModelType, T2 extends ArrayType['modelType'] & ModelType>(mt1: T1, mt2: T2): (model: Model, _index: number, array: ArrayType[]) => model is ModelOfType<T1> | ModelOfType<T2>;
// prettier-ignore
export function is<ArrayType extends Model, T1 extends ArrayType['modelType'] & ModelType, T2 extends ArrayType['modelType'] & ModelType, T3 extends ArrayType['modelType'] & ModelType>(mt1: T1, mt2: T2, mt3: T3): (model: Model, _index: number, array: ArrayType[]) => model is ModelOfType<T1> | ModelOfType<T2> | ModelOfType<T3>;
export function is(...modelTypes: string[]) {
  return (model: Model, _index: number, _array: any[]) => modelTypes.includes(model.modelType);
}

// @example array.sort(by('timestamp'))
export function by<T extends Model>(
  property: keyof T,
  order: 'largest-first' | 'largest-last' = 'largest-last',
) {
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
