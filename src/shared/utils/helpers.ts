const getFactor = (numberOfZeros: number) => {
  const requiredZerosString = new Array(numberOfZeros).fill(0).join('');
  const factorString = `1${requiredZerosString}`;
  return parseInt(factorString);
};

export const getObjectKeys = <T extends {}>(object: T): Array<keyof T> => {
  return Object.keys(object) as any;
};

export const isNotNull = <T extends any>(x: T): x is NonNullable<T> => {
  return x !== null && typeof x !== 'undefined';
};

export const parseNumber = (num?: string) => {
  const parsed = parseInt(String(num));
  return isFinite(parsed) ? parsed : undefined;
};

export const isValidNumber = (num: number) => isFinite(num) && !isNaN(num);

export const roundNumberToFixedDecimals = (num: number, decimals = 0): number => {
  const factor = getFactor(decimals);
  return Math.round(num * factor) / factor;
};
