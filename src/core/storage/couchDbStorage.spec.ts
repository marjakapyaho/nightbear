import { assert } from 'chai';
import { getStorageKey } from 'core/storage/couchDbStorage';
import { MODEL_1, MODEL_2, storageTestSuite } from 'core/storage/storage.spec';
import 'mocha';
import { withStorage } from 'server/utils/test';
import { UUID_REGEX } from 'core/utils/id';

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
