import { assert } from 'chai';
import 'mocha';
import { getMergedEntriesFeed } from './entries';
import { HOUR_IN_MS } from '../calculations/calculations';
import { createTestContext } from 'server/utils/test';

describe('core/entries', () => {
  const timestamp = Date.now();
  const context = createTestContext();

  it('getMergedEntriesFeed', () => {
    getMergedEntriesFeed(context, 24 * HOUR_IN_MS, timestamp)
      .then(entries => {
        assert.deepEqual(entries, []);
      });
  });
});
