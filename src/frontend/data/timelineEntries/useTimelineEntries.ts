import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetch } from 'frontend/data/fetch';
import { TimelineEntries } from 'shared/types/timelineEntries';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';
import { getTimeAsISOStr } from 'shared/utils/time';

export const useTimelineEntries = (
  startTimestamp: string,
  endTimestamp = getTimeAsISOStr(Date.now()),
) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isSuccess, refetch } = useQuery<TimelineEntries>({
    queryKey: ['get-timeline-entries'],
    queryFn: () => callFetch(`/get-timeline-entries?start=${startTimestamp}&end=${endTimestamp}`),
  });

  const { mutate: saveGraphPointData } = useMutation({
    mutationFn: (point: Point) => callFetch('/update-timeline-entries', 'PUT', point),
    onSuccess: refetch,
  });

  return {
    timelineEntries: {
      bloodGlucoseEntries: data ? data.bloodGlucoseEntries : [],
      insulinEntries: data ? data.insulinEntries : [],
      carbEntries: data ? data.carbEntries : [],
      meterEntries: data ? data.meterEntries : [],
    },
    saveGraphPointData,
    isLoading,
    isError,
    isSuccess,
  };
};
