import { UUID_REGEX, generateShortId, generateUuid } from './id';
import { describe, expect, it } from 'vitest';

const TEST_ITERATIONS = 1000;

describe('@nightbear/shared/utils/id', () => {
  describe('generateUuid()', () => {
    it(`generates ${TEST_ITERATIONS} successive ID's that look right`, () => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        expect(generateUuid()).toMatch(UUID_REGEX);
      }
    });

    it(`generates ${TEST_ITERATIONS} successive, unique ID's`, () => {
      const ids = new Set<string>();
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const id = generateUuid();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    });
  });

  describe('generateShortId()', () => {
    it(`generates ${TEST_ITERATIONS} successive ID's that look right`, () => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        expect(generateShortId()).toMatch(/^[0-9a-zA-Z]{8}$/);
      }
    });

    it(`generates ${TEST_ITERATIONS} successive, unique ID's`, () => {
      const ids = new Set<string>();
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const id = generateShortId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    });
  });
});
