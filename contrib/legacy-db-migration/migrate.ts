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
import { changeBloodGlucoseUnitToMmoll } from 'core/calculations/calculations';
import { createCouchDbStorage, StorageError, isStorageError } from 'core/storage/couchDbStorage';
import { chunk } from 'lodash';
import * as cliProgress from 'cli-progress';
import { isNotNull } from 'server/utils/types';

const DB_PASSWORD = '***';
const BATCH_SIZE = 500; // @50 ~200000 docs takes ~30 min, @500 ~7 min

const bar = new cliProgress.Bar({});
const sourceDb = new PouchDB(`https://admin:${DB_PASSWORD}@db-prod.nightbear.fi/legacy`);
const targetStorage = createCouchDbStorage(
  `https://admin:${DB_PASSWORD}@db-stage.nightbear.fi/migrate_test_7`,
);
const warnings: Error[] = [];
const skipped: string[] = [];

main();

function main() {
  Promise.resolve()
    .then(() => console.warn("Preparing list of ID's to migrate (this may take a long time)"))
    .then(getDocIdsToMigrate)
    .then(batchDocIds)
    .then(runBatchesSerially)
    .catch(err => console.warn('\nMigration failed:', err))
    .then(() => bar.stop())
    .then(() => skipped.length && console.warn(`${skipped.length} items skipped`))
    .then(() => warnings.length && console.warn(`${warnings.length} warnings generated`))
    .then(() => console.log({ warnings, skipped }))
    .then(() => console.log('ProTip: Run the script with "> migrate.log" to reduce output'));
}

function getDocIdsToMigrate() {
  return sourceDb
    .allDocs({ startkey: 'sensor-entries/', endkey: 'sensor-entries/_' })
    .then(res => res.rows.map(row => row.id));
}

function batchDocIds(ids: string[]): string[][] {
  return chunk(ids, BATCH_SIZE);
}

function runBatchesSerially(ids: string[][]) {
  const total = ids.reduce((memo, next) => memo + next.length, 0);
  bar.start(total, 0);
  return ids
    .reduce(
      (memo, next) => memo.then(() => runBatch(next)).then(() => bar.increment(next.length)),
      Promise.resolve(),
    )
    .then(() => bar.update(total));
}

function runBatch(ids: string[]): Promise<any> {
  return sourceDb
    .allDocs({
      include_docs: true,
      keys: ids,
    })
    .then(res => res.rows.map(row => row.doc).filter(isNotNull))
    .then(toModernModels);
}

function toModernModels(docs: object[]) {
  return Promise.all(
    docs
      .map(doc => {
        try {
          return toModernModel(doc);
        } catch (err) {
          warnings.push(err);
          return null;
        }
      })
      .filter(isNotNull),
  )
    .then(models => targetStorage.saveModels(models))
    .catch((err: Error | StorageError) => {
      if (isStorageError(err)) {
        skipped.push(...err.saveFailedForModels);
      } else {
        throw err;
      }
    });
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
  } else {
    throw new Error(`WARN: Not sure what to do with "${x._id}": ` + JSON.stringify(x, null, 4));
  }
}
