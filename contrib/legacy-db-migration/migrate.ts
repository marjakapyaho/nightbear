import * as cliProgress from 'cli-progress';
import { changeBloodGlucoseUnitToMmoll, isDexcomEntryValid, MIN_IN_MS } from 'core/calculations/calculations';
import {
  Alarm,
  Carbs,
  DeviceStatus,
  DexcomCalibration,
  DexcomRawSensorEntry,
  DexcomSensorEntry,
  Hba1c,
  Insulin,
  MeterEntry,
  Model,
  ParakeetSensorEntry,
  SavedProfile,
} from 'core/models/model';
import { first, is } from 'core/models/utils';
import { createCouchDbStorage, getModelRef } from 'core/storage/couchDbStorage';
import PouchDB from 'core/storage/PouchDb';
import { chunk, flatten } from 'lodash';
import { CAL_PAIRING } from 'server/api/uploadDexcomEntry/uploadDexcomEntry';
import { isNotNull } from 'server/utils/types';
import { inspect } from 'util';

const BATCH_SIZE = 500; // @50 ~200000 docs takes ~30 min, @500 ~7 min
const BATCH_RETRY_LIMIT = 10;
const BATCH_RETRY_WAIT_SEC = 10;
const INCREMENTAL = true;
const DOC_ID_FILTER = /./; // e.g. /2018-01-0[1-7]/

const bar = new cliProgress.Bar({});
const remoteDb = new PouchDB(process.env.NIGHTBEAR_MIGRATE_REMOTE_DB_URL || 'https://example.com/remote_db');
const sourceDb = new PouchDB(`migrate_temp`);
const targetStorage = createCouchDbStorage(
  process.env.NIGHTBEAR_MIGRATE_TARGET_DB_URL || 'https://example.com/target_db',
);

const warnings: Error[] = [];
let incrementalIdsToMigrate: string[] = [];
const maybeLinkedMeterEntries: MeterEntry[] = [];
const maybeLinkedDexcomCalibrations: DexcomCalibration[] = [];
const incrementalSkipped: string[] = [];
const incrementalMigrated: string[] = [];

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
    .then(seedProfiles)
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
  if (INCREMENTAL) console.log({ incrementalSkipped, incrementalMigrated });
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
    .then(maybeModels => {
      const models = flatten(maybeModels.filter(isNotNull));
      if (INCREMENTAL) {
        // In incremental mode: look for already-existing models with the same type and (roughly) the same timestamp
        return Promise.all(
          models.map(model => {
            if ('timestamp' in model) {
              return targetStorage.loadTimelineModels(model.modelType, MIN_IN_MS * 2, model.timestamp + MIN_IN_MS);
            } else {
              throw new Error(`Incremental migration mode not supported for: ${JSON.stringify(model)}`);
            }
          }),
        )
          .then(loadedModels => {
            return models.filter((model, i) => {
              const alreadyExistingModel = loadedModels[i].find(first);
              (!!alreadyExistingModel ? incrementalSkipped : incrementalMigrated).push(
                `${model.modelType}@${(model as any).timestamp}`,
              );
              return !alreadyExistingModel;
            });
          })
          .then(targetStorage.saveModels);
      } else {
        // This is easy: just save everything as new
        return targetStorage.saveModels(models, true);
      }
    })
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
    const raw: DexcomRawSensorEntry = {
      modelType: 'DexcomRawSensorEntry',
      timestamp: x.date,
      bloodGlucose: x.nb_raw_value,
      signalStrength: x.rssi,
      noiseLevel: x.noise,
      rawFiltered: x.filtered,
      rawUnfiltered: x.unfiltered,
    };
    if (!isDexcomEntryValid(x.noise, x.sgv)) {
      // According to rules in the old backend, this is considered "raw" -> don't create a "proper" DexcomSensorEntry
      return Promise.resolve([raw]);
    } else {
      const proper: DexcomSensorEntry = {
        modelType: 'DexcomSensorEntry',
        timestamp: x.date,
        bloodGlucose: x.nb_glucose_value,
        signalStrength: x.rssi,
        noiseLevel: x.noise,
      };
      return Promise.resolve([raw, proper]);
    }
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
      situationType: x.type,
      isActive: x.status !== 'inactive',
      deactivationTimestamp: null,
      alarmStates: [
        {
          alarmLevel: x.level,
          validAfterTimestamp: x.validAfter || ts,
          ackedBy: null,
          pushoverReceipts: x.pushoverReceipts || [],
        },
      ],
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
      meterEntries: [], // will be filled in later in this script
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
    const entries = maybeLinkedMeterEntries.filter(
      entry =>
        cal.timestamp - entry.timestamp < CAL_PAIRING.BEFORE && entry.timestamp - cal.timestamp < CAL_PAIRING.AFTER,
    );
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

function seedProfiles() {
  const day: SavedProfile = {
    modelType: 'SavedProfile',
    profileName: 'day',
    activatedAtUtc: {
      hours: 11,
      minutes: 0,
    },
    alarmsEnabled: true,
    analyserSettings: {
      HIGH_LEVEL_REL: 6.5,
      TIME_SINCE_BG_LIMIT: 20,
      BATTERY_LIMIT: 30,
      LOW_LEVEL_ABS: 4.7,
      ALARM_EXPIRE: 10800,
      LOW_LEVEL_REL: 9,
      HIGH_LEVEL_ABS: 8,
      ALARM_RETRY: 30,
    },
    alarmSettings: {
      OUTDATED: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 120,
      },
      HIGH: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 90,
      },
      PERSISTENT_HIGH: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 90,
      },
      LOW: {
        escalationAfterMinutes: [10, 10, 10],
        snoozeMinutes: 20,
      },
      FALLING: {
        escalationAfterMinutes: [10, 10, 10],
        snoozeMinutes: 15,
      },
      RISING: {
        escalationAfterMinutes: [10, 15, 15],
        snoozeMinutes: 20,
      },
      BATTERY: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 60,
      },
      COMPRESSION_LOW: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 60,
      },
    },
    pushoverLevels: (process.env.NIGHTBEAR_MIGRATE_PUSHOVER_LEVELS_DAY || '').split(' '),
  };
  const night: SavedProfile = {
    modelType: 'SavedProfile',
    profileName: 'night',
    activatedAtUtc: {
      hours: 0,
      minutes: 0,
    },
    alarmsEnabled: true,
    analyserSettings: {
      HIGH_LEVEL_REL: 7,
      TIME_SINCE_BG_LIMIT: 20,
      BATTERY_LIMIT: 10,
      LOW_LEVEL_ABS: 4.3,
      ALARM_EXPIRE: 10800,
      LOW_LEVEL_REL: 6,
      HIGH_LEVEL_ABS: 7.5,
      ALARM_RETRY: 30,
    },
    alarmSettings: {
      OUTDATED: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 120,
      },
      HIGH: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 60,
      },
      PERSISTENT_HIGH: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 60,
      },
      LOW: {
        escalationAfterMinutes: [8, 10, 10],
        snoozeMinutes: 10,
      },
      FALLING: {
        escalationAfterMinutes: [10, 10, 10],
        snoozeMinutes: 20,
      },
      RISING: {
        escalationAfterMinutes: [20, 15, 15],
        snoozeMinutes: 20,
      },
      BATTERY: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 90,
      },
      COMPRESSION_LOW: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 90,
      },
    },
    pushoverLevels: (process.env.NIGHTBEAR_MIGRATE_PUSHOVER_LEVELS_NIGHT || '').split(' '),
  };
  return targetStorage.saveModels([day, night], true);
}
