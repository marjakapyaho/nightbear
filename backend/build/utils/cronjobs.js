"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = exports.runCronJobs = void 0;
const logging_1 = require("./logging");
const lodash_1 = require("lodash");
const luxon_1 = require("luxon");
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
/**
 * The process of running Cronjobs goes like this:
 *
 * 1. We get a bunch of functions that implement the Cronjob interface
 * 1. We invoke each of them in turn
 * 1. As input, each function gets a CronjobsJournal model from the DB, saved by the previous cronjobs run
 * 1. As output, each function optionally returns updates to that CronjobsJournal model, which get merged in
 * 1. When each function has been invoked, we persist the resulting CronjobsJournal model to the DB
 * 1. We're done
 */
const runCronJobs = async (context, cronjobs) => {
    const log = (0, logging_1.extendLogger)(context.log, 'cron');
    const now = Date.now();
    const jobNames = Object.keys(cronjobs);
    log(`System timezone is "${luxon_1.DateTime.local().zoneName}", app timezone is "${shared_2.DEFAULT_TIMEZONE}"`);
    log(`Running ${jobNames.length} cronjobs sequentially: ` + jobNames.join(', '));
    let [journal] = await context.db.cronjobsJournal.load();
    for (const jobName of jobNames) {
        const jobContext = (0, logging_1.extendLogger)(context, (0, lodash_1.kebabCase)(jobName));
        try {
            const journalUpdates = await cronjobs[jobName](jobContext, journal);
            journal = { ...journal, ...journalUpdates }; // if a job provided updates to the journal, merge those in
        }
        catch (err) {
            jobContext.log(`Cronjob "${jobName}" execution failed (caused by\n${err}\n)`);
        }
    }
    await context.db.cronjobsJournal.update({ ...journal, previousExecutionAt: new Date() }); // persist updated journal into DB for the next run
    log(`Finished, run took ${((Date.now() - now) / shared_1.SEC_IN_MS).toFixed(1)} sec`);
};
exports.runCronJobs = runCronJobs;
/**
 * Same as runCronJobs(), but keeps them running.
 */
const startCronJobs = async (context, cronjobs) => {
    await (0, exports.runCronJobs)(context, cronjobs); // run once right away
    setInterval(() => (0, exports.runCronJobs)(context, cronjobs), 60 * 1000);
};
exports.startCronJobs = startCronJobs;
//# sourceMappingURL=cronjobs.js.map