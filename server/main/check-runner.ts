import { MIN_IN_MS } from 'core/calculations/calculations';

let nextCheck: NodeJS.Timer;

export function runChecks() {
  // Clear previous timer (if exists)
  if (nextCheck) {
    global.clearTimeout(nextCheck);
  }

  // And set next one
  nextCheck = global.setTimeout(runChecks, 6 * MIN_IN_MS);

  // TODO: Load content from db and pass it to check functions
  console.log('Running checks');
  /* return getAnalysisContent()
     .then(runAnalysis)
     .then(runAlarmChecks);*/
}
