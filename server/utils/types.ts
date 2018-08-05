// Can be used to implement exhaustiveness checks in TS.
// Returns "any" for convenience.
export function assertExhausted(value: void): any {
  throw new Error(`Runtime behaviour doesn't match type definitions (value was "${value}")`);
}

export function assert(truth: any, message: string, clue?: any): void {
  if (truth) return;
  let readableClue = '';
  if (clue) {
    try {
      readableClue = '\n\nassert() clue: ' + JSON.stringify(clue);
    } catch (err) {
      readableClue = '\n\nassert() clue stringification failed: ' + err;
    }
  }
  throw new Error('Assertion Error: ' + message + readableClue);
}

// Helper for excluding null & undefined.
// @example const arr: Array<string | null> = [];
//          const strings: Array<string> = arr.filter(isNotNull);
export function isNotNull<T extends any>(x: T): x is NonNullable<T> {
  return x !== null && typeof x !== 'undefined';
}
