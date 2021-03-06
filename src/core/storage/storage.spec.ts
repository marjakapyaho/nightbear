import { assert } from 'chai';
import { Alarm, Carbs, DexcomCalibration, MeterEntry, Model, SavedProfile } from 'core/models/model';
import { is } from 'core/models/utils';
import {
  getModelRef,
  getStorageKey,
  REV_CONFLICT_SAVE_ERROR,
  timestampToString,
  REV_CONFLICT_DELETE_ERROR,
} from 'core/storage/couchDbStorage';
import { Storage, StorageError } from 'core/storage/storage';
import { first, last } from 'lodash';
import 'mocha';
import { assertEqualWithoutMeta, savedProfile } from 'server/utils/test';
import { generateUuid } from 'core/utils/id';

export const MODEL_1: Carbs = {
  modelType: 'Carbs',
  modelUuid: generateUuid(),
  timestamp: 1508092667717, // i.e. Sun Oct 15 2017 21:37:47 GMT+0300 (EEST)
  amount: 10,
  carbsType: 'normal',
};

export const MODEL_2: SavedProfile = savedProfile('day');

export function storageTestSuite(createTestStorage: () => Storage) {
  let storage: Storage;
  let timestamp: number;
  let model: Carbs;

  function findModel(models: Model[]): Model {
    const found = models.find(m => m.modelType === model.modelType && m.timestamp === model.timestamp);
    if (found) return found;
    throw new Error(`Couldn't find the Model this test case is operating on`);
  }

  beforeEach(() => {
    storage = createTestStorage();
    timestamp = Date.now(); // we need to have unique timestamps, so each Model is unique
    model = { ...MODEL_1, timestamp };
  });

  it('saves models individually', () => {
    return storage.saveModel(model).then(actual => assertEqualWithoutMeta(actual, model));
  });

  it('reports save errors individually', () => {
    return storage
      .saveModel(MODEL_2)
      .then(() => storage.saveModel(MODEL_2)) // make sure we conflict
      .then(
        () => {
          throw new Error('Expecting a failure');
        },
        err => {
          assert.match(err.message, /Couldn't save model.*global.*Profile.*update conflict/);
          // Check that success is reported:
          assert.equal(err.saveSucceededForModels.length, 0);
          // Check that failure is reported:
          assert.equal(err.saveFailedForModels.length, 1);
          const [failedModel, reason] = first(err.saveFailedForModels) || [];
          if (is('SavedProfile')(failedModel)) {
            assert.equal(failedModel.profileName, MODEL_2.profileName);
          } else {
            assert.fail('Did not get the expected Model back');
          }
          assert.equal(reason, REV_CONFLICT_SAVE_ERROR);
        },
      );
  });

  it('saves models in bulk', () => {
    const models = [model];
    return storage.saveModels(models).then(actuals => {
      assert.equal(actuals.length, 1);
      actuals.forEach((actual, i) => assertEqualWithoutMeta(actual, models[i]));
    });
  });

  it('reports save errors in bulk', () => {
    const models = [
      model,
      { ...model, modelMeta: { _id: getStorageKey(model) } }, // make sure we conflict, as we have the exact same _id
    ];
    return storage.saveModels(models).then(
      () => {
        throw new Error('Expecting a failure');
      },
      (err: StorageError) => {
        assert.match(
          err.message,
          /Couldn't save some models:\n.*"timeline\/.* => OK\n.*"timeline\/.* => .*update conflict/,
        );
        // Check that success is reported:
        assert.equal(err?.saveSucceededForModels?.length, 1);
        const succeededModel = first(err.saveSucceededForModels);
        if (is('Carbs')(succeededModel)) {
          assert.equal(succeededModel.timestamp, model.timestamp);
        } else {
          assert.fail('Did not get the expected Model back');
        }
        // Check that failure is reported:
        assert.equal(err?.saveFailedForModels?.length, 1);
        const [failedModel, reason] = first(err.saveFailedForModels) || [];
        if (is('Carbs')(failedModel)) {
          assert.equal(failedModel.timestamp, model.timestamp);
        } else {
          assert.fail('Did not get the expected Model back');
        }
        assert.equal(reason, REV_CONFLICT_SAVE_ERROR);
      },
    );
  });

  it('deletes models in bulk', () => {
    return storage
      .saveModels([model])
      .then(models => storage.deleteModels(models))
      .then(() => storage.loadTimelineModels(['Carbs'], 1000 * 60, timestamp))
      .then(loadedModels => assert.deepEqual(loadedModels, []));
  });

  it('reports deletion errors in bulk', () => {
    return storage
      .saveModels([model])
      .then(models => storage.deleteModels(models.concat(model)))
      .then(
        () => {
          throw new Error('Expecting a failure');
        },
        (err: StorageError) => {
          assert.match(
            err.message,
            /Couldn't delete some models:\n.*"timeline\/.* => OK\n.*"timeline\/.* => .*update conflict/,
          );
          // Check that success is reported:
          assert.equal(err?.deleteSucceededForModels?.length, 1);
          const succeededModel = first(err.deleteSucceededForModels);
          if (is('Carbs')(succeededModel)) {
            assert.equal(succeededModel.timestamp, model.timestamp);
          } else {
            assert.fail('Did not get the expected Model back');
          }
          // Check that failure is reported:
          assert.equal(err?.deleteFailedForModels?.length, 1);
          const [failedModel, reason] = first(err.deleteFailedForModels) || [];
          if (is('Carbs')(failedModel)) {
            assert.equal(failedModel.timestamp, model.timestamp);
          } else {
            assert.fail('Did not get the expected Model back');
          }
          assert.equal(reason, REV_CONFLICT_DELETE_ERROR);
        },
      );
  });

  it('loads timeline models', () => {
    return storage
      .saveModel(model)
      .then(() => storage.loadTimelineModels(['Carbs'], 1000 * 60, timestamp))
      .then(loadedModels => assertEqualWithoutMeta(findModel(loadedModels), model));
  });

  it('loads global models', () => {
    return storage
      .saveModel(MODEL_2)
      .catch(() => null) // if the Model already existed, this will fail, but for the purposes of this test, it doesn't matter
      .then(() => storage.loadGlobalModels())
      .then(loadedModels =>
        assertEqualWithoutMeta(
          loadedModels.find(model => model.modelType === MODEL_2.modelType) as any, // cheating is allowed in test code
          MODEL_2,
        ),
      );
  });

  it('saves models that have been saved before', () => {
    assert.equal(model.amount, 10); // check baseline assumptions
    return storage
      .saveModel(model)
      .then(savedModel => ({ ...savedModel, amount: 123 }))
      .then(storage.saveModel)
      .then(savedModel => assertEqualWithoutMeta(savedModel, { ...model, amount: 123 }));
  });

  it('saves models that have been loaded before', () => {
    assert.equal(model.amount, 10); // check baseline assumptions
    return storage
      .saveModel(model)
      .then(() => storage.loadTimelineModels(['Carbs'], 1000 * 60, timestamp))
      .then(loadedModels => findModel(loadedModels))
      .then(loadedModel => ({ ...loadedModel, amount: 123 }))
      .then(storage.saveModel)
      .then(savedModel => assertEqualWithoutMeta(savedModel, { ...model, amount: 123 }));
  });

  it('loads latest timeline models by type', () => {
    return Promise.resolve()
      .then(() => [
        { ...model, timestamp: timestamp - 2, amount: 1 },
        { ...model, timestamp: timestamp - 1, amount: 2 },
        { ...model, timestamp: timestamp - 0, amount: 3 },
      ])
      .then(storage.saveModels)
      .then(() => storage.loadLatestTimelineModels('Carbs', 1))
      .then(models => {
        assert.equal(models.length, 1);
        assertEqualWithoutMeta(first(models), { ...model, timestamp: timestamp - 0, amount: 3 });
      });
  });

  it('loads single latest timeline model by type', () => {
    return Promise.resolve()
      .then(() => [
        { ...model, timestamp: timestamp - 2, amount: 1 },
        { ...model, timestamp: timestamp - 1, amount: 2 },
        { ...model, timestamp: timestamp - 0, amount: 3 },
      ])
      .then(storage.saveModels)
      .then(() => storage.loadLatestTimelineModel('Carbs'))
      .then(maybeModel => {
        assertEqualWithoutMeta(maybeModel, { ...model, timestamp: timestamp - 0, amount: 3 });
      });
  });

  it('gives undefined when single latest timeline model by type is not found', () => {
    return Promise.resolve()
      .then(() => [
        { ...model, timestamp: timestamp - 2, amount: 1 },
        { ...model, timestamp: timestamp - 1, amount: 2 },
        { ...model, timestamp: timestamp - 0, amount: 3 },
      ])
      .then(storage.saveModels)
      .then(() => storage.loadLatestTimelineModel('Alarm'))
      .then(maybeModel => {
        assertEqualWithoutMeta(maybeModel, undefined);
      });
  });

  describe('loading active alarms', () => {
    const alarm: Alarm = {
      modelType: 'Alarm',
      modelUuid: generateUuid(),
      timestamp: 0,
      situationType: 'HIGH',
      isActive: false,
      deactivationTimestamp: null,
      alarmStates: [
        {
          alarmLevel: 0,
          validAfterTimestamp: 0,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    };

    it("doesn't load anything if there's nothing to load", () => {
      return Promise.resolve()
        .then(() => storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }))
        .then(models => {
          assert.equal(models.length, 0);
        });
    });

    it('ignores inactive alarms', () => {
      return Promise.resolve()
        .then(() => [{ ...alarm, timestamp }])
        .then(storage.saveModels)
        .then(() => storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }))
        .then(models => {
          assert.equal(models.length, 0);
        });
    });

    it('loads an active alarm', () => {
      const a1 = { ...alarm, timestamp, isActive: true };
      return Promise.resolve()
        .then(() => [a1])
        .then(storage.saveModels)
        .then(() => storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }))
        .then(models => {
          assert.equal(models.length, 1);
          assertEqualWithoutMeta(first(models), a1);
        });
    });

    it('loads correct alarms, in correct order', () => {
      const a1 = { ...alarm, timestamp: timestamp - 1000, isActive: true };
      const a2 = { ...alarm, timestamp: timestamp - 500, isActive: false };
      const a3 = { ...alarm, timestamp: timestamp - 100, isActive: true };
      const a4 = { ...alarm, timestamp: timestamp - 10, isActive: false };
      return Promise.resolve()
        .then(() => [a1, a4, a2, a3]) // intentionally inserted out-of-order
        .then(storage.saveModels)
        .then(() => storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }))
        .then(models => {
          assert.equal(models.length, 2);
          assertEqualWithoutMeta(first(models), a3);
          assertEqualWithoutMeta(last(models), a1);
        });
    });
  });

  describe('timestampToString()', () => {
    it('generates timestamp strings of the expected type', () => {
      assert.equal(timestampToString(1544367587513), '2018-12-09T14:59:47.513Z');
    });
  });

  describe('model references', () => {
    const entry: MeterEntry = {
      modelType: 'MeterEntry',
      modelUuid: generateUuid(),
      timestamp: 1544372705829 - 1000,
      source: 'dexcom',
      bloodGlucose: 8,
    };

    const cal: DexcomCalibration = {
      modelType: 'DexcomCalibration',
      modelUuid: generateUuid(),
      timestamp: 1544372705829,
      meterEntries: [],
      isInitialCalibration: true,
      slope: null,
      intercept: null,
      scale: null,
    };

    it("complains when modelMeta isn't set", () => {
      return Promise.resolve()
        .then(() => ({ ...cal, meterEntries: [getModelRef(entry)] }))
        .then(
          () => assert.fail(),
          err => assert.match(err.message, /MeterEntry.*modelMeta/),
        );
    });

    it('saves models with references', () => {
      return Promise.resolve()
        .then(() => entry)
        .then(storage.saveModel)
        .then(entry => {
          return Promise.resolve()
            .then(() => ({ ...cal, meterEntries: [getModelRef(entry)] }))
            .then(storage.saveModel)
            .then(() => storage.loadLatestTimelineModel('DexcomCalibration'))
            .then(cal => {
              if (cal) {
                assert.deepEqual(cal.meterEntries, [{ modelType: 'MeterEntry', modelRef: getStorageKey(entry) }]);
              } else {
                assert.fail();
              }
            });
        });
    });

    it('loads models with references', () => {
      return Promise.resolve()
        .then(() => entry)
        .then(storage.saveModel)
        .then(entry => {
          return Promise.resolve()
            .then(() => ({ ...cal, meterEntries: [getModelRef(entry)] }))
            .then(storage.saveModel)
            .then(() => storage.loadLatestTimelineModel('DexcomCalibration'))
            .then(cal => (cal ? cal.meterEntries : []))
            .then(refs => Promise.all(refs.map(ref => storage.loadModelRef(ref))))
            .then(models =>
              models.forEach(model => {
                if (model) {
                  assert.equal(model.modelType, 'MeterEntry');
                  assert.equal(getStorageKey(model), getStorageKey(entry));
                } else {
                  assert.fail();
                }
              }),
            );
        });
    });

    it("complains when models with references can't be found", () => {
      return Promise.resolve()
        .then(() =>
          storage.loadModelRef({
            modelType: 'MeterEntry',
            modelRef: getStorageKey(model),
          }),
        )
        .then(
          () => assert.fail(), // expecting a failure
          err => assert.match(err.message, /Couldn't load modelRef "timeline\/.*"/),
        );
    });
  });
}
