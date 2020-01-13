export function assertNumber(x: any): number {
  if (typeof x !== 'number') throw new Error(`Expected "${x}" to be a number`);
  return x;
}

export function objectKeys<T extends {}>(object: T): Array<keyof T> {
  return Object.keys(object) as any;
}
