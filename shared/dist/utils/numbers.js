"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberToUINumber = exports.replaceCommaWithDot = exports.toValidNumber = exports.isNumberValid = void 0;
const isNumberValid = (val) => {
    return /^\d+([.,]\d+)?$/.test(`${val}`);
};
exports.isNumberValid = isNumberValid;
const toValidNumber = (value, decimals = 1) => {
    const valueAsNumberWithoutRounding = Number.parseFloat(value.replace(',', '.'));
    const valueAsNumberRounded = parseFloat(valueAsNumberWithoutRounding.toFixed(decimals));
    return Number.isNaN(valueAsNumberRounded) ? 0 : valueAsNumberRounded;
};
exports.toValidNumber = toValidNumber;
const replaceCommaWithDot = (value) => `${value}`.replace(',', '.');
exports.replaceCommaWithDot = replaceCommaWithDot;
const numberToUINumber = (num, decimals = 1) => (0, exports.replaceCommaWithDot)(num.toFixed(decimals));
exports.numberToUINumber = numberToUINumber;
//# sourceMappingURL=numbers.js.map