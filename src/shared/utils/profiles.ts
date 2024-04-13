import { Profile } from 'shared/types/profiles';

export const getActiveProfile = (profiles: Profile[]) => {
  const activeProfile = profiles.find(profile => profile.isActive);
  if (!activeProfile) throw new Error(`Couldn't find active profile from all profiles`);
  return activeProfile;
};
