import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/utils/fetch';
import { mockTimelineEntries, TimelineEntries } from 'shared/mocks/timelineEntries';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';

export const useTimelineEntries = (startMs: number, endMs = Date.now()) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isSuccess } = useQuery<TimelineEntries>({
    queryKey: ['timelineEntries'],
    queryFn: () => callFetch('/timelineEntries'),
  });
  const { mutate: saveGraphPointData } = useMutation({
    mutationFn: (point: Point) => callFetch('/timelineEntries', 'PUT', point),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['timelineEntries'] });
    },
  });

  console.log(data);

  return {
    timelineEntries: mockTimelineEntries,
    saveGraphPointData,
    isLoading: false,
    isError: false,
    isSuccess: true,
  };
};
