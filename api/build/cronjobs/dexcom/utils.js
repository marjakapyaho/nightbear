"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapDexcomShareResponseToSensorEntry = void 0;
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
const mapDexcomShareResponseToSensorEntry = (val) => {
    return {
        timestamp: (0, shared_2.getTimeAsISOStr)(parseInt(val.WT.replace(/.*Date\(([0-9]+).*/, '$1'), 10)), // e.g. "/Date(1587217854000)/" => 1587217854000
        bloodGlucose: (0, shared_1.changeBloodGlucoseUnitToMmoll)(val.Value),
        type: 'DEXCOM_G6_SHARE',
    };
};
exports.mapDexcomShareResponseToSensorEntry = mapDexcomShareResponseToSensorEntry;
//# sourceMappingURL=utils.js.map