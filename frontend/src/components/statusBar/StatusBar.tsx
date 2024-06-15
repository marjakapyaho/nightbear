import { Point } from '@nightbear/shared'
import { TimeAgo } from '../timeAgo/TimeAgo'
import styles from './StatusBar.module.scss'

type Props = {
  graphPoint?: Point
}

export const StatusBar = ({ graphPoint }: Props) => {
  return (
    <div className={styles.statusBar}>
      <div className={styles.status}>
        <span>
          {graphPoint ? (
            <TimeAgo timestamp={graphPoint.timestamp} decimalsForMinutes frequentUpdates />
          ) : (
            '-'
          )}
        </span>{' '}
        <span className={styles.smallerText}>ago</span>
      </div>
    </div>
  )
}
