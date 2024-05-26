import styles from './Config.module.scss'
import { useProfiles } from '../../data/profiles/useProfiles'
import { useAlarms } from '../../data/alarms/useAlarms'
import { ProfileEditor } from '../../components/profileEditor/ProfileEditor'

export const Config = () => {
  const { profiles, activeProfile, activateProfile, createProfile, editProfile } = useProfiles()
  const { activeAlarm, ackActiveAlarm } = useAlarms()

  return (
    <div className={styles.config}>
      <div className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Profiles</h1>
          <div className={styles.activeProfile}>
            <span>Active profile: </span>
            <strong>{activeProfile?.profileName || 'Temporary'}</strong>
          </div>
        </div>
        {activeProfile && (
          <ProfileEditor
            activeProfile={activeProfile}
            activateProfile={activateProfile}
            editProfile={editProfile}
            createProfile={createProfile}
            profiles={profiles}
          />
        )}
      </div>
      <div className={styles.section}>
        <h1 className={styles.heading}>Active alarms</h1>
        {activeAlarm ? (
          <button key={activeAlarm.id} className={styles.alarm} onClick={() => ackActiveAlarm()}>
            {activeAlarm.situation.toUpperCase()}
          </button>
        ) : (
          '-'
        )}
      </div>
    </div>
  )
}
