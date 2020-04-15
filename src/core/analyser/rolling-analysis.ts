import { runAnalysis } from 'core/analyser/analyser';
import { MIN_IN_MS } from 'core/calculations/calculations';
import { DEFAULT_STATE, Model, Situation, State, TimelineModel } from 'core/models/model';
import { firstModel, is, lastModel } from 'core/models/utils';
import { TypeOfArray } from 'core/types/utils';
import { first, flatten, groupBy, range, values } from 'lodash';
import { isNotNull } from 'server/utils/types';
import { objectKeys } from 'web/utils/types';
import { ALARM_FETCH_RANGE, ANALYSIS_RANGE } from 'server/main/check-runner';

export const BUCKET_SIZE = 5 * MIN_IN_MS; // this determines the granularity of the rolling analysis - i.e. run analyser every 5 minutes
export const PRE_MARGIN = ANALYSIS_RANGE; // how much history we want to make available to the analyser per each bucket

export type RollingAnalysisResults = Array<
  Array<
    [
      Situation,
      number, // start timestamp of the situation
      number, // duration of the situation
    ]
  >
>;

// Runs the analyser for each past point in time (granularity controlled by BUCKET_SIZE), so you can see what
// situations the analyser had active at each such point. Even though the presence of a situation is the thing
// that triggers the creation of alarms, this allows the user to view analyser results independent of alarms.
// This can be very helpful when debugging the analyser itself, for example, or figuring out why an alarm was
// raised at a specific time.
export function performRollingAnalysis(
  models: Model[],
  timelineRange: number,
  timelineRangeEnd: number,
  mergeContiguousSituations = true,
) {
  const buckets = getRollingAnalysisBuckets(timelineRange, timelineRangeEnd);
  const results = getRawRollingAnalysisResults(models, buckets);
  const lanes = toSituationLanes(results);
  console.debug(
    'Rolling analysis buckets',
    buckets.map(a => a.map(isoString).filter((_, i) => i > 0)),
  );
  return mergeContiguousSituations ? toContiguousLanes(lanes) : lanes;
}

// Takes raw rolling analysis results, and formats them nicely for UI presentation purposes.
// That is, returns an array ("lane") for each situation type, which contains start and duration
// times, indicating when that situation started and how long it lasted.
function toSituationLanes(resultsPerBucket: Array<[number, State]>): RollingAnalysisResults {
  const possibleSituations = objectKeys(DEFAULT_STATE);
  return values(
    groupBy(
      flatten(
        resultsPerBucket.map(([startTs, state]) =>
          possibleSituations
            .map(s => (state[s] ? ([s, startTs, BUCKET_SIZE] as [Situation, number, number]) : null))
            .filter(isNotNull),
        ),
      ),
      first,
    ),
  );
}

// Performs a sweep over each lane, so that any overlapping (or touching) situations get merged into a single, longer one
function toContiguousLanes(results: RollingAnalysisResults): RollingAnalysisResults {
  return results.map(lane => {
    let ongoing: TypeOfArray<typeof lane> | undefined = undefined;
    return lane
      .map(current => {
        if (
          ongoing && // there's an "ongoing situation" from a previous iteration of the loop
          ongoing[0] === current[0] && // it's of the same type
          ongoing[1] + ongoing[2] >= current[1] // its end timestamp is at (or later than) our start timestamp
        ) {
          ongoing[2] = current[1] + current[2] - ongoing[1]; // update the "ongoing situation", so its end timestamp becomes the same as our end timestamp
          return null; // because the "ongoing situation" now encompasses this one, this one can be dropped
        } else {
          return (ongoing = current); // mark the current situation as the "ongoing" one, so if the next iteration finds a neighbor, we can tell
        }
      })
      .filter(isNotNull);
  });
}

// Runs analysis for each of the given buckets (i.e. 5 minute slices of time)
function getRawRollingAnalysisResults(models: Model[], buckets: RollingAnalysisBucket[]): RollingAnalysisRawResult[] {
  const activeProfiles = models.filter(is('ActiveProfile'));
  if (!activeProfiles.length) throw new Error('Need at least one ActiveProfile to perform rolling analysis');
  const sensorEntries = models.filter(
    is('DexcomG6SensorEntry', 'DexcomSensorEntry', 'DexcomRawSensorEntry', 'ParakeetSensorEntry'),
  );
  const insulins = models.filter(is('Insulin'));
  const alarms = models.filter(is('Alarm'));
  let missingProfileBefore: number | undefined;
  const res = buckets.map(([base, from, to]) => {
    const relevantToThisBucket = (m: TimelineModel) => m.timestamp > base && m.timestamp < to;
    let activeProfile = activeProfiles.filter(m => m.timestamp < base).find(lastModel);
    if (!activeProfile) {
      activeProfile = activeProfiles.find(firstModel);
      if (!activeProfile) throw new Error('Could not find a fallback ActiveProfile for rolling analysis bucket');
      missingProfileBefore = to;
    }
    return [
      from,
      runAnalysis(
        to,
        activeProfile,
        sensorEntries.filter(relevantToThisBucket),
        insulins.filter(relevantToThisBucket),
        undefined, // TODO: Which DeviceStatus should go here..?
        alarms.filter(m => m.timestamp > to - ALARM_FETCH_RANGE && m.timestamp < to),
      ),
    ] as RollingAnalysisRawResult;
  });
  if (missingProfileBefore) {
    console.warn(
      `Could not find ActiveProfile for rolling analysis up to ${isoString(
        missingProfileBefore,
      )}; results before this may not be accurate`,
    );
  }
  return res;
}

type RollingAnalysisRawResult = [
  number, // Start timestamp of the 5 minute bucket in question
  State, // State object describing the results of the analysis for that point in time
];

// Chops the given amount of time into "buckets"; for each, the analyser can be ran independently
function getRollingAnalysisBuckets(timelineRange: number, timelineRangeEnd: number): RollingAnalysisBucket[] {
  return range(
    timelineRangeEnd - timelineRange + BUCKET_SIZE,
    timelineRangeEnd + BUCKET_SIZE,
    BUCKET_SIZE,
  ).map(startTs => [startTs - PRE_MARGIN, startTs - BUCKET_SIZE, startTs]);
}

type RollingAnalysisBucket = [
  number, // "base" - timestamp starting from which Models will be considered during analysis
  number, // "from" - timestamp of the start of the bucket
  number, // "to" - timestamp of the end of the bucket
];

function isoString(ts: number): string {
  return new Date(ts).toISOString();
}
