import { Profile, ProfileActivation } from 'shared/types/profiles';
import { Context } from 'backend/utils/api';

export const createProfileWithActivation = async (
  profile: Profile,
  activation: ProfileActivation,
  context: Context,
) => {
  const [analyserSettings] = await context.db.profiles.createAnalyserSettings(
    profile.analyserSettings,
  );

  const [profileTemplate] = await context.db.profiles.createProfileTemplate({
    profileName: profile.profileName,
    alarmsEnabled: profile.alarmsEnabled,
    notificationTargets: profile.notificationTargets,
    analyserSettingsId: analyserSettings.id,
  });

  await Promise.all(
    profile.situationSettings.map(settings =>
      context.db.profiles.createSituationSettings({
        ...settings,
        profileTemplateId: profileTemplate.id,
      }),
    ),
  );

  await context.db.profiles.createProfileActivation({
    profileTemplateId: profileTemplate.id,
    activatedAt: activation.activatedAt,
    deactivatedAt: activation.deactivatedAt,
    repeatTimeInLocalTimezone: activation.repeatTimeInLocalTimezone,
  });

  // TODO: CASTING
  const profilesAfterUpdate = (await context.db.profiles.getProfiles()) as Profile[];
  return profilesAfterUpdate.find(profile => profile.id === profileTemplate.id);
};
