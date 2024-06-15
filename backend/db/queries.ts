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
import { GenParams, bindQueryShorthands } from '../utils/db'
import {
  createAlarm,
  createAlarmState,
  deactivateAlarm,
  getAlarmStateByAlarmId,
  getAlarms,
  markAlarmAsProcessed,
  markAllAlarmStatesAsProcessed,
} from './alarms/alarms.queries'
import {
  createCarbEntries,
  deleteCarbEntry,
  getCarbEntriesByTimestamp,
  upsertCarbEntry,
} from './carbEntries/carbEntries.queries'
import {
  loadCronjobsJournal,
  updateCronjobsJournal,
} from './cronjobsJournal/cronjobsJournal.queries'
import {
  createInsulinEntries,
  deleteInsulinEntry,
  getInsulinEntriesByTimestamp,
  upsertInsulinEntry,
} from './insulinEntries/insulinEntries.queries'
import {
  createMeterEntries,
  deleteMeterEntry,
  getMeterEntriesByTimestamp,
  upsertMeterEntry,
} from './meterEntries/meterEntries.queries'
import {
  createProfileActivation,
  createProfileTemplate,
  editProfileTemplate,
  getLatestProfileActivation,
  getProfileActivationById,
  getProfileActivationsByTimestamp,
  getProfiles,
} from './profiles/profiles.queries'
import {
  createSensorEntries,
  createSensorEntry,
  getLatestSensorEntry,
  getSensorEntriesByTimestamp,
} from './sensorEntries/sensorEntries.queries'

export const queries = (pool: Pool) => {
  const { one, many, oneOrNone } = bindQueryShorthands(pool)

  return {
    async createSensorEntry(sensorEntry: Omit<SensorEntry, 'timestamp'>) {
      return one(SensorEntry, createSensorEntry, sensorEntry)
    },

    async createSensorEntries(sensorEntries: SensorEntry[]) {
      return many(SensorEntry, createSensorEntries, { sensorEntries })
    },

    async getLatestSensorEntry() {
      return one(SensorEntry, getLatestSensorEntry)
    },

    async getSensorEntriesByTimestamp(timeRange: GenParams<typeof getSensorEntriesByTimestamp>) {
      return many(SensorEntry, getSensorEntriesByTimestamp, timeRange)
    },

    async upsertInsulinEntry(insulinEntry: InsulinEntry) {
      return one(InsulinEntry, upsertInsulinEntry, insulinEntry)
    },

    async deleteInsulinEntry(timestamp: string) {
      return oneOrNone(TimestampReturnType, deleteInsulinEntry, { timestamp })
    },

    async createInsulinEntries(insulinEntries: InsulinEntry[]) {
      return many(InsulinEntry, createInsulinEntries, { insulinEntries })
    },

    async getInsulinEntriesByTimestamp(timeRange: GenParams<typeof getInsulinEntriesByTimestamp>) {
      return many(InsulinEntry, getInsulinEntriesByTimestamp, timeRange)
    },

    async upsertCarbEntry(carbEntry: CarbEntry) {
      return one(CarbEntry, upsertCarbEntry, carbEntry)
    },

    async deleteCarbEntry(timestamp: string) {
      return oneOrNone(TimestampReturnType, deleteCarbEntry, { timestamp })
    },

    async createCarbEntries(carbEntries: CarbEntry[]) {
      return many(CarbEntry, createCarbEntries, { carbEntries })
    },

    async getCarbEntriesByTimestamp(timeRange: GenParams<typeof getCarbEntriesByTimestamp>) {
      return many(CarbEntry, getCarbEntriesByTimestamp, timeRange)
    },

    async upsertMeterEntry(meterEntry: MeterEntry) {
      return one(MeterEntry, upsertMeterEntry, meterEntry)
    },

    async deleteMeterEntry(timestamp: string) {
      return oneOrNone(TimestampReturnType, deleteMeterEntry, { timestamp })
    },

    async createMeterEntries(meterEntries: MeterEntry[]) {
      return many(MeterEntry, createMeterEntries, { meterEntries })
    },

    async getMeterEntriesByTimestamp(timeRange: GenParams<typeof getMeterEntriesByTimestamp>) {
      return many(MeterEntry, getMeterEntriesByTimestamp, timeRange)
    },

    async createProfile(profile: Profile) {
      return one(IdReturnType, createProfileTemplate, {
        ...profile,
        ...profile.analyserSettings,
        ...profile.situationSettings,
      })
    },

    async editProfile(profile: Profile, id: string) {
      return one(IdReturnType, editProfileTemplate, {
        id,
        profileName: profile.profileName,
        alarmsEnabled: profile.alarmsEnabled,
        notificationTargets: profile.notificationTargets,
        ...profile.analyserSettings,
        ...profile.situationSettings,
      })
    },

    async getProfiles() {
      return many(Profile, getProfiles)
    },

    async getProfileById(templateId: string) {
      return one(Profile, getProfiles, { templateId })
    },

    async getActiveProfile() {
      const [activeProfile] = await many(Profile, getProfiles, { onlyActive: true })
      if (!activeProfile) {
        throw new Error('Could not find active profile')
      }
      return activeProfile
    },

    async createProfileActivation(profileActivation: Omit<ProfileActivation, 'id'>) {
      const createdActivation = await one(IdReturnType, createProfileActivation, profileActivation)
      return one(ProfileActivation, getProfileActivationById, { id: createdActivation.id })
    },

    async getLatestProfileActivation() {
      return one(ProfileActivation, getLatestProfileActivation)
    },

    async getProfileActivationsByTimestamp(
      timeRange: GenParams<typeof getProfileActivationsByTimestamp>,
    ) {
      return many(ProfileActivation, getProfileActivationsByTimestamp, timeRange)
    },

    async deactivateAlarm(alarmId: string, currentTimestamp: string) {
      return one(IdReturnType, deactivateAlarm, { id: alarmId, currentTimestamp })
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
      return one(AlarmState, createAlarmState, {
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
      const createdAlarm = await one(IdReturnType, createAlarm, { situation })
      await one(AlarmState, createAlarmState, {
        alarmId: createdAlarm.id,
        alarmLevel: ALARM_START_LEVEL,
      })
      return one(Alarm, getAlarms, { alarmId: createdAlarm.id })
    },

    async markAlarmAsProcessed(alarmState: AlarmState) {
      return one(AlarmState, markAlarmAsProcessed, alarmState)
    },

    async markAllAlarmStatesAsProcessed(alarmId: string) {
      return many(AlarmState, markAllAlarmStatesAsProcessed, { alarmId })
    },

    // TODO: this is only for alarm start time, should include any states inside time range
    async getAlarms(timeRange: GenParams<typeof getAlarms>) {
      return many(Alarm, getAlarms, timeRange)
    },

    async getActiveAlarm() {
      return oneOrNone(Alarm, getAlarms, { onlyActive: true })
    },

    async getAlarmStateByAlarmId(alarmId: string) {
      return one(AlarmState, getAlarmStateByAlarmId, { alarmId })
    },

    async updateCronjobsJournal(journal: CronjobsJournal) {
      return one(CronjobsJournal, updateCronjobsJournal, journal)
    },

    async loadCronjobsJournal() {
      return one(CronjobsJournal, loadCronjobsJournal)
    },
  }
}
