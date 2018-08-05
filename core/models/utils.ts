import { Model, ModelType, ModelOfType } from 'core/models/model';

// @example array.filter(is('Alarm'))
export function is<T extends ModelType>(modelType: T) {
  return (model: Model): model is ModelOfType<T> => model.modelType === modelType;
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
