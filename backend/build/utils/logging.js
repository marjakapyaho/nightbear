"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleLogStream = exports.extendLogger = exports.createLogger = exports.NO_LOGGING = void 0;
const shared_1 = require("@nightbear/shared");
const debug_1 = __importDefault(require("debug"));
const lodash_1 = require("lodash");
// Convenience object for having no logging
exports.NO_LOGGING = lodash_1.noop;
// Creates a new root Logger.
// This can (and should) be extended as needed.
// For debug/info/warn/error-colors see: https://github.com/visionmedia/debug/issues/514#issuecomment-372297694
function createLogger() {
    return (0, debug_1.default)('nightbear');
}
exports.createLogger = createLogger;
function extendLogger(x, namespace, keepColor = false) {
    if (isNoopLogger(x)) {
        return x;
    }
    else if (isConcreteLogger(x)) {
        const e = x.extend(namespace);
        if (keepColor)
            e.color = x.color;
        return e;
    }
    else {
        return { ...x, log: extendLogger(x.log, namespace, keepColor) };
    }
}
exports.extendLogger = extendLogger;
// Output stream that writes to console.log(), with the exact formatting we want.
// See: https://github.com/visionmedia/debug#output-streams
function consoleLogStream(x) {
    const ts = (0, shared_1.humanReadableShortTime)();
    x = x.replace(/^ */gm, ''); // remove leading spaces; see https://github.com/visionmedia/debug/issues/619
    x = x.replace(/^([^ ]*)nightbear:/gm, '$1'); // remove the common "nightbear:" prefix; it's good to have in the namespace for filtering etc, but we don't want to show it all the time
    x = x.replace(/^/gm, `${ts} `); // prefix each line with our timestamp
    console.log(x);
}
exports.consoleLogStream = consoleLogStream;
function isNoopLogger(x) {
    return x === lodash_1.noop;
}
function isConcreteLogger(x) {
    return typeof x === 'function' && 'color' in x && 'extend' in x && 'namespace' in x; // close enough ¯\_(ツ)_/¯
}
//# sourceMappingURL=logging.js.map