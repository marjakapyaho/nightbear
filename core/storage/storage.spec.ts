import 'mocha';
import { assert } from 'chai';
import { Model, Carbs, Settings, Alarm } from 'core/models/model';
import { Storage, StorageError } from 'core/storage/storage';
import { activeProfile, assertEqualWithoutMeta } from 'server/utils/test';
import { REV_CONFLICT_SAVE_ERROR } from 'core/storage/couchDbStorage';
import { is } from 'core/models/utils';

export const MODEL_1: Carbs = {
  modelType: 'Carbs',
  timestamp: 1508092667717, // i.e. Sun Oct 15 2017 21:37:47 GMT+0300 (EEST)
  amount: 10,
  carbsType: 'normal',
};

export const MODEL_2: Settings = {
  modelType: 'Settings',
  alarmsEnabled: false,
  activeProfile: activeProfile('day'),
};

export function storageTestSuite(createTestStorage: () => Storage) {
  let storage: Storage;
  let timestamp: number;
  let model: Carbs;

  function findModel(models: Model[]): Model {
    const found = models.find(
      m => m.modelType === model.modelType && m.timestamp === model.timestamp,
    );
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
          assert.match(err.message, /Couldn't save model.*global.*Settings.*update conflict/);
          // Check that success is reported:
          assert.equal(err.saveSucceededForModels.length, 0);
          // Check that failure is reported:
          assert.equal(err.saveFailedForModels.length, 1);
          const [failedModel, reason] = err.saveFailedForModels[0];
          if (is('Settings')(failedModel)) {
            assert.equal(failedModel.activeProfile, MODEL_2.activeProfile);
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
      model, // make sure we conflict
    ];
    return storage.saveModels(models).then(
      () => {
        throw new Error('Expecting a failure');
      },
      (err: StorageError) => {
        assert.match(
          err.message,
          /Couldn't save some models:\n.*timeline.*Carbs.*OK\n.*timeline.*Carbs.*update conflict/,
        );
        // Check that success is reported:
        assert.equal(err.saveSucceededForModels.length, 1);
        const succeededModel = err.saveSucceededForModels[0];
        if (is('Carbs')(succeededModel)) {
          assert.equal(succeededModel.timestamp, model.timestamp);
        } else {
          assert.fail('Did not get the expected Model back');
        }
        // Check that failure is reported:
        assert.equal(err.saveFailedForModels.length, 1);
        const [failedModel, reason] = err.saveFailedForModels[0];
        if (is('Carbs')(failedModel)) {
          assert.equal(failedModel.timestamp, model.timestamp);
        } else {
          assert.fail('Did not get the expected Model back');
        }
        assert.equal(reason, REV_CONFLICT_SAVE_ERROR);
      },
    );
  });

  it('loads timeline models', () => {
    return storage
      .saveModel(model)
      .then(() => storage.loadTimelineModels('Carbs', 1000 * 60, timestamp))
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
      .then(() => storage.loadTimelineModels('Carbs', 1000 * 60, timestamp))
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
        assertEqualWithoutMeta(models[0], { ...model, timestamp: timestamp - 0, amount: 3 });
      });
  });

  describe('loading active alarms', () => {
    const alarm: Alarm = {
      modelType: 'Alarm',
      timestamp: 0,
      validAfterTimestamp: 0,
      alarmLevel: 0,
      situationType: 'HIGH',
      isActive: false,
      pushoverReceipts: [],
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
          assertEqualWithoutMeta(models[0], a1);
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
          assertEqualWithoutMeta(models[0], a3);
          assertEqualWithoutMeta(models[1], a1);
        });
    });
  });
}
