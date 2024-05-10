import { z } from 'zod';
import { Situation } from './analyser';

/* eslint-disable @typescript-eslint/no-redeclare */

export const AnalyserSettings = z.object({
  id: z.string(),
  highLevelRel: z.number(),
  highLevelAbs: z.number(),
  highLevelBad: z.number(),
  lowLevelRel: z.number(),
  lowLevelAbs: z.number(),
  timeSinceBgMinutes: z.number(),
});
export type AnalyserSettings = z.infer<typeof AnalyserSettings>;

export const SituationSettings = z.object({
  id: z.string(),
  outdatedEscalationAfterMinutes: z.array(z.number()),
  outdatedSnoozeMinutes: z.number(),
  criticalOutdatedEscalationAfterMinutes: z.array(z.number()),
  criticalOutdatedSnoozeMinutes: z.number(),
  fallingEscalationAfterMinutes: z.array(z.number()),
  fallingSnoozeMinutes: z.number(),
  risingEscalationAfterMinutes: z.array(z.number()),
  risingSnoozeMinutes: z.number(),
  lowEscalationAfterMinutes: z.array(z.number()),
  lowSnoozeMinutes: z.number(),
  badLowEscalationAfterMinutes: z.array(z.number()),
  badLowSnoozeMinutes: z.number(),
  highEscalationAfterMinutes: z.array(z.number()),
  highSnoozeMinutes: z.number(),
  badHighEscalationAfterMinutes: z.array(z.number()),
  badHighSnoozeMinutes: z.number(),
  persistentHighEscalationAfterMinutes: z.array(z.number()),
  persistentHighSnoozeMinutes: z.number(),
});
export type SituationSettings = z.infer<typeof SituationSettings>;

export const Profile = z.object({
  id: z.string(),
  profileName: z.string(),
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
