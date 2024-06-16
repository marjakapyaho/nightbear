import { getTimeInMillis, Point } from '@nightbear/shared'
import { TimeAgo } from '../timeAgo/TimeAgo'
import styles from './StatusBar.module.scss'
import { chain } from 'lodash'

type Props = {
  point?: Point
}

export const StatusBar = ({ point }: Props) => {
  const lastSensorEntry = chain(point?.sensorEntries)
    .sortBy('timestamp')
    .last()
    .value()
  const lastSensorEntryTimestamp = lastSensorEntry
    ? getTimeInMillis(lastSensorEntry.timestamp)
    : null

  return (
    <div className={styles.statusBar}>
      <div className={styles.status}>
        <span>
          {point ? (
            <TimeAgo
              timestamp={lastSensorEntryTimestamp || point.timestamp}
              decimalsForMinutes
              frequentUpdates
            />
          ) : (
            '-'
          )}
        </span>{' '}
        <span className={styles.smallerText}>ago</span>
      </div>
    </div>
  )
}
