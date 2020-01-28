import { assert } from 'chai';
import 'mocha';
import { generateUuid } from 'core/utils/id';

const TEST_ITERATIONS = 1000;

describe('core/utils/id', () => {
  describe('generateUuid()', () => {
    it('generates ' + TEST_ITERATIONS + " successive ID's that look right", () => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        assert.match(generateUuid(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      }
    });

    it('generates ' + TEST_ITERATIONS + " successive, unique ID's", () => {
      const ids: { [uuid: string]: string } = {};
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const id = generateUuid();
        if (ids[id]) throw new Error('Duplicate ID generated');
        ids[id] = id;
      }
    });
  });
});
