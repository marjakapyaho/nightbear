import { Profile, ProfileActivation } from 'shared/types/profiles';
import { Context } from 'backend/utils/api';

export const createProfileWithActivation = async (
  profile: Profile,
  activation: ProfileActivation,
  context: Context,
) => {
  await context.db.createProfile(profile);
  return await context.db.createProfileActivation(activation);
};
