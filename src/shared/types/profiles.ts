import { z } from 'zod';

/* eslint-disable @typescript-eslint/no-redeclare */

export const AnalyserSettings = z.object({
  highLevelRel: z.number(),
  highLevelAbs: z.number(),
  highLevelBad: z.number(),
  lowLevelRel: z.number(),
  lowLevelAbs: z.number(),
  timeSinceBgMinutes: z.number(),
});
export type AnalyserSettings = z.infer<typeof AnalyserSettings>;

export const AlarmSettings = z.object({
  escalationAfterMinutes: z.array(z.number()),
  snoozeMinutes: z.number(),
});
export type AlarmSettings = z.infer<typeof AlarmSettings>;

export const SituationSettings = z.object({
  outdated: AlarmSettings,
  criticalOutdated: AlarmSettings,
  falling: AlarmSettings,
  rising: AlarmSettings,
  low: AlarmSettings,
  badLow: AlarmSettings,
  compressionLow: AlarmSettings,
  high: AlarmSettings,
  badHigh: AlarmSettings,
  persistentHigh: AlarmSettings,
});
export type SituationSettings = z.infer<typeof SituationSettings>;

export const Profile = z.object({
  id: z.string(),
  profileName: z.optional(z.string()),
  isActive: z.boolean(),
  alarmsEnabled: z.boolean(),
  analyserSettings: AnalyserSettings,
  situationSettings: SituationSettings,
  notificationTargets: z.array(z.string()),
});
export type Profile = z.infer<typeof Profile>;

export const ProfileActivation = z.object({
  id: z.string(),
  profileTemplateId: z.string(),
  profileName: z.optional(z.string()),
  activatedAt: z.string(),
  repeatTimeInLocalTimezone: z.optional(z.string()),
  deactivatedAt: z.optional(z.string()),
});
export type ProfileActivation = z.infer<typeof ProfileActivation>;
