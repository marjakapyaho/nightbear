import { assert } from 'chai';
import { getStorageKey } from 'shared/storage/couchDbStorage';
import { MODEL_1, MODEL_2, storageTestSuite } from 'shared/storage/storage.spec';
import 'mocha';
import { withStorage } from 'backend/utils/test';
import { UUID_REGEX } from 'shared/utils/id';

describe('storage/couchDbStorage', () => {
  describe('getStorageKey()', () => {
    it('works for timeline models', () => {
      const [prefix, timestamp, uuid, end] = getStorageKey(MODEL_1).split('/');
      assert.equal(prefix, 'timeline');
      assert.equal(timestamp, '2017-10-15T18:37:47.717Z');
      assert.match(uuid, UUID_REGEX);
      assert.equal(end, undefined);
    });

    it('works for global models', () => {
      const [prefix, type, uuid, end] = getStorageKey(MODEL_2).split('/');
      assert.equal(prefix, 'global');
      assert.equal(type, 'SavedProfile');
      assert.match(uuid, UUID_REGEX);
      assert.equal(end, undefined);
    });
  });

  withStorage(storageTestSuite);
});
