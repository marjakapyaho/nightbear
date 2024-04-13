import React from 'react';
import styles from './Config.module.scss';
import { useProfiles } from 'frontend/data/profiles/useProfiles';
import { useAlarms } from 'frontend/data/alarms/useAlarms';

export const Config = () => {
  const { profiles, activeProfile, activateProfile } = useProfiles();
  const { alarms, ackAlarm } = useAlarms();

  return (
    <div className={styles.config}>
      <div className={styles.section}>
        <h1 className={styles.heading}>Profiles</h1>
        {profiles.map(profile => (
          <div
            key={profile.id}
            className={`${styles.profile} ${profile.id === activeProfile?.id ? styles.active : ''}`}
            onClick={() => activateProfile(profile)}
          >
            {profile.profileName.toUpperCase()}
          </div>
        ))}
      </div>
      <div className={styles.section}>
        <h1 className={styles.heading}>Active alarms</h1>
        {alarms.map(alarm => (
          <button key={alarm.id} className={styles.alarm} onClick={() => ackAlarm(alarm)}>
            {alarm.situationType.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
