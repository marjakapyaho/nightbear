import styles from './ScrollableGraph.module.scss'
import { Point } from '@nightbear/shared'
import { FaSun } from 'react-icons/fa6'
import { AiFillMoon } from 'react-icons/ai'
import { RiSettings4Fill } from 'react-icons/ri'

type Props = {
  point: Point
}

export const ProfileActivation = ({ point }: Props) => {
  if (!point.profileActivations || point.profileActivations?.length === 0) {
    return
  }

  const isDay = point.profileActivations[0].profileName === 'Day'
  const isNight = point.profileActivations[0].profileName === 'Night'
  const isOther = !isDay && !isNight

  return (
    <div className={styles.profileName}>
      {isDay && <FaSun className={styles.sunIcon} />}
      {isNight && <AiFillMoon className={styles.moonIcon} />}
      {isOther && <RiSettings4Fill className={styles.settingsIcon} />}
    </div>
  )
}
