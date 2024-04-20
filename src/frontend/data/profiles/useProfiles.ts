import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/data/fetch';
import { Profile } from 'shared/types/profiles';
import { mockProfiles } from 'shared/mocks/profiles';
import { getActiveProfile } from 'shared/utils/profiles';

export const useProfiles = () => {
  const queryClient = useQueryClient();

  const {
    data: profiles,
    isLoading,
    isError,
    isSuccess,
  } = useQuery<Profile[]>({
    queryKey: ['get-profiles'],
    queryFn: () => callFetch('/get-profiles'),
  });

  const { mutate: activateProfile } = useMutation({
    mutationFn: (profile: Profile) => callFetch('/create-profile', 'PUT', profile),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['get-profiles', 'get-active-profile'] });
    },
  });

  return {
    profiles: profiles || [],
    activeProfile: getActiveProfile(mockProfiles),
    activateProfile,
    isLoading,
    isError,
    isSuccess,
  };
};
