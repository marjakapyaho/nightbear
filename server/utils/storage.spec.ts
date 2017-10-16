import 'mocha';
import { assert } from 'chai';
import { getStorageKey, createCouchDbStorage } from './storage';
import { Carbs, Settings } from './model';

describe('utils/storage', () => {

  const TEST_MODEL_1: Carbs = {
    modelType: 'Carbs',
    modelVersion: 1,
    timestamp: 1508092667717, // i.e. Sun Oct 15 2017 21:37:47 GMT+0300 (EEST)
    amount: 10,
    carbsType: 'normal',
  };
  const TEST_MODEL_2: Settings = {
    modelType: 'Settings',
    modelVersion: 1,
    alarmsEnabled: false,
  };

  describe('getStorageKey()', () => {

    it('works for timeline models', () => {
      assert.equal(
        getStorageKey(TEST_MODEL_1),
        'timeline/2017-10-15T18:37:47.717Z/Carbs',
      );
    });

    it('works for other models', () => {
      assert.equal(
        getStorageKey(TEST_MODEL_2),
        'other/Settings',
      );
    });

  });

  // Only run the tests for the CouchDB storage if one is configured for the test runner:
  const TEST_DB_URL = process.env.TEST_DB_URL || null;
  (TEST_DB_URL ? describe : xdescribe)('createCouchDbStorage()', () => {

    it('saves models', () => {
      const storage = createCouchDbStorage(TEST_DB_URL + '');
      const model = { ...TEST_MODEL_1, timestamp: Date.now() }; // we need to have unique timestamps, lest we get document conflicts from CouchDB
      return storage.saveModel(model)
        .then(savedModel => assert.deepEqual(savedModel, model));
    });

  });

});
