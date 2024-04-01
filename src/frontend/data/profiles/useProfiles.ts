import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/utils/fetch';
import { Profile } from 'shared/types/profiles';
import { mockProfiles } from 'shared/mocks/profiles';

export const useProfiles = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isSuccess } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: () => callFetch('/profiles'),
  });

  const { mutate: activateProfile } = useMutation({
    mutationFn: (profile: Profile) => callFetch('/profiles', 'PUT', profile),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  // TODO: use these
  console.log(data);
  console.log(isLoading);
  console.log(isError);
  console.log(isSuccess);

  return {
    profiles: mockProfiles,
    activateProfile,
    isLoading: false,
    isError: false,
    isSuccess: true,
  };
};
