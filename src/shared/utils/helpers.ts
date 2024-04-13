export const objectKeys = <T extends {}>(object: T): Array<keyof T> => {
  return Object.keys(object) as any;
};

// Helper for excluding null & undefined.
// @example const arr: Array<string | null> = [];
//          const strings: Array<string> = arr.filter(isNotNull);
export const isNotNull = <T extends any>(x: T): x is NonNullable<T> => {
  return x !== null && typeof x !== 'undefined';
};

export const parseNumber = (num?: string) => {
  const parsed = parseInt(String(num));
  return isFinite(parsed) ? parsed : undefined;
};
