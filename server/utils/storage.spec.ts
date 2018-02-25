import 'mocha';
import { assert } from 'chai';
import { Storage, getStorageKey, createCouchDbStorage } from './storage';
import { Carbs, Settings, Model } from './model';

// Asserts deep equality of 2 Models, ignoring their metadata
function assertEqualWithoutMeta(actual: Model, expected: Model): void {
  assert.deepEqual(
    Object.assign({}, actual, { modelMeta: undefined }),
    Object.assign({}, expected, { modelMeta: undefined }),
  );
}

describe('utils/storage', () => {

  const MODEL_1: Carbs = {
    modelType: 'Carbs',
    timestamp: 1508092667717, // i.e. Sun Oct 15 2017 21:37:47 GMT+0300 (EEST)
    amount: 10,
    carbsType: 'normal',
  };
  const MODEL_2: Settings = {
    modelType: 'Settings',
    alarmsEnabled: false,
  };

  describe('getStorageKey()', () => {

    it('works for timeline models', () => {
      assert.equal(
        getStorageKey(MODEL_1),
        'timeline/2017-10-15T18:37:47.717Z/Carbs',
      );
    });

    it('works for global models', () => {
      assert.equal(
        getStorageKey(MODEL_2),
        'global/Settings',
      );
    });

  });

  // Only run the tests for the CouchDB storage if one is configured for the test runner:
  const TEST_DB_URL = process.env.TEST_DB_URL || null;
  (TEST_DB_URL ? describe : xdescribe)('createCouchDbStorage()', () => {

    let storage: Storage;
    let timestamp: number;
    let model: Carbs;

    function findModel(models: Model[]): Model {
      const found = models.find(m => m.modelType === model.modelType && m.timestamp === model.timestamp);
      if (found) return found;
      throw new Error(`Couldn't find the Model this test case is operating on`);
    }

    beforeEach(() => {
      storage = createCouchDbStorage(TEST_DB_URL + '');
      timestamp = Date.now(); // we need to have unique timestamps, lest we get document conflicts from CouchDB
      model = { ...MODEL_1, timestamp };
    });

    it('saves models', () => {
      return storage.saveModel(model)
        .then(actual => assertEqualWithoutMeta(actual, model));
    });

    it('loads timeline models', () => {
      return storage.saveModel(model)
        .then(() => storage.loadTimelineModels(1000 * 60))
        .then(loadedModels => assertEqualWithoutMeta(findModel(loadedModels), model));
    });

    it('loads global models', () => {
      return storage.saveModel(MODEL_2)
        .catch(() => null) // if the Model already existed, this will fail, but for the purposes of this test, it doesn't matter
        .then(() => storage.loadGlobalModels())
        .then(loadedModels => assertEqualWithoutMeta(
          loadedModels.find(model => model.modelType === MODEL_2.modelType) as any, // cheating is allowed in test code
          MODEL_2,
        ));
    });

    it('saves models that have been saved before', () => {
      assert.equal(model.amount, 10); // check baseline assumptions
      return storage.saveModel(model)
        .then(savedModel => ({ ...savedModel, amount: 123 }))
        .then(storage.saveModel)
        .then(savedModel => assertEqualWithoutMeta(
          savedModel,
          { ...model, amount: 123 },
        ));
    });

    it('saves models that have been loaded before', () => {
      assert.equal(model.amount, 10); // check baseline assumptions
      return storage.saveModel(model)
        .then(() => storage.loadTimelineModels(1000 * 60))
        .then(loadedModels => findModel(loadedModels))
        .then(loadedModel => ({ ...loadedModel, amount: 123 }))
        .then(storage.saveModel)
        .then(savedModel => assertEqualWithoutMeta(
          savedModel,
          { ...model, amount: 123 },
        ));
    });

  });

});
