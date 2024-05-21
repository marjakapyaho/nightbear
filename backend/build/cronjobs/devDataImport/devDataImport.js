"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devDataImport = void 0;
const axios_1 = __importDefault(require("axios"));
const date_fns_1 = require("date-fns");
const lodash_1 = __importDefault(require("lodash"));
const shared_1 = require("@nightbear/shared");
const devDataImport = async (context, _journal) => {
    const { log, config, db } = context;
    if (!config.DEV_DATA_IMPORT_FROM_COUCHDB) {
        log(`Dev data import not configured, nothing to do`);
        return;
    }
    const data = await fetchTimelineEntries(context, 5);
    let imported = 0;
    let skipped = 0;
    for (const d of data) {
        try {
            await db.createSensorEntries([d]);
            imported++;
        }
        catch (err) {
            if (err instanceof Error &&
                err.message.match(/duplicate key value violates unique constraint/)) {
                skipped++;
            }
            else {
                throw err;
            }
        }
    }
    if (imported || skipped) {
        log(`Imported ${imported} entries, skipped ${skipped} which already existed`);
    }
};
exports.devDataImport = devDataImport;
const fetchTimelineEntries = async (context, minutes) => {
    const { log, config } = context;
    const encode = (x) => encodeURIComponent(JSON.stringify(x));
    const startKey = encode(`timeline/${(0, date_fns_1.subMinutes)(new Date(), minutes).toISOString()}`);
    const endKey = encode(`timeline/_`);
    const url = `${config.DEV_DATA_IMPORT_FROM_COUCHDB}/_all_docs?startkey=${startKey}&endkey=${endKey}&include_docs=true`;
    const response = await axios_1.default.get(url);
    const data = response.data.rows.map(row => {
        const modelType = lodash_1.default.get(row, 'doc.modelType');
        const timestamp = lodash_1.default.get(row, 'doc.timestamp');
        const bloodGlucose = lodash_1.default.get(row, 'doc.bloodGlucose');
        if (modelType === 'DexcomG6ShareEntry' &&
            typeof timestamp === 'number' &&
            typeof bloodGlucose === 'number') {
            return {
                type: 'DEXCOM_G6_SHARE',
                timestamp: new Date(timestamp).toISOString(),
                bloodGlucose,
            };
        }
        return null;
    });
    const dataUseful = data.filter(shared_1.isNotNullish);
    const dataUseless = data.filter(shared_1.isNullish);
    log(`Found ${dataUseful.length} entries to import, and ${dataUseless.length} to ignore`);
    return dataUseful;
};
//# sourceMappingURL=devDataImport.js.map