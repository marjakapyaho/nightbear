import { is, last } from 'core/models/utils';
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
  const activeProfile = dataState.timelineModels.filter(is('ActiveProfile')).find(last);

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
              className={styles.profile}
              style={
                profile.profileName === activeProfile?.profileName ? { background: '#7a7a7a', color: 'white' } : {}
              }
            >
              {profile.profileName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}) as React.FC<Props>;
