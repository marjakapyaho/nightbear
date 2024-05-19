import React from 'react';
import styles from './Config.module.scss';
import { useProfiles } from 'frontend/data/profiles/useProfiles';
import { useAlarms } from 'frontend/data/alarms/useAlarms';
import { ProfileEditor } from 'frontend/components/profileEditor/ProfileEditor';

export const Config = () => {
  const { profiles, activeProfile, activateProfile, createProfile, editProfile } = useProfiles();
  const { activeAlarm, ackActiveAlarm } = useAlarms();

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
  );
};
