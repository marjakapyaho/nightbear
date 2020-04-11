import { SavedProfile } from 'core/models/model';
import { is, lastModel } from 'core/models/utils';
import { humanReadableShortTime } from 'core/utils/time';
import { css } from 'emotion';
import React from 'react';
import { useReduxActions, useReduxState } from 'web/utils/react';

type Props = {};

const styles = {
  checkbox: css({
    display: 'block',
    padding: 10,
    margin: 10,
  }),
  profile: css({
    padding: 20,
    background: 'whitesmoke',
    cursor: 'pointer',
    marginBottom: 10,
  }),
};

export default (() => {
  const configState = useReduxState(s => s.config);
  const dataState = useReduxState(s => s.data);
  const actions = useReduxActions();

  const profiles = dataState.globalModels.filter(is('SavedProfile'));
  const activeProfile = dataState.timelineModels.filter(is('ActiveProfile')).find(lastModel);

  return (
    <div>
      <label className={styles.checkbox}>
        <input type="checkbox" checked={configState.showRollingAnalysis} onChange={actions.ROLLING_ANALYSIS_TOGGLED} />
        Show rolling analysis
      </label>
      <label className={styles.checkbox}>
        <input type="checkbox" checked={configState.autoRefreshData} onChange={actions.AUTO_REFRESH_TOGGLED} />
        Auto-refresh timeline data
      </label>
      <label className={styles.checkbox}>
        <input type="checkbox" checked={configState.zoomedInTimeline} onChange={actions.ZOOMED_IN_TIMELINE_TOGGLED} />
        Zoomed in timeline
      </label>

      <div
        style={{
          padding: 20,
        }}
      >
        <h1>Profiles</h1>
        <div>
          {profiles.map(profile => (
            <div
              key={profile.modelUuid}
              className={styles.profile}
              style={
                profile.profileName === activeProfile?.profileName ? { background: '#7a7a7a', color: 'white' } : {}
              }
              onClick={() => actions.PROFILE_ACTIVATED(profile, Date.now())}
            >
              {profile.profileName}
              {profile.activatedAtUtc && <span>&nbsp;(activates {getAutoActTime(profile)})</span>}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: 20,
        }}
      >
        <h1>Misc</h1>
        <div>
          <button onClick={() => actions.ACK_LATEST_ALARM_STARTED()}>Ack latest alarm</button>
        </div>
      </div>
    </div>
  );
}) as React.FC<Props>;

function getAutoActTime(profile: SavedProfile): string {
  if (!profile.activatedAtUtc) return '';
  const d = new Date();
  d.setUTCHours(profile.activatedAtUtc.hours);
  d.setUTCMinutes(profile.activatedAtUtc.minutes);
  d.setUTCSeconds(0);
  return humanReadableShortTime(d.getTime());
}
