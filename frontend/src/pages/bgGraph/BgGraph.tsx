import { ScrollNumberSelector } from '../../components/scrollNumberSelector/ScrollNumberSelector'
import { StatusBar } from '../../components/statusBar/StatusBar'
import { useState } from 'react'
import {
  findLatestPointWithBloodGlucose,
  getBgGraphBaseConfig,
  getNewSelectedPointWithCarbs,
  getNewSelectedPointWithInsulin,
  getNewSelectedPointWithMeterEntry,
} from './bgGraphUtils'
import styles from './BgGraph.module.scss'
import { ScrollableGraph } from '../../components/scrollableGraph/ScrollableGraph'
import { useTimelineEntries } from '../../data/timelineEntries/useTimelineEntries'
import { Point, getTimeAsISOStr, calculateAverageBg } from '@nightbear/shared'
import { last } from 'lodash'
import { RiBearSmileFill } from 'react-icons/ri'
import { TfiFaceSad } from 'react-icons/tfi'

export const BgGraph = () => {
  const baseConfig = getBgGraphBaseConfig()

  const now = Date.now()
  const startTimestamp = getTimeAsISOStr(now - baseConfig.timelineRange)

  const {
    graphPoints,
    saveGraphPointData,
    isLoading,
    isError,
    isSuccess,
    lastLoaded,
    lastRefetched,
  } = useTimelineEntries(startTimestamp)

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
    const pointToSave =
      hasValueChanged && basePoint
        ? getNewSelectedPointWithMeterEntry(newBg, basePoint)
        : basePoint
          ? {
              ...basePoint,
              meterEntry: undefined,
              val: basePoint.sensorEntries ? calculateAverageBg(basePoint.sensorEntries) : null,
            }
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
      <StatusBar point={latestPointWithBg} lastLoaded={lastLoaded} lastRefetched={lastRefetched} />

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
        {isLoading && (
          <div className={styles.loading}>
            <RiBearSmileFill />
          </div>
        )}
        {isError && (
          <div className={styles.error}>
            <TfiFaceSad />
          </div>
        )}
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
