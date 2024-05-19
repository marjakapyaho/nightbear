import { useMutation, useQuery } from '@tanstack/react-query';
import { callFetch } from 'frontend/data/fetch';
import { TimelineEntries } from 'shared/types/timelineEntries';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';
import { getTimeAsISOStr } from 'shared/utils/time';
import { SEC_IN_MS } from 'shared/utils/calculations';

export const useTimelineEntries = (
  startTimestamp: string,
  endTimestamp = getTimeAsISOStr(Date.now()),
) => {
  const { data, isLoading, isError, isSuccess, refetch } = useQuery<TimelineEntries>({
    queryKey: ['get-timeline-entries'],
    queryFn: () => callFetch(`/get-timeline-entries?start=${startTimestamp}&end=${endTimestamp}`),
    refetchInterval: 15 * SEC_IN_MS,
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
      profileActivations: data ? data.profileActivations : [],
      alarms: data ? data.alarms : [],
    },
    saveGraphPointData,
    isLoading,
    isError,
    isSuccess,
  };
};
