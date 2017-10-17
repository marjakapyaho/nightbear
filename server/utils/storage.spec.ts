import 'mocha';
import { assert } from 'chai';
import { getStorageKey, createCouchDbStorage, stripModelMeta } from './storage';
import { Carbs, Settings } from './model';

describe('utils/storage', () => {

  const MODEL_1: Carbs = {
    modelType: 'Carbs',
    modelVersion: 1,
    timestamp: 1508092667717, // i.e. Sun Oct 15 2017 21:37:47 GMT+0300 (EEST)
    amount: 10,
    carbsType: 'normal',
  };
  const MODEL_2: Settings = {
    modelType: 'Settings',
    modelVersion: 1,
    alarmsEnabled: false,
  };

  describe('getStorageKey()', () => {

    it('works for timeline models', () => {
      assert.equal(
        getStorageKey(MODEL_1),
        'timeline/2017-10-15T18:37:47.717Z/Carbs',
      );
    });

    it('works for other models', () => {
      assert.equal(
        getStorageKey(MODEL_2),
        'other/Settings',
      );
    });

  });

  // Only run the tests for the CouchDB storage if one is configured for the test runner:
  const TEST_DB_URL = process.env.TEST_DB_URL || null;
  (TEST_DB_URL ? describe : xdescribe)('createCouchDbStorage()', () => {

    it('saves models', () => {
      const storage = createCouchDbStorage(TEST_DB_URL + '');
      const expected = { ...MODEL_1, timestamp: Date.now() }; // we need to have unique timestamps, lest we get document conflicts from CouchDB
      return storage.saveModel(expected)
        .then(actual => assert.deepEqual(actual, expected));
    });

    it('loads models', () => {
      const storage = createCouchDbStorage(TEST_DB_URL + '');
      const expected = { ...MODEL_1, timestamp: Date.now() }; // we need to have unique timestamps, lest we get document conflicts from CouchDB
      return storage.saveModel(expected)
        .then(() => storage.loadTimelineModels(1000 * 60))
        .then(loadedModels => {
          const actual = loadedModels.find(model => model.modelType === 'Carbs' && model.timestamp === expected.timestamp);
          if (actual) {
            assert.deepEqual(stripModelMeta(actual), expected);
          } else {
            assert.fail('Model not found :(');
          }
        });
    });

  });

});
