import { SavedProfile } from 'core/models/model';
import { is, lastModel } from 'core/models/utils';
import { humanReadableShortTime, getActivationTimestamp } from 'core/utils/time';
import { css } from '@emotion/css';
import React, { useEffect, useState } from 'react';
import { useReduxActions, useReduxState } from 'web/utils/react';
import { pagePadding } from 'web/utils/config';
import { SEC_IN_MS } from 'core/calculations/calculations';

type Props = {};

const styles = {
  profile: css({
    padding: 20,
    background: 'whitesmoke',
    cursor: 'pointer',
    marginBottom: 10,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #eeeeee',
  }),
  activates: css({
    flex: 1,
    textAlign: 'right',
    fontSize: '13px',
  }),
  heading: css({
    fontSize: '16px',
  }),
  button: css({
    border: '1px solid rgb(239 211 75)',
    background: '#ffe358',
    color: '#887f59',
    fontWeight: 600,
    fontSize: '16px',
    padding: '20px',
    borderRadius: '6px',
    width: '100%',
    cursor: 'pointer',
  }),
};

export default (() => {
  const configState = useReduxState(s => s.config);
  const dataState = useReduxState(s => s.data);
  const actions = useReduxActions();

  const [showSuccess, setShowSuccess] = useState(false);

  const profiles = dataState.globalModels.filter(is('SavedProfile')).filter(profile => profile.profileName !== 'OFF');
  const activeProfile = dataState.timelineModels.filter(is('ActiveProfile')).find(lastModel);

  useEffect(() => {
    if (Date.now() - configState.ackLatestAlarmSucceededAt < SEC_IN_MS) {
      setShowSuccess(true);
    }
    setTimeout(() => setShowSuccess(false), SEC_IN_MS);
  }, [configState.ackLatestAlarmSucceededAt]);

  return (
    <div
      style={{
        padding: pagePadding,
      }}
    >
      <div>
        <h1 className={styles.heading}>Profiles</h1>
        <div>
          {profiles.map(profile => (
            <div
              key={profile.modelUuid}
              className={styles.profile}
              style={
                profile.profileName === activeProfile?.profileName
                  ? { background: '#7a7a7a', color: 'whitesmoke', border: '1px solid #7a7a7a' }
                  : {}
              }
              onClick={() => actions.PROFILE_ACTIVATED(profile, Date.now())}
            >
              {profile.profileName.toUpperCase()}
              {profile.activatedAtUtc && <span className={styles.activates}>Activated {getAutoActTime(profile)}</span>}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 30,
          right: 30,
        }}
      >
        <div>
          <div>
            <button
              className={styles.button}
              style={showSuccess ? { background: '#91b85c', color: 'white', border: '1px solid #91b85c' } : {}}
              onClick={() => actions.ACK_LATEST_ALARM_STARTED()}
              disabled={showSuccess}
            >
              {showSuccess ? 'SUCCESS' : 'ACK ALARM'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}) as React.FC<Props>;

function getAutoActTime(profile: SavedProfile): string {
  if (!profile.activatedAtUtc) return '';
  return humanReadableShortTime(getActivationTimestamp(profile.activatedAtUtc));
}
