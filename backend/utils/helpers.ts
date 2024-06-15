export function assert(truth: unknown, message: string, clue?: unknown): void {
  if (truth) return
  let readableClue = ''
  if (clue) {
    try {
      readableClue = '\n\nassert() clue: ' + JSON.stringify(clue)
    } catch (err) {
      readableClue = '\n\nassert() clue stringification failed: ' + String(err)
    }
  }
  throw new Error('Assertion Error: ' + message + readableClue)
}
