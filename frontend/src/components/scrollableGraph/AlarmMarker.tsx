import styles from './ScrollableGraph.module.scss'
import { Point } from '@nightbear/shared'
import { IoIosAlarm } from 'react-icons/io'
import { situationsMappedForUI } from './scrollableGraphUtils.ts'

type Props = {
  point: Point
  isSelected: boolean
}

export const AlarmMarker = ({ point, isSelected }: Props) => {
  if (!point.alarms || point.alarms?.length === 0) {
    return
  }

  return (
    <div className={styles.alarm}>
      {!isSelected && <IoIosAlarm />}
      {isSelected && (
        <div className={styles.situation}>
          {point.alarms.map(alarm => situationsMappedForUI[alarm.situation]).join(', ')}
        </div>
      )}
    </div>
  )
}
