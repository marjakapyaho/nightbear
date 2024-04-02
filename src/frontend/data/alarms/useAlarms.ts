import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/data/fetch';
import { Alarm } from 'shared/types/alarms';
import { mockAlarms } from 'shared/mocks/alarms';

export const useAlarms = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isSuccess } = useQuery<Alarm[]>({
    queryKey: ['alarms'],
    queryFn: () => callFetch('/alarms'),
  });

  const { mutate: ackAlarm } = useMutation({
    mutationFn: (alarm: Alarm) => callFetch('/alarms', 'PUT', alarm),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
    },
  });

  // TODO: use these
  console.log(data);
  console.log(isLoading);
  console.log(isError);
  console.log(isSuccess);

  return {
    alarms: mockAlarms,
    ackAlarm,
    isLoading: false,
    isError: false,
    isSuccess: true,
  };
};
