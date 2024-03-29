import React, { useEffect, useState } from 'react';
import { useReduxActions, useReduxState } from 'frontend/utils/react';
import { SEC_IN_MS } from 'shared/calculations/calculations';
import styles from './Config.module.scss';
import { getActiveProfile, getAutoActTime, getProfiles, isProfileActive } from './configUtils';

export const Config = () => {
  const configState = useReduxState(s => s.config);
  const dataState = useReduxState(s => s.data);
  const actions = useReduxActions();
  const profiles = getProfiles(dataState);
  const activeProfile = getActiveProfile(dataState);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (Date.now() - configState.ackLatestAlarmSucceededAt < SEC_IN_MS) {
      setShowSuccess(true);
    }
    setTimeout(() => setShowSuccess(false), SEC_IN_MS);
  }, [configState.ackLatestAlarmSucceededAt]);

  return (
    <div className={styles.config}>
      <h1 className={styles.profilesHeading}>Profiles</h1>
      <div>
        {profiles.map(profile => (
          <div
            key={profile.modelUuid}
            className={`${styles.profile} ${isProfileActive(profile, activeProfile) ? styles.active : ''}`}
            onClick={() => actions.PROFILE_ACTIVATED(profile, Date.now())}
          >
            {profile.profileName.toUpperCase()}
            {profile.activatedAtUtc && <span className={styles.activates}>Activated {getAutoActTime(profile)}</span>}
          </div>
        ))}
      </div>
      <div className={styles.buttonWrapper}>
        <button
          className={`${styles.button} ${showSuccess ? styles.success : ''}`}
          onClick={() => actions.ACK_LATEST_ALARM_STARTED()}
          disabled={showSuccess}
        >
          {showSuccess ? 'SUCCESS' : 'ACK ALARM'}
        </button>
      </div>
    </div>
  );
};
