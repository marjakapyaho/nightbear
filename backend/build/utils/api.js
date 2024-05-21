"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeployedVersion = exports.createResponse = exports.createNodeContext = void 0;
const pushoverClient_1 = require("../cronjobs/alarms/pushoverClient");
const dexcomShareClient_1 = require("../cronjobs/dexcom/dexcomShareClient");
const logging_1 = require("./logging");
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
const db_1 = require("./db");
function createNodeContext() {
    const { DATABASE_URL, NIGHTBEAR_DB_URL, PUSHOVER_USER, PUSHOVER_TOKEN, PUSHOVER_CALLBACK, DEXCOM_SHARE_USERNAME, DEXCOM_SHARE_PASSWORD, DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES, PUSHOVER_DISABLED, DEV_DATA_IMPORT_FROM_COUCHDB, } = process.env;
    if (!DATABASE_URL)
        throw new Error(`Missing required env-var: DATABASE_URL`);
    if (!NIGHTBEAR_DB_URL)
        throw new Error(`Missing required env-var: NIGHTBEAR_DB_URL`);
    if (!PUSHOVER_USER)
        throw new Error(`Missing required env-var: PUSHOVER_USER`);
    if (!PUSHOVER_TOKEN)
        throw new Error(`Missing required env-var: PUSHOVER_TOKEN`);
    if (!PUSHOVER_CALLBACK)
        throw new Error(`Missing required env-var: PUSHOVER_CALLBACK`);
    const log = (0, logging_1.createLogger)();
    const config = {
        DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES: (0, shared_1.parseNumber)(DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES) ?? 180, // Default to 3 hours
        DEV_DATA_IMPORT_FROM_COUCHDB,
    };
    log(`Starting Nightbear version ${getDeployedVersion()}`);
    log(`Loaded config is: ${(0, lodash_1.map)(config, (val, key) => [key, val].join('=')).join(', ')}`);
    return {
        httpPort: 4000,
        timestamp: () => (0, shared_2.getTimeAsISOStr)(Date.now()),
        log,
        db: (0, db_1.createDbClient)(DATABASE_URL),
        storage: null, // TODO
        pushover: PUSHOVER_DISABLED
            ? pushoverClient_1.NO_PUSHOVER
            : (0, pushoverClient_1.createPushoverClient)(PUSHOVER_USER, PUSHOVER_TOKEN, PUSHOVER_CALLBACK, log),
        dexcomShare: DEXCOM_SHARE_USERNAME && DEXCOM_SHARE_PASSWORD
            ? (0, dexcomShareClient_1.createDexcomShareClient)(DEXCOM_SHARE_USERNAME, DEXCOM_SHARE_PASSWORD, log)
            : dexcomShareClient_1.NO_DEXCOM_SHARE,
        config,
    };
}
exports.createNodeContext = createNodeContext;
function createResponse(responseBody = '') {
    return Promise.resolve({
        responseStatus: 200,
        responseBody,
    });
}
exports.createResponse = createResponse;
function getDeployedVersion() {
    try {
        return (0, fs_1.readFileSync)('.nightbear-deploy-version').toString().trim();
    }
    catch (err) {
        return '(local dev)';
    }
}
exports.getDeployedVersion = getDeployedVersion;
//# sourceMappingURL=api.js.map