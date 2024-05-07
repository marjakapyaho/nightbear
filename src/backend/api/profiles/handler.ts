import { Context, createResponse, Request } from 'backend/utils/api';
import { Profile } from 'shared/types/profiles';

export const getProfiles = async (request: Request, context: Context) => {
  const profiles = await context.db.profiles.getProfiles();
  return createResponse(profiles);
};

export const activateProfile = async (request: Request, context: Context) => {
  const profile = request.requestBody as Profile;

  if (!profile?.id) {
    // TODO: error
    return createResponse('Error');
  }

  const [profileActivation] = await context.db.profiles.createProfileActivation({
    profileTemplateId: profile.id,
    activatedAt: context.timestamp(),
  });

  return createResponse(profileActivation.id);
};

export const createProfile = async (request: Request, context: Context) => {
  // TODO: better casting
  const profile = request.requestBody as Profile;

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

  return createResponse(profileTemplate.id);
};
