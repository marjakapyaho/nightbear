import React from 'react';
import styles from './Config.module.scss';
import { useProfiles } from 'frontend/data/profiles/useProfiles';
import { useAlarms } from 'frontend/data/alarms/useAlarms';
import { DateTime } from 'luxon';

export const Config = () => {
  const { profiles, activateProfile } = useProfiles();
  const { alarms, ackAlarm } = useAlarms();
  const activeProfile = profiles.find(profile => Boolean(profile.activatedAt));

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
            {profile.name.toUpperCase()}
            {profile.activatedAt && (
              <span className={styles.activates}>
                Activated {DateTime.fromMillis(profile.activatedAt).toFormat('HH:mm')}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className={styles.section}>
        <h1 className={styles.heading}>Active alarms</h1>
        {alarms.map(alarm => (
          <button key={alarm.id} className={styles.alarm} onClick={() => ackAlarm(alarm)}>
            {alarm.type.toUpperCase()}
            {alarm.createdAt && (
              <span className={styles.created}>Created {DateTime.fromMillis(alarm.createdAt).toFormat('HH:mm')}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
