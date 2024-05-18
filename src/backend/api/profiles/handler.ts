import { Context, createResponse, Request } from 'backend/utils/api';
import { Profile } from 'shared/types/profiles';
import { mockProfiles } from 'shared/mocks/profiles';
import { getTimePlusTime } from 'shared/utils/time';
import { HOUR_IN_MS } from 'shared/utils/calculations';

export const getProfiles = async (_request: Request, context: Context) => {
  const profiles = await context.db.getProfiles();
  return createResponse(profiles);
};

export const activateProfile = async (request: Request, context: Context) => {
  // TODO: better casting
  const body = request.requestBody as object;
  const profile = 'profile' in body ? (body.profile as Profile) : null;
  const validityInMs = 'validityInMs' in body ? (body.validityInMs as number) : 0;

  // TODO: error handling
  if (!profile) {
    return createResponse('Error');
  }

  const profileActivation = await context.db.createProfileActivation({
    profileTemplateId: profile.id,
    activatedAt: context.timestamp(),
    deactivatedAt: getTimePlusTime(context.timestamp(), validityInMs),
  });

  return createResponse(profileActivation.id);
};

export const createProfile = async (request: Request, context: Context) => {
  // TODO: better casting
  const body = request.requestBody as object;
  const profile = 'profile' in body ? (body.profile as Profile) : null;
  const validityInMs = 'validityInMs' in body ? (body.validityInMs as number) : 0;

  // TODO: error handling
  if (!profile) {
    return createResponse('Error');
  }

  const createdProfile = await context.db.createProfile(profile);
  await context.db.createProfileActivation({
    profileTemplateId: createdProfile.id,
    activatedAt: context.timestamp(),
    deactivatedAt: getTimePlusTime(context.timestamp(), validityInMs),
  });

  return createResponse(createdProfile.id);
};

export const editProfile = async (request: Request, context: Context) => {
  // TODO: better casting
  const profile = request.requestBody as Profile;

  // TODO: error handling
  if (!profile?.id) {
    return createResponse('Error');
  }

  const editedProfile = await context.db.editProfile(profile, profile.id);

  return createResponse(editedProfile.id);
};
