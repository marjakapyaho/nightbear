import { Point, SEC_IN_MS, getTimeAsISOStr } from '@nightbear/shared'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { callFetch } from '../fetch'

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
    isRefetching,
    refetch,
  } = useQuery<Point[]>({
    queryKey: ['get-timeline-entries'],
    queryFn: () => callFetch(`/get-timeline-entries?start=${startTimestamp}&end=${endTimestamp}`),
    refetchInterval: 30 * SEC_IN_MS,
  })

  const [lastLoaded, setLastLoaded] = useState(0)
  const [lastRefetched, setLastRefetched] = useState(0)

  useEffect(() => {
    if (!isLoading) setLastLoaded(Date.now())
  }, [isLoading])
  useEffect(() => {
    if (!isRefetching) setLastRefetched(Date.now())
  }, [isRefetching])

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
    lastLoaded,
    lastRefetched,
  }
}
