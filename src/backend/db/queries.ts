import {
  createCarbEntries,
  getCarbEntriesByTimestamp,
  upsertCarbEntry,
} from 'backend/db/carbEntries/carbEntries.queries';
import {
  createInsulinEntries,
  getInsulinEntriesByTimestamp,
  upsertInsulinEntry,
} from 'backend/db/insulinEntries/insulinEntries.queries';
import {
  createMeterEntries,
  getMeterEntriesByTimestamp,
  upsertMeterEntry,
} from 'backend/db/meterEntries/meterEntries.queries';
import {
  createSensorEntries,
  createSensorEntry,
  getLatestSensorEntry,
  getSensorEntriesByTimestamp,
} from 'backend/db/sensorEntries/sensorEntries.queries';
import { GenParams, bindQueryShorthands } from 'backend/utils/db';
import { Pool } from 'pg';
import { Alarm, AlarmState } from 'shared/types/alarms';
import { Situation } from 'shared/types/analyser';
import { Profile, ProfileActivation } from 'shared/types/profiles';
import { IdReturnType } from 'shared/types/shared';
import { CarbEntry, InsulinEntry, MeterEntry, SensorEntry } from 'shared/types/timelineEntries';
import { ALARM_START_LEVEL } from 'shared/utils/alarms';
import {
  createAlarm,
  createAlarmState,
  deactivateAlarm,
  getAlarmStateByAlarmId,
  getAlarms,
  markAlarmAsProcessed,
  markAllAlarmStatesAsProcessed,
} from './alarms/alarms.queries';
import {
  createAnalyserSettings,
  createProfileActivation,
  createProfileTemplate,
  createSituationSettings,
  getProfileActivationById,
  getProfiles,
  getRelevantProfileActivations,
  reactivateProfileActivation,
} from './profiles/profiles.queries';

export const queries = (pool: Pool) => {
  const { one, many, oneOrNone } = bindQueryShorthands(pool);

  return {
    async createSensorEntry(sensorEntry: Omit<SensorEntry, 'timestamp'>) {
      return one(SensorEntry, createSensorEntry, sensorEntry);
    },

    async createSensorEntries(sensorEntries: SensorEntry[]) {
      return many(SensorEntry, createSensorEntries, { sensorEntries });
    },

    async getLatestSensorEntry() {
      return one(SensorEntry, getLatestSensorEntry);
    },

    async getSensorEntriesByTimestamp(timeRange: GenParams<typeof getSensorEntriesByTimestamp>) {
      return many(SensorEntry, getSensorEntriesByTimestamp, timeRange);
    },

    async upsertInsulinEntry(insulinEntry: InsulinEntry) {
      return one(InsulinEntry, upsertInsulinEntry, insulinEntry);
    },

    async createInsulinEntries(insulinEntries: InsulinEntry[]) {
      return many(InsulinEntry, createInsulinEntries, { insulinEntries });
    },

    async getInsulinEntriesByTimestamp(timeRange: GenParams<typeof getInsulinEntriesByTimestamp>) {
      return many(InsulinEntry, getInsulinEntriesByTimestamp, timeRange);
    },

    async upsertCarbEntry(carbEntry: CarbEntry) {
      return one(CarbEntry, upsertCarbEntry, carbEntry);
    },

    async createCarbEntries(carbEntries: CarbEntry[]) {
      return many(CarbEntry, createCarbEntries, { carbEntries });
    },

    async getCarbEntriesByTimestamp(timeRange: GenParams<typeof getCarbEntriesByTimestamp>) {
      return many(CarbEntry, getCarbEntriesByTimestamp, timeRange);
    },

    async upsertMeterEntry(meterEntry: MeterEntry) {
      return one(MeterEntry, upsertMeterEntry, meterEntry);
    },

    async createMeterEntries(meterEntries: MeterEntry[]) {
      return many(MeterEntry, createMeterEntries, { meterEntries });
    },

    async getMeterEntriesByTimestamp(timeRange: GenParams<typeof getMeterEntriesByTimestamp>) {
      return many(MeterEntry, getMeterEntriesByTimestamp, timeRange);
    },

    async createProfile(profile: Profile) {
      const analyserSettings = await one(
        IdReturnType,
        createAnalyserSettings,
        profile.analyserSettings,
      );

      const situationSettings = await one(
        IdReturnType,
        createSituationSettings,
        profile.situationSettings,
      );

      return one(IdReturnType, createProfileTemplate, {
        profileName: profile.profileName,
        alarmsEnabled: profile.alarmsEnabled,
        notificationTargets: profile.notificationTargets,
        analyserSettingsId: analyserSettings.id,
        situationSettingsId: situationSettings.id,
      });
    },

    async createProfileActivation(profileActivation: Omit<ProfileActivation, 'id'>) {
      const createdActivation = await one(IdReturnType, createProfileActivation, profileActivation);
      return one(ProfileActivation, getProfileActivationById, { id: createdActivation.id });
    },

    async getProfiles() {
      return many(Profile, getProfiles);
    },

    async getProfileById(templateId: string) {
      return one(Profile, getProfiles, { templateId });
    },

    async getActiveProfile() {
      const [activeProfile] = await many(Profile, getProfiles, { onlyActive: true });
      return activeProfile;
    },

    async getRelevantProfileActivations() {
      return many(ProfileActivation, getRelevantProfileActivations);
    },

    async reactivateProfileActivation(profileActivationId: string) {
      return one(IdReturnType, reactivateProfileActivation, { id: profileActivationId });
    },

    async deactivateAlarm(alarmId: string, currentTimestamp: string) {
      return one(IdReturnType, deactivateAlarm, { id: alarmId, currentTimestamp });
    },

    async createAlarmState(
      alarmId: string,
      validAfter?: string,
      alarmLevel?: number,
      notificationTarget?: string,
      notificationReceipt?: string,
      notificationProcessedAt?: string,
    ) {
      return one(AlarmState, createAlarmState, {
        alarmLevel: alarmLevel || ALARM_START_LEVEL,
        alarmId,
        validAfter,
        notificationTarget,
        notificationReceipt,
        notificationProcessedAt,
      });
    },

    async createAlarmWithState(situation: Situation) {
      const createdAlarm = await one(IdReturnType, createAlarm, { situation });
      await one(AlarmState, createAlarmState, {
        alarmId: createdAlarm.id,
        alarmLevel: ALARM_START_LEVEL,
      });
      return one(Alarm, getAlarms, { alarmId: createdAlarm.id });
    },

    async markAlarmAsProcessed(alarmState: AlarmState) {
      return one(AlarmState, markAlarmAsProcessed, alarmState);
    },

    async markAllAlarmStatesAsProcessed(alarmId: string) {
      return many(AlarmState, markAllAlarmStatesAsProcessed, { alarmId });
    },

    async getAlarms(timeRange: GenParams<typeof getAlarms>) {
      return many(Alarm, getAlarms, timeRange);
    },

    async getActiveAlarm() {
      return oneOrNone(Alarm, getAlarms, { onlyActive: true });
    },

    async getAlarmStateByAlarmId(alarmId: string) {
      return one(AlarmState, getAlarmStateByAlarmId, { alarmId });
    },
  };
};
