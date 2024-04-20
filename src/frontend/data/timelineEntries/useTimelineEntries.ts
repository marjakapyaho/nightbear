import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/data/fetch';
import { TimelineEntries } from 'shared/types/timelineEntries';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';

export const useTimelineEntries = (startMs: number, endMs = Date.now()) => {
  const queryClient = useQueryClient();

  const {
    data: timelineEntries,
    isLoading,
    isError,
    isSuccess,
  } = useQuery<TimelineEntries>({
    queryKey: ['get-timelineEntries'],
    queryFn: () => callFetch(`/get-timelineEntries?start=${startMs}&end=${endMs}`),
  });

  const { mutate: saveGraphPointData } = useMutation({
    mutationFn: (point: Point) => callFetch('/update-timelineEntries', 'PUT', point),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['update-timelineEntries'] });
    },
  });

  return {
    timelineEntries,
    saveGraphPointData,
    isLoading,
    isError,
    isSuccess,
  };
};
