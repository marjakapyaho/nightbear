import React, { useState } from 'react';
import styles from './Config.module.scss';
import { useProfiles } from 'frontend/data/profiles/useProfiles';
import { useAlarms } from 'frontend/data/alarms/useAlarms';
import { CreateProfile } from 'frontend/pages/config/CreateProfile';

export const Config = () => {
  const { profiles, activeProfile, activateProfile, createProfile } = useProfiles();
  const { activeAlarm, ackActiveAlarm } = useAlarms();
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  // TODO: createProfile UI
  console.log(activeProfile);

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
            {profile.profileName?.toUpperCase()}
          </div>
        ))}
        <div
          className={styles.createProfileButton}
          onClick={() => setShowCreateProfile(!showCreateProfile)}
        >
          + Create new profile
        </div>
        {showCreateProfile && activeProfile && (
          <CreateProfile activeProfile={activeProfile} createProfile={createProfile} />
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
