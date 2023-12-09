import { SavedProfile } from 'core/models/model';
import { is, lastModel } from 'core/models/utils';
import { humanReadableShortTime, getActivationTimestamp } from 'core/utils/time';
import { css } from '@emotion/css';
import React from 'react';
import { useReduxActions, useReduxState } from 'web/utils/react';
import { pagePadding } from 'web/utils/config';

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
  }),
};

export default (() => {
  const dataState = useReduxState(s => s.data);
  const actions = useReduxActions();

  const profiles = dataState.globalModels.filter(is('SavedProfile')).filter(profile => profile.profileName !== 'OFF');
  const activeProfile = dataState.timelineModels.filter(is('ActiveProfile')).find(lastModel);

  return (
    <div
      style={{
        padding: pagePadding,
      }}
    >
      <div
        style={{
          paddingTop: 0,
        }}
      >
        <h1 className={styles.heading}>Ack alarm</h1>
        <div>
          <button className={styles.button} onClick={() => actions.ACK_LATEST_ALARM_STARTED()}>
            ACK ALARM
          </button>
        </div>
      </div>

      <div
        style={{
          paddingTop: 30,
        }}
      >
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
    </div>
  );
}) as React.FC<Props>;

function getAutoActTime(profile: SavedProfile): string {
  if (!profile.activatedAtUtc) return '';
  return humanReadableShortTime(getActivationTimestamp(profile.activatedAtUtc));
}
