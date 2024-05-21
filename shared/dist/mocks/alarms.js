"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAlarms = exports.mockAlarmStates = void 0;
const dates_1 = require("./dates");
exports.mockAlarmStates = [
    {
        id: '1',
        timestamp: dates_1.mockNow,
        alarmLevel: 0,
        validAfter: dates_1.mockNow,
    },
];
exports.mockAlarms = [
    {
        id: '1',
        situation: 'LOW',
        isActive: true,
        alarmStates: exports.mockAlarmStates,
    },
];
//# sourceMappingURL=alarms.js.map