import { Profile } from 'shared/types/profiles';

export const getActiveProfile = (profiles?: Profile[]) => {
  return profiles?.find(profile => profile.isActive);
};
