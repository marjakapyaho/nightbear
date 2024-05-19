import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/data/fetch';
import { Alarm } from 'shared/types/alarms';
import { getUserKeyFromUrlParams } from './utils';
import { MIN_IN_MS } from 'shared/utils/calculations';

export const useAlarms = () => {
  const queryClient = useQueryClient();

  const {
    data: activeAlarm,
    isLoading,
    isError,
    isSuccess,
  } = useQuery<Alarm>({
    queryKey: ['get-active-alarm'],
    queryFn: () => callFetch('/get-active-alarm'),
    refetchInterval: MIN_IN_MS,
  });

  const { mutate: ackActiveAlarm } = useMutation({
    mutationFn: () => callFetch(`/ack-active-alarm?ackedBy=${getUserKeyFromUrlParams()}`, 'PUT'),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['get-active-alarm'] });
    },
  });

  return {
    activeAlarm,
    ackActiveAlarm,
    isLoading,
    isError,
    isSuccess,
  };
};
