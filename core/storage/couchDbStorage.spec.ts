import { assert } from 'chai';
import { getStorageKey } from 'core/storage/couchDbStorage';
import { MODEL_1, MODEL_2, storageTestSuite } from 'core/storage/storage.spec';
import 'mocha';
import { withStorage } from 'server/utils/test';

describe('storage/couchDbStorage', () => {
  describe('getStorageKey()', () => {
    it('works for timeline models', () => {
      assert.match(getStorageKey(MODEL_1), /^timeline\/2017-10-15T18:37:47.717Z\/Carbs\/\w{8}$/);
    });

    it('works for global models', () => {
      assert.equal(getStorageKey(MODEL_2), 'global/Settings');
    });
  });

  withStorage(storageTestSuite);
});
