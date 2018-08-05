// @see https://github.com/pouchdb/pouchdb/issues/6692
import PouchDBDefault from 'pouchdb';
// tslint:disable-next-line:no-var-requires
const PouchDB = PouchDBDefault || require('pouchdb');

import {
  Model,
  DexcomSensorEntry,
  DexcomCalibration,
  MeterEntry,
  ParakeetSensorEntry,
} from 'core/models/model';
import { changeBloodGlucoseUnitToMmoll, DAY_IN_MS } from 'core/calculations/calculations';
import { createCouchDbStorage } from 'core/storage/couchDbStorage';
import { flatten, padStart } from 'lodash';

const sourceDb = new PouchDB('https://admin:***@db-prod.nightbear.fi/legacy');
const targetStorage = createCouchDbStorage(
  'https://admin:***@db-stage.nightbear.fi/migrate_test_6',
);

runAllTasks().then(() => console.log('Finished'), err => console.log(err));

function runAllTasks(): Promise<any> {
  const ops = getAllTasks().map(
    ([type, date], i, tasks) => () =>
      migrateModels(type, date)
        .then(models => targetStorage.saveModels(models))
        .then(models =>
          console.log(
            `${padStart(i + 1 + '', 8)}/${tasks.length} - Migrated "${type}" for "${date}" = ${
              models.length
            } models`,
          ),
        ),
    // To wait a bit between tasks:
    // .then(() => new Promise(resolve => setTimeout(resolve, 50))),
  );
  return ops.reduce((memo, next) => memo.then(next), Promise.resolve().then(
    () => [] as Model[],
  ) as any);
}

function getAllTasks() {
  return flatten(getAllTypes().map(type => getAllDates().map(date => [type, date])));
}

function getAllTypes() {
  return [
    // 'alarms',
    // 'device-status',
    // 'device-status-parakeet',
    // 'hba1c-history',
    'calibrations',
    'sensor-entries',
    'sensor-entries-raw',
    // 'sensors',
    // 'settings',
    // 'test-data',
    // 'treatments',
  ];
}

function timeToDate(ts: number): string {
  return new Date(ts).toISOString().split('T')[0];
}

function getAllDates() {
  const OLDEST = '2015-11-29T00:00:00Z';
  const NEWEST = Date.now(); // or e.g. new Date('2018-01-01T00:00:00Z').getTime();
  const ret: string[] = [];
  let cursor = new Date(OLDEST).getTime();
  while (true) {
    const date = timeToDate(cursor);
    ret.push(date);
    cursor += DAY_IN_MS;
    if (cursor > NEWEST) break;
  }
  return ret;
}

function migrateModels(type: string, date: string) {
  return sourceDb
    .allDocs({
      include_docs: true,
      startkey: `${type}/${date}`,
      endkey: `${type}/${date}_`,
    })
    .then(res => res.rows.map(row => row.doc))
    .then(docs => Promise.all(docs.map(toModernModel)));
}

function toModernModel(x: any): Promise<Model> {
  if (x._id.match(/^sensor-entries/) && x.type === 'sgv' && x.device === 'dexcom') {
    return Promise.resolve({
      modelType: 'DexcomSensorEntry',
      timestamp: x.date,
      bloodGlucose: changeBloodGlucoseUnitToMmoll(x.sgv),
      signalStrength: x.rssi,
      noiseLevel: x.noise,
    } as DexcomSensorEntry);
  } else if (x._id.match(/^sensor-entries-raw/) && x.type === 'raw' && x.device === 'parakeet') {
    return Promise.resolve({
      modelType: 'ParakeetSensorEntry',
      timestamp: x.date,
      bloodGlucose: x.nb_glucose_value,
      rawFiltered: x.filtered,
      rawUnfiltered: x.unfiltered,
    } as ParakeetSensorEntry);
  } else if (x._id.match(/^meter-entries/) && x.type === 'mbg' && x.device === 'dexcom') {
    return Promise.resolve({
      modelType: 'MeterEntry',
      timestamp: x.date,
      bloodGlucose: changeBloodGlucoseUnitToMmoll(x.mbg),
    } as MeterEntry);
  } else if (x._id.match(/^calibrations\b/) && x.type === 'cal' && x.device === 'dexcom') {
    const cal = {
      modelType: 'DexcomCalibration',
      timestamp: x.date,
      meterEntries: [], // will be attached below
      isInitialCalibration: false,
      slope: x.slope,
      intercept: x.intercept,
      scale: x.scale,
    } as DexcomCalibration;
    return Promise.resolve(cal);
    // return Promise.all([
    //   migrateModels('meter-entries', timeToDate(cal.timestamp - DAY_IN_MS)),
    //   migrateModels('meter-entries', timeToDate(cal.timestamp)),
    //   migrateModels('meter-entries', timeToDate(cal.timestamp + DAY_IN_MS)),
    // ]).then(res => {
    //   const pairedMeterEntryCandidates: MeterEntry[] = flatten(res)
    //     .filter(isNotNull)
    //     .filter(
    //       m =>
    //         m.modelType === 'MeterEntry' &&
    //         Math.abs(m.timestamp - cal.timestamp) / MIN_IN_MS <= 2.5,
    //     ) as any;
    //   // if (pairedMeterEntryCandidates.length > 1) {
    //   //   console.log(addHumanReadableTimestamp(cal));
    //   //   console.log(pairedMeterEntryCandidates.map(addHumanReadableTimestamp));
    //   //   throw new Error(
    //   //     `Found ${
    //   //       pairedMeterEntryCandidates.length
    //   //     } MeterEntry candidates for pairing with DexcomCalibration ("${x._id}")`,
    //   //   );
    //   // }
    //   return { ...cal, meterEntries: pairedMeterEntryCandidates };
    // });
  } else {
    throw new Error(`WARN: Not sure what to do with "${x._id}"` + JSON.stringify(x, null, 4));
  }
}
