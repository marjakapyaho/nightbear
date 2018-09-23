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
  Alarm,
  DeviceStatus,
  Hba1c,
  Insulin,
  Carbs,
} from 'core/models/model';
import { changeBloodGlucoseUnitToMmoll } from 'core/calculations/calculations';
import { createCouchDbStorage } from 'core/storage/couchDbStorage';
import { chunk, flatten } from 'lodash';
import * as cliProgress from 'cli-progress';
import { isNotNull } from 'server/utils/types';
import { is } from 'core/models/utils';

const DB_PASSWORD = '***';
const BATCH_SIZE = 500; // @50 ~200000 docs takes ~30 min, @500 ~7 min
const BATCH_RETRY_LIMIT = 10;

const bar = new cliProgress.Bar({});
const remoteDb = new PouchDB(`https://admin:${DB_PASSWORD}@db-prod.nightbear.fi/legacy`);
const sourceDb = new PouchDB(`migrate_temp`);
const targetStorage = createCouchDbStorage(
  `https://admin:${DB_PASSWORD}@db-stage.nightbear.fi/migrate_test_10`,
);
const warnings: Error[] = [];
let nestedIdTotal: number = 0;
let remainingNestedIds: string[] = [];

main();

function main() {
  Promise.resolve()
    .then(() => console.warn('Preparing local copy of DB (this may take a long time)'))
    .then(migrateToLocalDb)
    .then(() => console.warn("Preparing list of ID's to migrate (this may take a long time)"))
    .then(getDocIdsToMigrate)
    .then(recordNestedModelIds)
    .then(batchDocIds)
    .then(runBatchesSerially)
    .then(finalizeDb)
    .catch(err => console.warn('\nMigration failed:', err))
    .then(reportFinished);
}

function migrateToLocalDb() {
  const downReplication = PouchDB.replicate(remoteDb, sourceDb, {
    checkpoint: 'target',
    batch_size: 5000,
    retry: true,
  });
  let total: number = -1;
  downReplication.on('change', info => {
    if (total === -1) {
      total = info.docs_written + (info.pending || 0);
      bar.start(total, 0);
    }
    bar.increment(info.docs.length);
  });
  return new Promise((resolve, reject) => {
    downReplication.on('complete', resolve);
    downReplication.on('error', reject);
    downReplication.on('denied', reject);
  }).then(() => bar.stop());
}

function reportFinished() {
  bar.stop();
  if (warnings.length) console.warn(`${warnings.length} warnings generated`);
  if (remainingNestedIds.length)
    console.warn(`${remainingNestedIds.length}/${nestedIdTotal} nested models got left out`);
  console.log({ warnings, remainingNestedIds });
  console.log('ProTip: Run the script with "> migrate.log" to reduce output');
}

function getDocIdsToMigrate() {
  return sourceDb.allDocs().then(res => res.rows.map(row => row.id));
}

function recordNestedModelIds(ids: string[]): string[] {
  remainingNestedIds = ids.filter(id => !!id.match(/^meter-entries\b/));
  nestedIdTotal = remainingNestedIds.length;
  return ids;
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
  let tries = 0;
  return attempt();
  function run() {
    return sourceDb
      .allDocs({
        include_docs: true,
        keys: ids,
      })
      .then(res => res.rows.map(row => row.doc).filter(isNotNull))
      .then(toModernModels);
  }
  function attempt() {
    return new Promise((resolve, reject) => {
      run().then(resolve, err => {
        if (tries++ >= BATCH_RETRY_LIMIT) {
          console.log(`Error: runBatch() reached retry limit (${BATCH_RETRY_LIMIT})`, err);
          reject(err);
        } else {
          console.log(`Warn: runBatch() failed, retrying (${tries}/${BATCH_RETRY_LIMIT})`, err);
          attempt().then(resolve, reject);
        }
      });
    });
  }
}

function toModernModels(docs: object[]) {
  return Promise.all(
    docs.map(doc => {
      try {
        return toModernModel(doc);
      } catch (err) {
        warnings.push(err);
        return null;
      }
    }),
  ).then(models => targetStorage.saveModels(flatten(models.filter(isNotNull)), true));
}

function toModernModel(x: any, nested = false): Promise<Model[] | null> {
  if (x._id.match(/^_/) || x._id.match(/^sensors\//)) {
    return Promise.resolve(null);
  } else if (x._id.match(/^sensor-entries\//) && x.type === 'sgv' && x.device === 'dexcom') {
    const model: DexcomSensorEntry = {
      modelType: 'DexcomSensorEntry',
      timestamp: x.date,
      bloodGlucose: changeBloodGlucoseUnitToMmoll(x.sgv),
      signalStrength: x.rssi,
      noiseLevel: x.noise,
    };
    return Promise.resolve([model]);
  } else if (x._id.match(/^sensor-entries-raw\//) && x.type === 'raw' && x.device === 'parakeet') {
    const model: ParakeetSensorEntry = {
      modelType: 'ParakeetSensorEntry',
      timestamp: x.date,
      bloodGlucose: x.nb_glucose_value,
      rawFiltered: x.filtered,
      rawUnfiltered: x.unfiltered,
    };
    return Promise.resolve([model]);
  } else if (
    nested &&
    x._id.match(/^meter-entries\//) &&
    x.type === 'mbg' &&
    x.device === 'dexcom'
  ) {
    remainingNestedIds = remainingNestedIds.filter(id => id !== x._id); // remove this from the list of ID's that we expect to nest
    const model: MeterEntry = {
      modelType: 'MeterEntry',
      timestamp: x.date,
      bloodGlucose: changeBloodGlucoseUnitToMmoll(x.mbg),
    };
    return Promise.resolve([model]);
  } else if (x._id.match(/^alarms\//)) {
    const ts = new Date(x._id.replace(/.*\//, '')).getTime();
    const model: Alarm = {
      modelType: 'Alarm',
      creationTimestamp: ts,
      validAfterTimestamp: x.validAfter || ts,
      alarmLevel: x.level,
      situationType: x.type,
      isActive: x.status !== 'inactive',
      pushoverReceipts: x.pushoverReceipts || [],
    };
    return Promise.resolve([model]);
  } else if (x._id.match(/^device-status\//)) {
    const ts = new Date(x._id.replace(/.*\//, '')).getTime();
    const model: DeviceStatus = {
      modelType: 'DeviceStatus',
      deviceName: 'dexcom-uploader',
      timestamp: ts,
      batteryLevel: x.uploaderBattery,
      geolocation: null,
    };
    return Promise.resolve([model]);
  } else if (x._id.match(/^device-status-parakeet\//)) {
    const model1: DeviceStatus = {
      modelType: 'DeviceStatus',
      deviceName: 'parakeet',
      timestamp: x.date + 1, // TODO: This is very hacky
      batteryLevel: parseFloat(x.parakeetBattery),
      geolocation: x.geoLocation,
    };
    const model2: DeviceStatus = {
      modelType: 'DeviceStatus',
      deviceName: 'dexcom-transmitter',
      timestamp: x.date + 2, // TODO: This is very hacky
      batteryLevel: parseFloat(x.transmitterBattery),
      geolocation: null,
    };
    return Promise.resolve([model1, model2]);
  } else if (x._id.match(/^hba1c-history\//)) {
    const model: Hba1c = {
      modelType: 'Hba1c',
      source: 'calculated',
      timestamp: x.calculationTimestamp,
      hba1cValue: x.hba1c,
    };
    return Promise.resolve([model]);
  } else if (x._id.match(/^calibrations\//) && x.type === 'cal' && x.device === 'dexcom') {
    const model: DexcomCalibration = {
      modelType: 'DexcomCalibration',
      timestamp: x.date,
      meterEntries: [], // will be filled in below
      isInitialCalibration: false,
      slope: x.slope,
      intercept: x.intercept,
      scale: x.scale,
    };
    return Promise.resolve()
      .then(() =>
        sourceDb.allDocs({
          startkey: `meter-entries/${timestampToString(model.timestamp - 1000 * 60)}`,
          endkey: `meter-entries/${timestampToString(model.timestamp + 1000 * 60)}`,
          include_docs: true,
        }),
      )
      .then(res => res.rows.map(row => row.doc))
      .then(docs => Promise.all(docs.filter(isNotNull).map(doc => toModernModel(doc, true))))
      .then(models => [
        {
          ...model,
          meterEntries: flatten(models.filter(isNotNull)).filter(is('MeterEntry')),
        },
      ]);
  } else if (x._id.match(/^treatments\//)) {
    const model1: Insulin = {
      modelType: 'Insulin',
      timestamp: x.date,
      insulinType: 'unknown',
      amount: parseFloat(x.insulin),
    };
    const model2: Carbs = {
      modelType: 'Carbs',
      timestamp: x.date,
      amount: parseFloat(x.carbs),
      carbsType: 'normal',
    };
    const model3: MeterEntry = {
      modelType: 'MeterEntry',
      timestamp: x.date,
      bloodGlucose: parseFloat(x.sugar),
    };
    return Promise.resolve(
      [
        isFinite(model1.amount) ? model1 : null,
        isFinite(model2.amount) ? model2 : null,
        isFinite(model3.bloodGlucose) ? model3 : null,
      ].filter(isNotNull),
    );
  } else {
    throw new Error(`WARN: Not sure what to do with "${x._id}": ` + JSON.stringify(x, null, 4));
  }
}

function finalizeDb() {
  return targetStorage.loadLatestTimelineModels('Alarm').catch(() => null); // this will just trigger an index build; the result can be ignored
}

function timestampToString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
