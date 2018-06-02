export function assertExhausted(x: never): any {
  throw new Error(
    `Assumed all cases handled during compile-time, but found an exception during run-time: ${x}`,
  );
}

export function assertNumber(x: any): number {
  if (typeof x !== 'number') throw new Error(`Expected "${x}" to be a number`);
  return x;
}

export function objectKeys<T extends {}>(object: T): (keyof T)[] {
  return Object.keys(object) as any;
}
