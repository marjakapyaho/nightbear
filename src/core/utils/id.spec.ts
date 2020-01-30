import { assert } from 'chai';
import 'mocha';
import { generateUuid, generateShortId, UUID_REGEX } from 'core/utils/id';

const TEST_ITERATIONS = 1000;

describe('core/utils/id', () => {
  describe('generateUuid()', () => {
    it('generates ' + TEST_ITERATIONS + " successive ID's that look right", () => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        assert.match(generateUuid(), UUID_REGEX);
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

  describe('generateShortId()', () => {
    it('generates ' + TEST_ITERATIONS + " successive ID's that look right", () => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        assert.match(generateShortId(), /^[0-9a-zA-Z]{8}$/);
      }
    });

    it('generates ' + TEST_ITERATIONS + " successive, unique ID's", () => {
      const ids: { [uuid: string]: string } = {};
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const id = generateShortId();
        if (ids[id]) throw new Error('Duplicate ID generated');
        ids[id] = id;
      }
    });
  });
});
