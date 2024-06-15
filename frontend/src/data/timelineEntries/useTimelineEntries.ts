import { useMutation, useQuery } from '@tanstack/react-query'
import { callFetch } from '../fetch'
import { TimelineEntries, getTimeAsISOStr, SEC_IN_MS } from '@nightbear/shared'
import { Point } from '../../components/scrollableGraph/scrollableGraphUtils'

export const useTimelineEntries = (
  startTimestamp: string,
  endTimestamp = getTimeAsISOStr(Date.now()),
) => {
  const {
    data: timelineEntries,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery<TimelineEntries>({
    queryKey: ['get-timeline-entries'],
    queryFn: () => callFetch(`/get-timeline-entries?start=${startTimestamp}&end=${endTimestamp}`),
    refetchInterval: 30 * SEC_IN_MS,
  })

  const { mutate: saveGraphPointData } = useMutation({
    mutationFn: (point: Point) => callFetch('/update-timeline-entries', 'PUT', point),
    onSuccess: refetch,
  })

  return {
    timelineEntries,
    saveGraphPointData,
    isLoading,
    isError,
    isSuccess,
  }
}
