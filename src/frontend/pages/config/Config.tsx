import React, { useState } from 'react';
import styles from './Config.module.scss';
import { useProfiles } from 'frontend/data/profiles/useProfiles';
import { useAlarms } from 'frontend/data/alarms/useAlarms';
import { CreateProfile } from 'frontend/components/createProfile/CreateProfile';

export const Config = () => {
  const { profiles, activeProfile, activateProfile, createProfile, editProfile } = useProfiles();
  const { activeAlarm, ackActiveAlarm } = useAlarms();
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  return (
    <div className={styles.config}>
      <div className={styles.section}>
        <h1 className={styles.heading}>Profiles</h1>
        {profiles
          .filter(profile => profile.profileName)
          .map(profile => (
            <div
              key={profile.id}
              className={`${styles.profile} ${
                profile.id === activeProfile?.id ? styles.active : ''
              }`}
              onClick={() => activateProfile(profile)}
            >
              {profile.profileName?.toUpperCase()}
            </div>
          ))}
        <div
          className={styles.createProfileButton}
          onClick={() => setShowCreateProfile(!showCreateProfile)}
        >
          {showCreateProfile ? 'Hide' : '+ Edit or create profile'}
        </div>
        {showCreateProfile && (
          <CreateProfile
            activeProfile={activeProfile}
            createProfile={createProfile}
            editProfile={editProfile}
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
