import { getTimeInMillis, Point } from '@nightbear/shared'
import { TimeAgo } from '../timeAgo/TimeAgo'
import styles from './StatusBar.module.scss'
import { chain } from 'lodash'

type Props = {
  point?: Point
  lastLoaded?: number
  lastRefetched?: number
}

export const StatusBar = ({ point, lastLoaded, lastRefetched }: Props) => {
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
        <span className={styles.smallerText}>Sensor entry </span>
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
      <div className={styles.status}>
        <span className={styles.smallerText}>Loaded </span>
        <span>
          {lastLoaded ? <TimeAgo timestamp={lastLoaded} decimalsForMinutes frequentUpdates /> : '-'}
        </span>{' '}
        <span className={styles.smallerText}>ago</span>
      </div>
      <div className={styles.status}>
        <span className={styles.smallerText}>Refetched </span>
        <span>
          {lastRefetched ? (
            <TimeAgo timestamp={lastRefetched} decimalsForMinutes frequentUpdates />
          ) : (
            '-'
          )}
        </span>{' '}
        <span className={styles.smallerText}>ago</span>
      </div>
    </div>
  )
}
