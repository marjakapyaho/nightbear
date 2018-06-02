import { MIN_IN_MS } from 'nightbear/core/calculations/calculations';
import Timer = NodeJS.Timer;

let nextCheck: Timer;

export function runChecks() {

  // Clear previous timer (if exists)
  if (nextCheck) {
    clearTimeout(nextCheck);
  }

  // And set next one
  nextCheck = setTimeout(runChecks, 6 * MIN_IN_MS);

  // TODO: Load content from db and pass it to check functions
  console.log('Running checks');
  /* return getAnalysisContent()
     .then(runAnalysis)
     .then(runAlarmChecks);*/
}
