"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundNumberToFixedDecimals = exports.isValidNumber = exports.parseNumber = exports.isNotNullish = exports.isNullish = exports.getObjectKeys = void 0;
const getFactor = (numberOfZeros) => {
    const requiredZerosString = new Array(numberOfZeros).fill(0).join('');
    const factorString = `1${requiredZerosString}`;
    return parseInt(factorString);
};
const getObjectKeys = (object) => {
    return Object.keys(object);
};
exports.getObjectKeys = getObjectKeys;
const isNullish = (x) => {
    return x === null && typeof x === 'undefined';
};
exports.isNullish = isNullish;
const isNotNullish = (x) => {
    return x !== null && typeof x !== 'undefined';
};
exports.isNotNullish = isNotNullish;
const parseNumber = (num) => {
    const parsed = parseInt(String(num));
    return isFinite(parsed) ? parsed : undefined;
};
exports.parseNumber = parseNumber;
const isValidNumber = (num) => isFinite(num) && !isNaN(num);
exports.isValidNumber = isValidNumber;
const roundNumberToFixedDecimals = (num, decimals = 0) => {
    const factor = getFactor(decimals);
    return Math.round(num * factor) / factor;
};
exports.roundNumberToFixedDecimals = roundNumberToFixedDecimals;
//# sourceMappingURL=helpers.js.map