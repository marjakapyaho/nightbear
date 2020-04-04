import { useReduxActions, useReduxState } from 'web/utils/react';
import React from 'react';
import { css } from 'emotion';

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

const profiles = [
  {
    profileName: 'Day',
    selected: true,
  },
  {
    profileName: 'Night',
    selected: false,
  },
  {
    profileName: 'OFF',
    selected: false,
  },
];

export default (() => {
  const configState = useReduxState(s => s.config);
  const actions = useReduxActions();

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
            <div className={styles.profile} style={profile.selected ? { background: '#7a7a7a', color: 'white' } : {}}>
              {profile.profileName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}) as React.FC<Props>;
