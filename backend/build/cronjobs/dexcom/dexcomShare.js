"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dexcomShare = void 0;
const dexcomShareClient_1 = require("./dexcomShareClient");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
const dexcomShare = async (context, journal) => {
    const { log, dexcomShare, config } = context;
    if (dexcomShare === dexcomShareClient_1.NO_DEXCOM_SHARE) {
        log(`Dexcom share not enabled`);
        return;
    }
    const { dexcomShareSessionId, dexcomShareLoginAttemptAt } = journal;
    const dexcomShareLoginAttemptTimestamp = dexcomShareLoginAttemptAt && (0, shared_2.getTimeInMillis)(dexcomShareLoginAttemptAt);
    const mins = config.DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES || 60;
    const loginAttemptAllowed = !dexcomShareLoginAttemptTimestamp ||
        (0, shared_2.isTimeLarger)(Date.now() - dexcomShareLoginAttemptTimestamp, shared_1.MIN_IN_MS * mins);
    if (dexcomShareSessionId) {
        let latestBg;
        try {
            latestBg = await context.db.getLatestSensorEntry();
            if (latestBg) {
                const ageInMin = (Date.now() - (0, shared_2.getTimeInMillis)(latestBg.timestamp)) / shared_1.MIN_IN_MS;
                const ageModulo = ageInMin % 5;
                const willFetch = ageModulo > 0.35 && // new BG's aren't visible on Dexcom Share immediately → give it a bit of time
                    ageModulo < 1.75 && // not within the time window where new BG's appear → no point in fetching until a new one may be available again
                    ageInMin >= 4.5; // our fetch window is slightly larger than 1 minute, to ensure slight scheduling wobble of the cronjob doesn't cause fetches to be skipped → need a mechanism for preventing the opposite (i.e. unnecessary consecutive fetches)
                log(`Time since last BG is ${ageInMin.toFixed(1)} min → ${willFetch ? 'WILL' : "won't"} fetch BG`);
                if (!willFetch)
                    return;
            }
        }
        catch (err) {
            if (err instanceof Error &&
                err.message.match(/Expected exactly one result row but got 0 instead/)) {
                log(`Assuming this is the first time ever we're trying to fetch BG`);
            }
            else {
                throw err; // something else is wrong, and it might not be safe to proceed (continuous error loop for example)
            }
        }
        try {
            const res = await dexcomShare.fetchBg(dexcomShareSessionId);
            const model = parseIncomingBg(res);
            const lagInMin = (Date.now() - (0, shared_2.getTimeInMillis)(model.timestamp)) / shared_1.MIN_IN_MS;
            const desc = `BG ${model.bloodGlucose}, timestamp ${(0, shared_2.humanReadableLongTime)(model.timestamp)}`;
            log(`BG lag is ${lagInMin.toFixed(1)} min (may include clock drift)`);
            if (latestBg && latestBg.timestamp === model.timestamp) {
                log(`This entry already exists: ${desc}`); // already exists in the DB → no need to do anything!
            }
            else {
                await context.db.createSensorEntry(model); // we didn't find the entry yet → create it
                log(`Saved new SensorEntry: ${desc}`);
            }
        }
        catch (err) {
            log(`Could not fetch BG (caused by\n${err}\n), will mark the session as needing refresh`);
            return {
                dexcomShareSessionId: null,
            };
        }
    }
    else {
        if (loginAttemptAllowed) {
            log('No session, will attempt login');
            try {
                const dexcomShareSessionId = await dexcomShare.login();
                log('Login was successful, BG will be fetched on the next round');
                return {
                    dexcomShareSessionId,
                    dexcomShareLoginAttemptAt: new Date().toISOString(),
                };
            }
            catch (err) {
                log(`Login attempt failed (caused by\n${err}\n)`);
                return {
                    dexcomShareLoginAttemptAt: new Date().toISOString(),
                };
            }
        }
        else {
            const readableTime = dexcomShareLoginAttemptTimestamp
                ? (0, shared_2.humanReadableLongTime)((0, shared_2.getTimeAsISOStr)(dexcomShareLoginAttemptTimestamp))
                : 'n/a';
            log(`No session, will NOT attempt login, last attempt was at ${readableTime}, too soon (under ${mins} min)`);
        }
    }
};
exports.dexcomShare = dexcomShare;
function parseIncomingBg(res) {
    if (!(0, lodash_1.isArray)(res))
        throw new Error(`Unexpected response payload: ${typeof res}`);
    if (res.length !== 1)
        throw new Error(`Unexpected response length: ${res.length}`);
    const [val] = res;
    return (0, utils_1.mapDexcomShareResponseToSensorEntry)(val);
}
//# sourceMappingURL=dexcomShare.js.map