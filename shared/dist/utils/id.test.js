"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const id_1 = require("./id");
const vitest_1 = require("vitest");
const TEST_ITERATIONS = 1000;
(0, vitest_1.describe)('@nightbear/shared/utils/id', () => {
    (0, vitest_1.describe)('generateUuid()', () => {
        (0, vitest_1.it)(`generates ${TEST_ITERATIONS} successive ID's that look right`, () => {
            for (let i = 0; i < TEST_ITERATIONS; i++) {
                (0, vitest_1.expect)((0, id_1.generateUuid)()).toMatch(id_1.UUID_REGEX);
            }
        });
        (0, vitest_1.it)(`generates ${TEST_ITERATIONS} successive, unique ID's`, () => {
            const ids = new Set();
            for (let i = 0; i < TEST_ITERATIONS; i++) {
                const id = (0, id_1.generateUuid)();
                (0, vitest_1.expect)(ids.has(id)).toBe(false);
                ids.add(id);
            }
        });
    });
    (0, vitest_1.describe)('generateShortId()', () => {
        (0, vitest_1.it)(`generates ${TEST_ITERATIONS} successive ID's that look right`, () => {
            for (let i = 0; i < TEST_ITERATIONS; i++) {
                (0, vitest_1.expect)((0, id_1.generateShortId)()).toMatch(/^[0-9a-zA-Z]{8}$/);
            }
        });
        (0, vitest_1.it)(`generates ${TEST_ITERATIONS} successive, unique ID's`, () => {
            const ids = new Set();
            for (let i = 0; i < TEST_ITERATIONS; i++) {
                const id = (0, id_1.generateShortId)();
                (0, vitest_1.expect)(ids.has(id)).toBe(false);
                ids.add(id);
            }
        });
    });
});
//# sourceMappingURL=id.test.js.map