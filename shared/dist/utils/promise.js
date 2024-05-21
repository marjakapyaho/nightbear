"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reject = void 0;
// Convenience helper for creating a rejected Promise containing an Error
function reject(message) {
    return Promise.reject(new Error(message));
}
exports.reject = reject;
//# sourceMappingURL=promise.js.map