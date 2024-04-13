import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/data/fetch';
import { TimelineEntries } from 'shared/types/timelineEntries';
import { mockTimelineEntries } from 'shared/mocks/timelineEntries';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';

export const useTimelineEntries = (startMs: number, endMs = Date.now()) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isSuccess } = useQuery<TimelineEntries>({
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

  // TODO: use these
  console.log(startMs);
  console.log(endMs);
  console.log(data);
  console.log(isLoading);
  console.log(isError);
  console.log(isSuccess);

  return {
    timelineEntries: mockTimelineEntries,
    saveGraphPointData,
    isLoading: false,
    isError: false,
    isSuccess: true,
  };
};
