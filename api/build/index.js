"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLambdaEvent = void 0;
const handler_1 = require("./routes/alarms/handler");
const checks_1 = require("./cronjobs/checks/checks");
const devDataImport_1 = require("./cronjobs/devDataImport/devDataImport");
const dexcomShare_1 = require("./cronjobs/dexcom/dexcomShare");
const profiles_1 = require("./cronjobs/profiles/profiles");
const temp_1 = require("./cronjobs/temp");
const cronjobs_1 = require("./utils/cronjobs");
const express_1 = require("./utils/express");
const logging_1 = require("./utils/logging");
const debug_1 = __importDefault(require("debug"));
const handler_2 = require("./routes/profiles/handler");
const handler_3 = require("./routes/timelineEntries/handler");
const api_1 = require("./utils/api");
// Direct log output to where we want it
debug_1.default.log = logging_1.consoleLogStream;
// Create application runtime context
const context = (0, api_1.createNodeContext)();
// Start serving API requests
(0, express_1.startExpressServer)(context, ['get', '/get-active-alarm', handler_1.getActiveAlarm], ['put', '/ack-active-alarm', handler_1.ackActiveAlarm], ['get', '/get-profiles', handler_2.getProfiles], ['post', '/create-profile', handler_2.createProfile], ['put', '/edit-profile', handler_2.editProfile], ['post', '/activate-profile', handler_2.activateProfile], ['get', '/get-timeline-entries', handler_3.getTimelineEntries], ['put', '/update-timeline-entries', handler_3.updateTimelineEntries]);
// Start running periodic tasks
(0, cronjobs_1.startCronJobs)(context, {
    dexcomShare: dexcomShare_1.dexcomShare, // run this before checks()
    profiles: // run this before checks()
    profiles_1.profiles,
    devDataImport: devDataImport_1.devDataImport,
    checks: checks_1.checks, // run this after dexcomShare()
});
async function handleLambdaEvent(event) {
    if ('source' in event && event['detail-type'] === 'Scheduled Event') {
        console.log('Handling cron');
        await (0, cronjobs_1.runCronJobs)(context, {
            temp: temp_1.temp,
        });
    }
    else if ('httpMethod' in event) {
        console.log('Handling request');
        return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify(await context.db.cronjobsJournal.load()),
        };
    }
    else {
        throw new Error(`Trying to handle unknown Lambda event type`);
    }
}
exports.handleLambdaEvent = handleLambdaEvent;
//# sourceMappingURL=index.js.map