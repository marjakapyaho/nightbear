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
