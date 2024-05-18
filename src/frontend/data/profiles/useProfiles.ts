import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/data/fetch';
import { Profile } from 'shared/types/profiles';
import { getActiveProfile } from 'shared/utils/profiles';

export const useProfiles = () => {
  const {
    data: profiles,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery<Profile[]>({
    queryKey: ['get-profiles'],
    queryFn: () => callFetch('/get-profiles'),
  });

  const { mutate: activateProfileMutation } = useMutation({
    mutationFn: (payload: { profile: Profile; validityInMs: number }) =>
      callFetch('/activate-profile', 'POST', payload),
  });
  const activateProfile = (profile: Profile, validityInMs: number) =>
    activateProfileMutation(
      { profile, validityInMs },
      {
        onSuccess: refetch,
      },
    );

  const { mutate: createProfileMutation } = useMutation({
    mutationFn: (payload: { profile: Profile; validityInMs: number }) =>
      callFetch('/create-profile', 'POST', payload),
  });
  const createProfile = (profile: Profile, validityInMs: number) =>
    createProfileMutation(
      { profile, validityInMs },
      {
        onSuccess: refetch,
      },
    );

  const { mutate: editProfileMutation } = useMutation({
    mutationFn: (profile: Profile) => callFetch('/edit-profile', 'PUT', profile),
  });
  const editProfile = (profile: Profile) =>
    editProfileMutation(profile, {
      onSuccess: refetch,
    });

  return {
    profiles: profiles || [],
    activeProfile: getActiveProfile(profiles),
    activateProfile,
    createProfile,
    editProfile,
    isLoading,
    isError,
    isSuccess,
  };
};
