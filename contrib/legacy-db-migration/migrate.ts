import * as cliProgress from 'cli-progress';
import { changeBloodGlucoseUnitToMmoll, MIN_IN_MS } from 'core/calculations/calculations';
import {
  Alarm,
  Carbs,
  DeviceStatus,
  DexcomCalibration,
  DexcomSensorEntry,
  Hba1c,
  Insulin,
  MeterEntry,
  Model,
  ParakeetSensorEntry,
} from 'core/models/model';
import { is } from 'core/models/utils';
import { createCouchDbStorage, getModelRef } from 'core/storage/couchDbStorage';
import PouchDB from 'core/storage/PouchDb';
import { chunk, flatten } from 'lodash';
import { isNotNull } from 'server/utils/types';
import { inspect } from 'util';

const DB_PASSWORD = '***';
const BATCH_SIZE = 500; // @50 ~200000 docs takes ~30 min, @500 ~7 min
const BATCH_RETRY_LIMIT = 10;
const INCREMENTAL = false;
const DOC_ID_FILTER = /./; // e.g. /2018-01-0[1-7]/

const bar = new cliProgress.Bar({});
const remoteDb = new PouchDB(`https://admin:${DB_PASSWORD}@db-prod.nightbear.fi/legacy`);
const sourceDb = new PouchDB(`migrate_temp`);
const targetStorage = createCouchDbStorage(`https://admin:${DB_PASSWORD}@db-stage.nightbear.fi/migrate_test_18`);

const warnings: Error[] = [];
let incrementalIdsToMigrate: string[] = [];
const maybeLinkedMeterEntries: MeterEntry[] = [];
const maybeLinkedDexcomCalibrations: DexcomCalibration[] = [];

main();

function main() {
  Promise.resolve()
    .then(() => console.warn('Preparing local copy of DB (this may take a long time)'))
    .then(migrateToLocalDb)
    .then(() => console.warn("Preparing list of ID's to migrate (this may take a long time)"))
    .then(getDocIdsToMigrate)
    .then(outputModelTypes)
    .then(batchDocIds)
    .then(runBatchesSerially)
    .then(linkCalibrationsAndMeterEntries)
    .then(batchLinkedCalibrations)
    .then(runBatchedCalibrationUpdatesSerially)
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
    if (INCREMENTAL) {
      incrementalIdsToMigrate = incrementalIdsToMigrate.concat(info.docs.map(doc => doc._id));
    }
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
  if (warnings.length) console.warn(`${warnings.length} warnings generated`);
  console.log('Warnings:\n' + inspect(warnings, { maxArrayLength: Infinity }));
  console.warn('Finished!');
  console.log('ProTip: Run the script with "> migrate.log" to reduce output');
}

function getDocIdsToMigrate() {
  if (INCREMENTAL) {
    console.log('Migrating in incremental mode:', incrementalIdsToMigrate);
    return incrementalIdsToMigrate;
  } else {
    return sourceDb.allDocs().then(res => res.rows.map(row => row.id).filter(id => !!id.match(DOC_ID_FILTER)));
  }
}

function outputModelTypes(ids: string[]): string[] {
  const x: string[] = [];
  ids.forEach(id => {
    const [a] = id.split('/');
    if (!x.includes(a)) x.push(a);
  });
  console.log('Found distinct model types:', x);
  return ids;
}

function batchDocIds(ids: string[]): string[][] {
  return chunk(ids, BATCH_SIZE);
}

function runBatchesSerially(ids: string[][]) {
  const total = ids.reduce((memo, next) => memo + next.length, 0);
  bar.start(total, 0);
  return ids
    .reduce((memo, next) => memo.then(() => runBatch(next)).then(() => bar.increment(next.length)), Promise.resolve())
    .then(() => bar.update(total))
    .then(() => bar.stop());
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
          console.log(
            `Warn: runBatch() failed, retrying (${tries}/${BATCH_RETRY_LIMIT}) in ${BATCH_RETRY_WAIT_SEC} seconds`,
            err,
          );
          setTimeout(() => attempt().then(resolve, reject), BATCH_RETRY_WAIT_SEC * 1000);
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
        warnings.push(err.message);
        return null;
      }
    }),
  )
    .then(models => targetStorage.saveModels(flatten(models.filter(isNotNull)), true))
    .then(models => {
      maybeLinkedMeterEntries.push(...models.filter(is('MeterEntry')));
      maybeLinkedDexcomCalibrations.push(...models.filter(is('DexcomCalibration')));
      return models;
    });
}

function toModernModel(x: any): Promise<Model[] | null> {
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
  } else if (x._id.match(/^meter-entries\//) && x.type === 'mbg' && x.device === 'dexcom') {
    const model: MeterEntry = {
      modelType: 'MeterEntry',
      timestamp: x.date,
      source: 'dexcom',
      bloodGlucose: changeBloodGlucoseUnitToMmoll(x.mbg),
    };
    return Promise.resolve([model]);
  } else if (x._id.match(/^alarms\//)) {
    const ts = new Date(x._id.replace(/.*\//, '')).getTime();
    const model: Alarm = {
      modelType: 'Alarm',
      timestamp: ts,
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
      timestamp: x.date,
      batteryLevel: parseFloat(x.parakeetBattery),
      geolocation: x.geoLocation,
    };
    const model2: DeviceStatus = {
      modelType: 'DeviceStatus',
      deviceName: 'dexcom-transmitter',
      timestamp: x.date,
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
      meterEntries: [], // will be filled in later
      isInitialCalibration: false,
      slope: x.slope,
      intercept: x.intercept,
      scale: x.scale,
    };
    return Promise.resolve([model]);
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
      source: 'ui',
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

function linkCalibrationsAndMeterEntries() {
  console.warn(
    `Attempting to link ${maybeLinkedMeterEntries.length} MeterEntry's with ${
      maybeLinkedDexcomCalibrations.length
    } DexcomCalibration's`,
  );
  console.log({ maybeLinkedMeterEntries, maybeLinkedDexcomCalibrations });
  const updates = maybeLinkedDexcomCalibrations.map(cal => {
    const entries = maybeLinkedMeterEntries.filter(entry => Math.abs(cal.timestamp - entry.timestamp) <= MIN_IN_MS * 3);
    const deltas = entries.map(e => ((e.timestamp - cal.timestamp) / 1000).toFixed(1) + ' sec').join(', ');
    console.log(
      `"${(cal as any).modelMeta._id}" got ${
        entries.length
      } linked MeterEntry's which are [ ${deltas} ] ahead of the parent ${cal.modelType}`,
    );
    return {
      ...cal,
      meterEntries: entries.map(getModelRef),
    };
  });
  const actualUpdates = updates.filter(cal => !!cal.meterEntries.length);
  console.warn(`Found MeterEntry's for ${actualUpdates.length} of ${updates.length} DexcomCalibration's`);
  return actualUpdates;
}

function batchLinkedCalibrations(cals: DexcomCalibration[]): DexcomCalibration[][] {
  return chunk(cals, BATCH_SIZE);
}

function runBatchedCalibrationUpdatesSerially(cals: DexcomCalibration[][]) {
  const total = cals.reduce((memo, next) => memo + next.length, 0);
  bar.start(total, 0);
  return cals
    .reduce(
      (memo, next) => memo.then(() => runCalibrationBatch(next)).then(() => bar.increment(next.length)),
      Promise.resolve(),
    )
    .then(() => bar.update(total))
    .then(() => bar.stop());
}

function runCalibrationBatch(cals: DexcomCalibration[]): Promise<any> {
  let tries = 0;
  return attempt();
  function run() {
    return targetStorage.saveModels(cals);
  }
  function attempt() {
    return new Promise((resolve, reject) => {
      run().then(resolve, err => {
        if (tries++ >= BATCH_RETRY_LIMIT) {
          console.log(`Error: runCalibrationBatch() reached retry limit (${BATCH_RETRY_LIMIT})`, err);
          reject(err);
        } else {
          console.log(
            `Warn: runCalibrationBatch() failed, retrying (${tries}/${BATCH_RETRY_LIMIT}) in ${BATCH_RETRY_WAIT_SEC} seconds`,
            err,
          );
          setTimeout(() => attempt().then(resolve, reject), BATCH_RETRY_WAIT_SEC * 1000);
        }
      });
    });
  }
}
