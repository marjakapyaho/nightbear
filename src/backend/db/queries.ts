import {
  createSensorEntries,
  createSensorEntry,
  getLatestSensorEntry,
  getSensorEntriesByTimestamp,
} from 'backend/db/sensorEntries/sensorEntries.queries';
import { GenParams, bindQueryShorthands } from 'backend/utils/db';
import { Pool } from 'pg';
import { CarbEntry, InsulinEntry, MeterEntry, SensorEntry } from 'shared/types/timelineEntries';
import {
  createInsulinEntries,
  getInsulinEntriesByTimestamp,
  upsertInsulinEntry,
} from 'backend/db/insulinEntries/insulinEntries.queries';
import {
  createCarbEntries,
  getCarbEntriesByTimestamp,
  upsertCarbEntry,
} from 'backend/db/carbEntries/carbEntries.queries';
import {
  createMeterEntries,
  getMeterEntriesByTimestamp,
  upsertMeterEntry,
} from 'backend/db/meterEntries/meterEntries.queries';
import {
  AnalyserSettings,
  Profile,
  ProfileActivation,
  SituationSettings,
} from 'shared/types/profiles';
import {
  createAnalyserSettings,
  createProfileActivation,
  createProfileTemplate,
  createSituationSettings,
  getProfiles,
  getRelevantProfileActivations,
  reactivateProfileActivation,
} from './profiles/profiles.queries';
import { z } from 'zod';

export const queries = (pool: Pool) => {
  const { one, many } = bindQueryShorthands(pool);

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
        AnalyserSettings,
        createAnalyserSettings,
        profile.analyserSettings,
      );

      const situationSettings = await one(
        SituationSettings,
        createSituationSettings,
        profile.situationSettings,
      );

      return one(z.object({ id: z.string() }), createProfileTemplate, {
        profileName: profile.profileName,
        alarmsEnabled: profile.alarmsEnabled,
        notificationTargets: profile.notificationTargets,
        analyserSettingsId: analyserSettings.id,
        situationSettingsId: situationSettings.id,
      });
    },

    async createProfileActivation(profileActivation: Omit<ProfileActivation, 'id'>) {
      return one(ProfileActivation, createProfileActivation, profileActivation);
    },

    async getProfiles() {
      return many(Profile, getProfiles);
    },

    async getActiveProfile() {
      const [activeProfile] = await many(Profile, getProfiles, { onlyActive: true });
      return activeProfile;
    },

    async getRelevantProfileActivations() {
      return many(ProfileActivation, getRelevantProfileActivations);
    },

    async reactivateProfileActivation(profileActivationId: string) {
      return one(ProfileActivation, reactivateProfileActivation, profileActivationId);
    },
  };
};
