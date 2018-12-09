import 'mocha';
import { assert } from 'chai';
import { withStorage } from 'server/utils/test';
import { getStorageKey } from 'core/storage/couchDbStorage';
import { MODEL_1, MODEL_2, storageTestSuite } from 'core/storage/storage.spec';

describe('storage/couchDbStorage', () => {
  describe('getStorageKey()', () => {
    it('works for timeline models', () => {
      assert.equal(getStorageKey(MODEL_1), 'timeline/2017-10-15T18:37:47.717Z/Carbs');
    });

    it('works for global models', () => {
      assert.equal(getStorageKey(MODEL_2), 'global/Settings');
    });
  });

  withStorage(storageTestSuite);
});
