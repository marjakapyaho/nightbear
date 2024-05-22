"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queries = void 0;
const carbEntries_queries_1 = require("./carbEntries/carbEntries.queries");
const insulinEntries_queries_1 = require("./insulinEntries/insulinEntries.queries");
const meterEntries_queries_1 = require("./meterEntries/meterEntries.queries");
const sensorEntries_queries_1 = require("./sensorEntries/sensorEntries.queries");
const db_1 = require("../utils/db");
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
const shared_3 = require("@nightbear/shared");
const shared_4 = require("@nightbear/shared");
const shared_5 = require("@nightbear/shared");
const alarms_queries_1 = require("./alarms/alarms.queries");
const profiles_queries_1 = require("./profiles/profiles.queries");
const queries = (pool) => {
    const { one, many, oneOrNone } = (0, db_1.bindQueryShorthands)(pool);
    return {
        async createSensorEntry(sensorEntry) {
            return one(shared_4.SensorEntry, sensorEntries_queries_1.createSensorEntry, sensorEntry);
        },
        async createSensorEntries(sensorEntries) {
            return many(shared_4.SensorEntry, sensorEntries_queries_1.createSensorEntries, { sensorEntries });
        },
        async getLatestSensorEntry() {
            return one(shared_4.SensorEntry, sensorEntries_queries_1.getLatestSensorEntry);
        },
        async getSensorEntriesByTimestamp(timeRange) {
            return many(shared_4.SensorEntry, sensorEntries_queries_1.getSensorEntriesByTimestamp, timeRange);
        },
        async upsertInsulinEntry(insulinEntry) {
            return one(shared_4.InsulinEntry, insulinEntries_queries_1.upsertInsulinEntry, insulinEntry);
        },
        async deleteInsulinEntry(timestamp) {
            return oneOrNone(shared_3.TimestampReturnType, insulinEntries_queries_1.deleteInsulinEntry, { timestamp });
        },
        async createInsulinEntries(insulinEntries) {
            return many(shared_4.InsulinEntry, insulinEntries_queries_1.createInsulinEntries, { insulinEntries });
        },
        async getInsulinEntriesByTimestamp(timeRange) {
            return many(shared_4.InsulinEntry, insulinEntries_queries_1.getInsulinEntriesByTimestamp, timeRange);
        },
        async upsertCarbEntry(carbEntry) {
            return one(shared_4.CarbEntry, carbEntries_queries_1.upsertCarbEntry, carbEntry);
        },
        async deleteCarbEntry(timestamp) {
            return oneOrNone(shared_3.TimestampReturnType, carbEntries_queries_1.deleteCarbEntry, { timestamp });
        },
        async createCarbEntries(carbEntries) {
            return many(shared_4.CarbEntry, carbEntries_queries_1.createCarbEntries, { carbEntries });
        },
        async getCarbEntriesByTimestamp(timeRange) {
            return many(shared_4.CarbEntry, carbEntries_queries_1.getCarbEntriesByTimestamp, timeRange);
        },
        async upsertMeterEntry(meterEntry) {
            return one(shared_4.MeterEntry, meterEntries_queries_1.upsertMeterEntry, meterEntry);
        },
        async deleteMeterEntry(timestamp) {
            return oneOrNone(shared_3.TimestampReturnType, meterEntries_queries_1.deleteMeterEntry, { timestamp });
        },
        async createMeterEntries(meterEntries) {
            return many(shared_4.MeterEntry, meterEntries_queries_1.createMeterEntries, { meterEntries });
        },
        async getMeterEntriesByTimestamp(timeRange) {
            return many(shared_4.MeterEntry, meterEntries_queries_1.getMeterEntriesByTimestamp, timeRange);
        },
        async createProfile(profile) {
            return one(shared_3.IdReturnType, profiles_queries_1.createProfileTemplate, {
                ...profile,
                ...profile.analyserSettings,
                ...profile.situationSettings,
            });
        },
        async editProfile(profile, id) {
            return one(shared_3.IdReturnType, profiles_queries_1.editProfileTemplate, {
                id,
                profileName: profile.profileName,
                alarmsEnabled: profile.alarmsEnabled,
                notificationTargets: profile.notificationTargets,
                ...profile.analyserSettings,
                ...profile.situationSettings,
            });
        },
        async getProfiles() {
            return many(shared_2.Profile, profiles_queries_1.getProfiles);
        },
        async getProfileById(templateId) {
            return one(shared_2.Profile, profiles_queries_1.getProfiles, { templateId });
        },
        async getActiveProfile() {
            const [activeProfile] = await many(shared_2.Profile, profiles_queries_1.getProfiles, { onlyActive: true });
            if (!activeProfile) {
                throw new Error('Could not find active profile');
            }
            return activeProfile;
        },
        async createProfileActivation(profileActivation) {
            const createdActivation = await one(shared_3.IdReturnType, profiles_queries_1.createProfileActivation, profileActivation);
            return one(shared_2.ProfileActivation, profiles_queries_1.getProfileActivationById, { id: createdActivation.id });
        },
        async getLatestProfileActivation() {
            return one(shared_2.ProfileActivation, profiles_queries_1.getLatestProfileActivation);
        },
        async getProfileActivationsByTimestamp(timeRange) {
            return many(shared_2.ProfileActivation, profiles_queries_1.getProfileActivationsByTimestamp, timeRange);
        },
        async deactivateAlarm(alarmId, currentTimestamp) {
            return one(shared_3.IdReturnType, alarms_queries_1.deactivateAlarm, { id: alarmId, currentTimestamp });
        },
        async createAlarmState(alarmId, validAfter, ackedBy, alarmLevel, notificationTarget, notificationReceipt, notificationProcessedAt) {
            return one(shared_1.AlarmState, alarms_queries_1.createAlarmState, {
                alarmLevel: alarmLevel || shared_5.ALARM_START_LEVEL,
                alarmId,
                validAfter,
                ackedBy,
                notificationTarget,
                notificationReceipt,
                notificationProcessedAt,
            });
        },
        async createAlarmWithState(situation) {
            const createdAlarm = await one(shared_3.IdReturnType, alarms_queries_1.createAlarm, { situation });
            await one(shared_1.AlarmState, alarms_queries_1.createAlarmState, {
                alarmId: createdAlarm.id,
                alarmLevel: shared_5.ALARM_START_LEVEL,
            });
            return one(shared_1.Alarm, alarms_queries_1.getAlarms, { alarmId: createdAlarm.id });
        },
        async markAlarmAsProcessed(alarmState) {
            return one(shared_1.AlarmState, alarms_queries_1.markAlarmAsProcessed, alarmState);
        },
        async markAllAlarmStatesAsProcessed(alarmId) {
            return many(shared_1.AlarmState, alarms_queries_1.markAllAlarmStatesAsProcessed, { alarmId });
        },
        // TODO: this is only for alarm start time, should include any states inside time range
        async getAlarms(timeRange) {
            return many(shared_1.Alarm, alarms_queries_1.getAlarms, timeRange);
        },
        async getActiveAlarm() {
            return oneOrNone(shared_1.Alarm, alarms_queries_1.getAlarms, { onlyActive: true });
        },
        async getAlarmStateByAlarmId(alarmId) {
            return one(shared_1.AlarmState, alarms_queries_1.getAlarmStateByAlarmId, { alarmId });
        },
    };
};
exports.queries = queries;
//# sourceMappingURL=queries.js.map