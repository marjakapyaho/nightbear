import { Point } from '@nightbear/shared'
import { TimeAgo } from '../timeAgo/TimeAgo'
import styles from './ScrollableGraph.module.scss'
import { GraphConfig, situationsMappedForUI, tsToLeft } from './scrollableGraphUtils'
import { AiFillSun, AiFillMoon, AiFillSetting } from 'react-icons/ai'

type Props = {
  config: GraphConfig
  point: Point
  isSelected: boolean
  setSelected: (marker: Point) => void
}

export const GraphMarker = ({ config, point, isSelected, setSelected }: Props) => {
  const hasData = point.carbEntry || point.insulinEntry

  return (
    <div
      className={styles.graphMarker}
      onClick={() => setSelected(point)}
      style={{
        left: tsToLeft(config, point.timestamp) - config.pixelsPerTimeStep / 2,
        width: config.pixelsPerTimeStep,
        zIndex: isSelected ? 10 : 9,
      }}
    >
      <div
        className={`${styles.verticalLine} ${hasData && styles.hasData}`}
        style={{
          left: config.pixelsPerTimeStep / 2,
          borderLeft: isSelected ? `1px solid #bbb` : undefined,
        }}
      />

      {(hasData || isSelected) && (
        <span className={`${styles.textLabel} ${isSelected && styles.selected}`}>
          <TimeAgo timestamp={point.timestamp} />
        </span>
      )}

      {point.insulinEntry && (
        <div className={styles.numberBubbleTop}>{point.insulinEntry.amount}</div>
      )}
      {point.carbEntry && <div className={styles.numberBubbleBottom}>{point.carbEntry.amount}</div>}

      {point.profileActivations?.length ? (
        <div className={styles.profileName}>
          {/* {point.profileActivations[0].profileName}*/}
          {point.profileActivations[0].profileName === 'Day' && <AiFillSun />}
          {point.profileActivations[0].profileName === 'Night' && <AiFillMoon />}
          {!point.profileActivations[0].profileName && <AiFillSetting />}
        </div>
      ) : (
        ''
      )}
      {point.alarms?.length ? (
        <div className={styles.alarm}>{situationsMappedForUI[point.alarms[0].situation]}</div>
      ) : (
        ''
      )}
    </div>
  )
}
