import { ScrollNumberSelector } from '../../components/scrollNumberSelector/ScrollNumberSelector'
import { StatusBar } from '../../components/statusBar/StatusBar'
import { useMemo, useState } from 'react'
import {
  findLatestPointWithBloodGlucose,
  getBgGraphBaseConfig,
  getNewSelectedPointWithCarbs,
  getNewSelectedPointWithInsulin,
  getNewSelectedPointWithMeterEntry,
} from './bgGraphUtils'
import styles from './BgGraph.module.scss'
import { Point } from '../../components/scrollableGraph/scrollableGraphUtils'
import { ScrollableGraph } from '../../components/scrollableGraph/ScrollableGraph'
import { useTimelineEntries } from '../../data/timelineEntries/useTimelineEntries'
import { getTimeAsISOStr, mapTimelineEntriesToGraphPoints } from '@nightbear/shared'
import { last } from 'lodash'

export const BgGraph = () => {
  const baseConfig = getBgGraphBaseConfig()

  const now = Date.now()
  const currentTimestamp = getTimeAsISOStr(now)
  const startTimestamp = getTimeAsISOStr(now - baseConfig.timelineRange)

  const { timelineEntries, saveGraphPointData, isLoading, isError, isSuccess } =
    useTimelineEntries(startTimestamp)

  const graphPoints = useMemo(
    () =>
      timelineEntries
        ? mapTimelineEntriesToGraphPoints(
            timelineEntries,
            baseConfig.timelineRange,
            currentTimestamp,
          )
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timelineEntries],
  )

  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null)
  const latestPoint = last(graphPoints)
  const latestPointWithBg = findLatestPointWithBloodGlucose(graphPoints)

  const onChangeCarbs = (newAmount: number) => {
    const hasValueChanged = newAmount !== selectedPoint?.carbEntry?.amount
    const basePoint = selectedPoint || latestPoint
    const pointToSave = hasValueChanged
      ? getNewSelectedPointWithCarbs(newAmount, basePoint)
      : basePoint
        ? { ...basePoint, carbEntry: undefined }
        : null
    setSelectedPoint(pointToSave)
    pointToSave && saveGraphPointData(pointToSave)
  }

  const onChangeMeterEntry = (newBg: number) => {
    const hasValueChanged = newBg !== selectedPoint?.meterEntry?.bloodGlucose
    const basePoint = selectedPoint || latestPoint
    const pointToSave = hasValueChanged
      ? getNewSelectedPointWithMeterEntry(newBg, basePoint)
      : basePoint
        ? { ...basePoint, meterEntry: undefined }
        : null
    setSelectedPoint(pointToSave)
    pointToSave && saveGraphPointData(pointToSave)
  }

  const onChangeInsulin = (newAmount: number) => {
    const hasValueChanged = newAmount !== selectedPoint?.insulinEntry?.amount
    const basePoint = selectedPoint || latestPoint
    const pointToSave = hasValueChanged
      ? getNewSelectedPointWithInsulin(newAmount, basePoint)
      : basePoint
        ? { ...basePoint, insulinEntry: undefined }
        : null
    setSelectedPoint(pointToSave)
    pointToSave && saveGraphPointData(pointToSave)
  }

  return (
    <div className={styles.bgGraph}>
      <StatusBar graphPoint={latestPointWithBg} />

      <div style={{ height: baseConfig.outerHeight }}>
        {isSuccess && (
          <ScrollableGraph
            graphPoints={graphPoints}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            baseConfig={baseConfig}
            latestPointWithBg={latestPointWithBg}
          />
        )}
        {isLoading && <div className={styles.loading}>Loading...</div>}
        {isError && <div className={styles.error}>Error</div>}
      </div>

      <div className={styles.graphBottom}>
        <ScrollNumberSelector
          value={selectedPoint?.carbEntry?.amount}
          onChange={onChangeCarbs}
          min={5}
          max={100}
          step={5}
          centerOn={40}
          color="#9ad5b3"
        />
        <ScrollNumberSelector
          value={selectedPoint?.meterEntry?.bloodGlucose}
          onChange={onChangeMeterEntry}
          min={1}
          max={20}
          step={0.5}
          centerOn={8}
          decimals={1}
          color="#F8CC6F"
        />
        <ScrollNumberSelector
          value={selectedPoint?.insulinEntry?.amount}
          onChange={onChangeInsulin}
          min={1}
          max={20}
          step={1}
          centerOn={5}
          color="#ee776e"
        />
      </div>
    </div>
  )
}
