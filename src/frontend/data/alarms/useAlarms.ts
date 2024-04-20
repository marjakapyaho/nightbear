import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/data/fetch';
import { Alarm } from 'shared/types/alarms';
import { mockAlarms } from 'shared/mocks/alarms';

export const useAlarms = () => {
  const queryClient = useQueryClient();

  const {
    data: alarms,
    isLoading,
    isError,
    isSuccess,
  } = useQuery<Alarm[]>({
    queryKey: ['get-alarms'],
    queryFn: () => callFetch('/get-alarms'),
  });

  const { mutate: ackAlarm } = useMutation({
    mutationFn: (alarm: Alarm) => callFetch('/ack-alarm', 'PUT', alarm),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['get-alarms'] });
    },
  });

  return {
    alarms: alarms || [],
    ackAlarm,
    isLoading,
    isError,
    isSuccess,
  };
};
