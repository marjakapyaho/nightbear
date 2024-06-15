import { useMutation, useQuery } from '@tanstack/react-query'
import { callFetch } from '../fetch'
import { getTimeAsISOStr, SEC_IN_MS } from '@nightbear/shared'
import { Point } from '../../components/scrollableGraph/scrollableGraphUtils'
import { useEffect, useState } from 'react'

export const useTimelineEntries = (
  startTimestamp: string,
  endTimestamp = getTimeAsISOStr(Date.now()),
) => {
  const [graphPoints, setGraphPoints] = useState<Point[]>([])

  const {
    data: serverGraphPoints,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery<Point[]>({
    queryKey: ['get-timeline-entries'],
    queryFn: () => callFetch(`/get-timeline-entries?start=${startTimestamp}&end=${endTimestamp}`),
    refetchInterval: 30 * SEC_IN_MS,
  })

  const { mutate: updateTimelineEntries } = useMutation({
    mutationFn: (point: Point) => callFetch('/update-timeline-entries', 'PUT', point),
    onSuccess: refetch,
  })

  const saveGraphPointData = (point: Point) => {
    setGraphPoints(graphPoints.map((gp: Point) => (gp.timestamp === point.timestamp ? point : gp)))
    updateTimelineEntries(point)
  }

  useEffect(() => {
    if (serverGraphPoints) {
      setGraphPoints(serverGraphPoints)
    }
  }, [serverGraphPoints])

  return {
    graphPoints,
    saveGraphPointData,
    isLoading,
    isError,
    isSuccess,
  }
}
