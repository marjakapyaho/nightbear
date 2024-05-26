import { useMutation, useQuery } from '@tanstack/react-query'
import { callFetch } from '../fetch'
import { TimelineEntries } from '@nightbear/shared'
import { Point } from '../../components/scrollableGraph/scrollableGraphUtils'
import { getTimeAsISOStr, SEC_IN_MS } from '@nightbear/shared'

export const useTimelineEntries = (
  startTimestamp: string,
  endTimestamp = getTimeAsISOStr(Date.now()),
) => {
  const { data, isLoading, isError, isSuccess, refetch } = useQuery<TimelineEntries>({
    queryKey: ['get-timeline-entries'],
    queryFn: () => callFetch(`/get-timeline-entries?start=${startTimestamp}&end=${endTimestamp}`),
    refetchInterval: 15 * SEC_IN_MS,
  })

  const { mutate: saveGraphPointData } = useMutation({
    mutationFn: (point: Point) => callFetch('/update-timeline-entries', 'PUT', point),
    onSuccess: refetch,
  })

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
  }
}
