export function assert(truth: any, message: string, clue?: any): void {
  if (truth) return
  let readableClue = ''
  if (clue) {
    try {
      readableClue = '\n\nassert() clue: ' + JSON.stringify(clue)
    } catch (err) {
      readableClue = '\n\nassert() clue stringification failed: ' + err
    }
  }
  throw new Error('Assertion Error: ' + message + readableClue)
}
