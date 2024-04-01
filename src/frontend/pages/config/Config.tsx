import React from 'react';
import styles from './Config.module.scss';

type Profile = {
  id: string;
  name: string;
  activatedAt?: number;
};

export const Config = () => {
  const profiles: Profile[] = [{ id: '1234', name: 'Day' }];
  const activeProfile: Profile | null = { id: '1234', name: 'Day', activatedAt: Date.now() };
  const ackedAlarm = false;

  return (
    <div className={styles.config}>
      <h1 className={styles.profilesHeading}>Profiles</h1>
      <div>
        {profiles.map(profile => (
          <div
            key={profile.id}
            className={`${styles.profile} ${profile.id === activeProfile?.id ? styles.active : ''}`}
            onClick={() => console.log('Activate profile')}
          >
            {profile.name.toUpperCase()}
            {profile.activatedAt && <span className={styles.activates}>Activated {profile.activatedAt}</span>}
          </div>
        ))}
      </div>
      <div className={styles.buttonWrapper}>
        <button
          className={`${styles.button} ${ackedAlarm ? styles.success : ''}`}
          onClick={() => console.log('Ack alarm')}
          disabled={ackedAlarm}
        >
          {ackedAlarm ? 'SUCCESS' : 'ACK ALARM'}
        </button>
      </div>
    </div>
  );
};
