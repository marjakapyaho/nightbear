import { Context, createResponse, Request } from 'backend/utils/api';
import { Profile } from 'shared/types/profiles';

export const getProfiles = async (_request: Request, context: Context) => {
  const profiles = await context.db.getProfiles();
  return createResponse(profiles);
};

export const activateProfile = async (request: Request, context: Context) => {
  const profile = request.requestBody as Profile;

  if (!profile?.id) {
    // TODO: error
    return createResponse('Error');
  }

  const profileActivation = await context.db.createProfileActivation({
    profileTemplateId: profile.id,
    activatedAt: context.timestamp(),
  });

  return createResponse(profileActivation.id);
};

export const createProfile = async (request: Request, context: Context) => {
  // TODO: better casting
  const profile = request.requestBody as Profile;

  const createdProfile = await context.db.createProfile(profile);

  return createResponse(createdProfile.id);
};
