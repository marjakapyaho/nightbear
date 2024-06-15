import { useState } from 'react'
import { DAY_IN_MS, Point } from '@nightbear/shared'
import { ScrollableGraph } from '../../components/scrollableGraph/ScrollableGraph'
import styles from './Stats.module.scss'
import { BaseGraphConfig } from '../../components/scrollableGraph/scrollableGraphUtils'

type Props = {
  label: string
  points: Point[]
  daysToShow: number
  valMin: number
  valMax: number
  valStep: number
  decimals: number
}

export const StatGraph = ({
  label,
  points,
  daysToShow,
  valMin,
  valMax,
  valStep,
  decimals,
}: Props) => {
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null)

  const baseConfig: BaseGraphConfig = {
    timelineRange: daysToShow * DAY_IN_MS,
    timelineRangeEnd: Date.now(),
    paddingTop: 35,
    paddingBottom: 40,
    paddingLeft: 30,
    paddingRight: 35,
    outerHeight: 200,
    valMin,
    valMax,
    valStep,
    timeStep: DAY_IN_MS,
    dataTimeStep: DAY_IN_MS,
    pixelsPerTimeStep: 9,
    showTarget: false,
    showCurrentValue: true,
    timeFormat: 'dd',
    showEveryNthTimeLabel: 3,
    decimals,
  }

  return (
    <div className={styles.statGraph}>
      <div className={styles.graphHeading}>{label}</div>
      <ScrollableGraph
        graphPoints={points}
        selectedPoint={selectedPoint}
        setSelectedPoint={setSelectedPoint}
        baseConfig={baseConfig}
      />
    </div>
  )
}
