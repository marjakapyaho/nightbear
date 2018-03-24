// These calculations have been adapted from https://github.com/jamorham/xDrip-plus
import {
  AnalyserEntry,
  MeterEntry,
  NightbearCalibration,
  ParakeetSensorEntry,
  Sensor,
} from '../../models/model';
import { chain } from 'lodash';
import { MIN_IN_MS, changeBloodGlucoseUnitToMgdl } from '../calculations/calculations';
import { parseAnalyserEntries } from '../analyser/analyser-utils';
import { getStorageKey } from '../../storage/couchDbStorage';

/*const DEX_PARAMETERS = {
  LOW_SLOPE_1: 0.95,
  LOW_SLOPE_2: 0.85,
  HIGH_SLOPE_1: 1.3,
  HIGH_SLOPE_2: 1.4,
  DEFAULT_LOW_SLOPE_LOW: 1.08,
  DEFAULT_LOW_SLOPE_HIGH: 1.15,
  DEFAULT_SLOPE: 1,
  DEFAULT_HIGH_SLOPE_HIGH: 1.3,
  DEFAULT_HIGH_SLOPE_LOW: 1.2
};*/

/*let calibration = {
  timestamp: '',
  sensor_age_at_calibration: '',
  sensor: '',
  bg: '',
  raw_value: '',
  adjusted_raw_value: '',
  sensor_confidence: '',
  slope_confidence: '',
  raw_timestamp: '',
  slope: '',
  intercept: '',
  distance_from_estimate: '', // REMOVED
  estimate_raw_at_calibration: '',
  estimate_bg_at_time_of_calibration: '',
  uuid: '', // REMOVED
  sensor_uuid: '', // REMOVED
  possible_bad: '', // REMOVED
  check_in: '', // REMOVED
  first_decay: '', // REMOVED
  second_decay: '', // REMOVED
  first_slope: '', // REMOVED
  second_slope: '', // REMOVED
  first_intercept: '', // REMOVED
  second_intercept: '', // REMOVED
  first_scale: '', // REMOVED
  second_scale: '' // REMOVED
};*/

// LatestEntries 30 min latestCalibrations 4 days
export function generateCalibration(
  currentTimestamp: number,
  meterEntry: MeterEntry,
  sensor: Sensor,
  parakeetSensorEntries: ParakeetSensorEntry[],
  latestCalibrations: NightbearCalibration[],
) {

  // Should be inside 15 minutes
  const entries: AnalyserEntry[] = parseAnalyserEntries(parakeetSensorEntries);
  const matchingParakeetAnalyserEntry = chain(entries)
    .filter(entry => entry.timestamp > (currentTimestamp - 15 * MIN_IN_MS))
    .sortBy('timestamp')
    .last()
    .value();

  const matchingParakeetSensorEntry = chain(parakeetSensorEntries)
    .filter(entry => entry.timestamp > (currentTimestamp - 15 * MIN_IN_MS))
    .sortBy('timestamp')
    .last()
    .value();

  if (!matchingParakeetAnalyserEntry || ! matchingParakeetSensorEntry) {
    console.log('ERROR: Could not calibrate because of missing parakeet data');
    return;
  }

  // The calibration module uses blood glucose in mg/dl
  const meterBg = changeBloodGlucoseUnitToMgdl(meterEntry.bloodGlucose);

  if (meterBg < 40 || meterBg > 400) {
    console.log('ERROR: Could not calibrate because meter bg is out of range (2.22 - 22.22)');
    return;
  }

  return nextCalibration(
    currentTimestamp,
    meterBg,
    sensor,
    matchingParakeetAnalyserEntry,
    matchingParakeetSensorEntry,
    parakeetSensorEntries,
    latestCalibrations,
  );
}

export function nextCalibration(
  currentTimestamp: number,
  meterBg: number,
  sensor: Sensor,
  matchingParakeetEntry: AnalyserEntry,
  matchingParakeetSensorEntry: ParakeetSensorEntry,
  sensorEntries: ParakeetSensorEntry[],
  latestCalibrations: NightbearCalibration[],
) {

  let estimateRawAtCalibration;
  const params = findNewRawParameters(sensorEntries);
  const estimatedRawBg = params.ra * currentTimestamp * currentTimestamp + (params.rb * currentTimestamp) + params.rc;
  if (Math.abs(estimatedRawBg - (matchingParakeetSensorEntry.rawUnfiltered / 1000)) > 20) { // TODO: should be age_adjusted_raw_value
    estimateRawAtCalibration = matchingParakeetSensorEntry.rawUnfiltered / 1000; // TODO: should be age_adjusted_raw_value
  } else {
    estimateRawAtCalibration = estimatedRawBg;
  }

  const newCal = createCalibration(
    meterBg,
    sensor,
    matchingParakeetEntry, // TODO: merge these
    matchingParakeetSensorEntry, // TODO
    estimateRawAtCalibration,
    currentTimestamp,
  );

  latestCalibrations.push(newCal);

  return calculate_w_l_s(latestCalibrations);
}

// Parakeet entry should have nb_slope
function createCalibration(
  meterBg: number,
  sensor: Sensor,
  parakeetEntry: AnalyserEntry,
  parakeetSensorEntry: ParakeetSensorEntry,
  estimateRawAtCalibration: number,
  currentTime: number,
): NightbearCalibration {
  console.log(estimateRawAtCalibration);
  return {
    // TODO
/*    raw_value: parakeetEntry.unfiltered / 1000,
    raw_timestamp: parakeetEntry.date,
    adjusted_raw_value: parakeetEntry.age_adjusted_raw_value / 1000,
    estimate_raw_at_calibration: estimateRawAtCalibration,
    sensor_age_at_calibration: currentTime - sensor.start,*/
    modelType: 'NightbearCalibration',
    timestamp: currentTime,
    meterEntries: [{
      modelType: 'MeterEntry',
      timestamp: currentTime,
      bloodGlucose: meterBg,
      measuredAt: currentTime,
    }],
    isInitialCalibration: false,
    slope: 1,
    intercept: meterBg,
    scale: 1,
    sensorId: getStorageKey(sensor),
    rawValueId: getStorageKey(parakeetSensorEntry),
    slopeConfidence: Math.min(Math.max(((4 - Math.abs((parakeetEntry.slope || 0) * 60000)) / 4), 0), 1), // TODO || 0
    sensorConfidence: Math.max(((-0.0018 * meterBg * meterBg) + (0.6657 * meterBg) + 36.7505) / 100, 0),
  };
}

function findNewRawParameters(sensorEntries: ParakeetSensorEntry[]) {
  console.log('TODO: calculate from', sensorEntries);
  // TODO
  return {
    ra: 1,
    rb: 1,
    rc: 1,
  };
}

function calculate_w_l_s(
  calibrations: NightbearCalibration[],
) {
  // TODO
  return calibrations[0];
}
