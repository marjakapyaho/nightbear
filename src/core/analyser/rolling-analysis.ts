import { runAnalysis } from 'core/analyser/analyser';
import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import { DEFAULT_STATE, Model, Situation, State, TimelineModel } from 'core/models/model';
import { is } from 'core/models/utils';
import { first, flatten, groupBy, last, range, values } from 'lodash';
import { isNotNull } from 'server/utils/types';
import { objectKeys } from 'web/utils/types';

const BUCKET_SIZE = 5 * MIN_IN_MS;

export type RollingAnalysisResults = Array<
  Array<
    [
      Situation,
      number, // start timestamp of the situation
      number, // length of the situation
    ]
  >
>;

export function performRollingAnalysis(models: Model[], timelineRange: number, timelineRangeEnd: number) {
  const buckets = getRollingAnalysisBuckets(timelineRange, timelineRangeEnd);
  const results = getRollingAnalysisResults(models, buckets);
  const lanes = toSituationLanes(results);
  return lanes;
}

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

// Runs analysis for each of the given buckets (i.e. 5 minute slices of time)
function getRollingAnalysisResults(models: Model[], buckets: RollingAnalysisBucket[]): RollingAnalysisRawResult[] {
  const activeProfile = last(models.filter(is('ActiveProfile')));
  if (!activeProfile) throw new Error('Could not find an ActiveProfile to perform rolling analysis');
  const sensorEntries = models.filter(is('DexcomSensorEntry', 'DexcomRawSensorEntry', 'ParakeetSensorEntry'));
  const insulins = models.filter(is('Insulin'));
  const activeAlarms = models.filter(is('Alarm')).filter(a => a.isActive);
  return buckets.map(([base, from, to]) => {
    const relevantToThisBucket = (m: TimelineModel) => m.timestamp > base && m.timestamp < to;
    return [
      from,
      runAnalysis(
        to,
        activeProfile,
        sensorEntries.filter(relevantToThisBucket),
        insulins.filter(relevantToThisBucket),
        undefined, // TODO: Which DeviceStatus should go here..?
        activeAlarms.filter(relevantToThisBucket),
      ),
    ];
  });
}

type RollingAnalysisRawResult = [
  number, // Start timestamp of the 5 minute bucket in question
  State, // State object describing the results of the analysis for that point in time
];

// Chops the given amount of time into "buckets"; for each, the analyser can be ran independently
function getRollingAnalysisBuckets(timelineRange: number, timelineRangeEnd: number): RollingAnalysisBucket[] {
  const preMargin = 3 * HOUR_IN_MS;
  return range(timelineRangeEnd - timelineRange + BUCKET_SIZE, timelineRangeEnd, BUCKET_SIZE).map(startTs => [
    startTs - preMargin,
    startTs - BUCKET_SIZE,
    startTs,
  ]);
}

type RollingAnalysisBucket = [
  number, // "base" - timestamp starting from which Models will be considered during analysis
  number, // "from" - timestamp of the start of the bucket
  number, // "to" - timestamp of the end of the bucket
];
