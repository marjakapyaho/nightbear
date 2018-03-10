import 'mocha';
import { assert } from 'chai';
import { getStorageKey, createCouchDbStorage } from './couchDbStorage';
import { MODEL_1, MODEL_2, storageTestSuite } from './storage.spec';

describe('storage/couchDbStorage', () => {

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

    storageTestSuite(
      createCouchDbStorage(TEST_DB_URL + ''),
    );

  });

});
