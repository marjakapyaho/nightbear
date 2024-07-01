import {
  ALARM_START_LEVEL,
  Alarm,
  AlarmState,
  CarbEntry,
  IdReturnType,
  InsulinEntry,
  MeterEntry,
  Profile,
  ProfileActivation,
  SensorEntry,
  Situation,
  TimestampReturnType,
} from '@nightbear/shared'
import { Pool } from 'pg'
import { CronjobsJournal } from '../../shared/src/types/cronjobsJournal'
import { GenParams, bindQueryShorthands, patchQueryNames } from '../utils/db'
import { Logger } from '../utils/logging'
import * as alarmsQueries from './alarms/alarms.queries'
import * as carbEntriesQueries from './carbEntries/carbEntries.queries'
import * as cronjobsJournalQueries from './cronjobsJournal/cronjobsJournal.queries'
import * as insulinEntriesQueries from './insulinEntries/insulinEntries.queries'
import * as meterEntriesQueries from './meterEntries/meterEntries.queries'
import * as profilesQueries from './profiles/profiles.queries'
import * as sensorEntriesQueries from './sensorEntries/sensorEntries.queries'

export const queries = (pool: Pool, logger: Logger) => {
  const { one, many, oneOrNone } = bindQueryShorthands(pool, logger)

  patchQueryNames([
    alarmsQueries,
    carbEntriesQueries,
    cronjobsJournalQueries,
    insulinEntriesQueries,
    meterEntriesQueries,
    profilesQueries,
    sensorEntriesQueries,
  ])

  return {
    async createSensorEntry(sensorEntry: Omit<SensorEntry, 'timestamp'>) {
      return one(SensorEntry, sensorEntriesQueries.createSensorEntry, sensorEntry)
    },

    async createSensorEntries(sensorEntries: SensorEntry[]) {
      return many(SensorEntry, sensorEntriesQueries.createSensorEntries, { sensorEntries })
    },

    async getLatestSensorEntry() {
      return one(SensorEntry, sensorEntriesQueries.getLatestSensorEntry)
    },

    async getSensorEntriesByTimestamp(
      timeRange: GenParams<typeof sensorEntriesQueries.getSensorEntriesByTimestamp>,
    ) {
      return many(SensorEntry, sensorEntriesQueries.getSensorEntriesByTimestamp, timeRange)
    },

    async upsertInsulinEntry(insulinEntry: InsulinEntry) {
      return one(InsulinEntry, insulinEntriesQueries.upsertInsulinEntry, insulinEntry)
    },

    async deleteInsulinEntry(timestamp: string) {
      return oneOrNone(TimestampReturnType, insulinEntriesQueries.deleteInsulinEntry, { timestamp })
    },

    async createInsulinEntries(insulinEntries: InsulinEntry[]) {
      return many(InsulinEntry, insulinEntriesQueries.createInsulinEntries, { insulinEntries })
    },

    async getInsulinEntriesByTimestamp(
      timeRange: GenParams<typeof insulinEntriesQueries.getInsulinEntriesByTimestamp>,
    ) {
      return many(InsulinEntry, insulinEntriesQueries.getInsulinEntriesByTimestamp, timeRange)
    },

    async upsertCarbEntry(carbEntry: CarbEntry) {
      return one(CarbEntry, carbEntriesQueries.upsertCarbEntry, carbEntry)
    },

    async deleteCarbEntry(timestamp: string) {
      return oneOrNone(TimestampReturnType, carbEntriesQueries.deleteCarbEntry, { timestamp })
    },

    async createCarbEntries(carbEntries: CarbEntry[]) {
      return many(CarbEntry, carbEntriesQueries.createCarbEntries, { carbEntries })
    },

    async getCarbEntriesByTimestamp(
      timeRange: GenParams<typeof carbEntriesQueries.getCarbEntriesByTimestamp>,
    ) {
      return many(CarbEntry, carbEntriesQueries.getCarbEntriesByTimestamp, timeRange)
    },

    async upsertMeterEntry(meterEntry: MeterEntry) {
      return one(MeterEntry, meterEntriesQueries.upsertMeterEntry, meterEntry)
    },

    async deleteMeterEntry(timestamp: string) {
      return oneOrNone(TimestampReturnType, meterEntriesQueries.deleteMeterEntry, { timestamp })
    },

    async createMeterEntries(meterEntries: MeterEntry[]) {
      return many(MeterEntry, meterEntriesQueries.createMeterEntries, { meterEntries })
    },

    async getMeterEntriesByTimestamp(
      timeRange: GenParams<typeof meterEntriesQueries.getMeterEntriesByTimestamp>,
    ) {
      return many(MeterEntry, meterEntriesQueries.getMeterEntriesByTimestamp, timeRange)
    },

    async createProfile(profile: Profile) {
      return one(IdReturnType, profilesQueries.createProfileTemplate, {
        ...profile,
        ...profile.analyserSettings,
        ...profile.situationSettings,
      })
    },

    async editProfile(profile: Profile, id: string) {
      return one(IdReturnType, profilesQueries.editProfileTemplate, {
        id,
        profileName: profile.profileName,
        alarmsEnabled: profile.alarmsEnabled,
        notificationTargets: profile.notificationTargets,
        ...profile.analyserSettings,
        ...profile.situationSettings,
      })
    },

    async getProfiles() {
      return many(Profile, profilesQueries.getProfiles)
    },

    async getProfileById(templateId: string) {
      return one(Profile, profilesQueries.getProfiles, { templateId })
    },

    async getActiveProfile() {
      const [activeProfile] = await many(Profile, profilesQueries.getProfiles, { onlyActive: true })
      if (!activeProfile) {
        throw new Error('Could not find active profile')
      }
      return activeProfile
    },

    async createProfileActivation(profileActivation: Omit<ProfileActivation, 'id'>) {
      const createdActivation = await one(
        IdReturnType,
        profilesQueries.createProfileActivation,
        profileActivation,
      )
      return one(ProfileActivation, profilesQueries.getProfileActivationById, {
        id: createdActivation.id,
      })
    },

    async getLatestProfileActivation() {
      return one(ProfileActivation, profilesQueries.getLatestProfileActivation)
    },

    async getProfileActivationsByTimestamp(
      timeRange: GenParams<typeof profilesQueries.getProfileActivationsByTimestamp>,
    ) {
      return many(ProfileActivation, profilesQueries.getProfileActivationsByTimestamp, timeRange)
    },

    async deactivateAlarm(alarmId: string, currentTimestamp: string) {
      return one(IdReturnType, alarmsQueries.deactivateAlarm, { id: alarmId, currentTimestamp })
    },

    async createAlarmState(
      alarmId: string,
      validAfter?: string,
      ackedBy?: string,
      alarmLevel?: number,
      notificationTarget?: string,
      notificationReceipt?: string,
      notificationProcessedAt?: string,
    ) {
      return one(AlarmState, alarmsQueries.createAlarmState, {
        alarmLevel: alarmLevel || ALARM_START_LEVEL,
        alarmId,
        validAfter,
        ackedBy,
        notificationTarget,
        notificationReceipt,
        notificationProcessedAt,
      })
    },

    async createAlarmWithState(situation: Situation) {
      const createdAlarm = await one(IdReturnType, alarmsQueries.createAlarm, { situation })
      await one(AlarmState, alarmsQueries.createAlarmState, {
        alarmId: createdAlarm.id,
        alarmLevel: ALARM_START_LEVEL,
      })
      return one(Alarm, alarmsQueries.getAlarms, { alarmId: createdAlarm.id })
    },

    async markAlarmAsProcessed(alarmState: AlarmState) {
      return one(AlarmState, alarmsQueries.markAlarmAsProcessed, alarmState)
    },

    async markAllAlarmStatesAsProcessed(alarmId: string) {
      return many(AlarmState, alarmsQueries.markAllAlarmStatesAsProcessed, { alarmId })
    },

    // TODO: this is only for alarm start time, should include any states inside time range
    async getAlarms(timeRange: GenParams<typeof alarmsQueries.getAlarms>) {
      return many(Alarm, alarmsQueries.getAlarms, timeRange)
    },

    async getActiveAlarm() {
      return oneOrNone(Alarm, alarmsQueries.getAlarms, { onlyActive: true })
    },

    async getAlarmStateByAlarmId(alarmId: string) {
      return one(AlarmState, alarmsQueries.getAlarmStateByAlarmId, { alarmId })
    },

    async updateCronjobsJournal(journal: CronjobsJournal) {
      return one(CronjobsJournal, cronjobsJournalQueries.updateCronjobsJournal, journal)
    },

    async loadCronjobsJournal() {
      return one(CronjobsJournal, cronjobsJournalQueries.loadCronjobsJournal)
    },
  }
}
