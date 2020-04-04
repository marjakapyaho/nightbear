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
};

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
          <div
            style={{
              padding: 20,
              background: '#7a7a7a',
              color: 'white',
              cursor: 'pointer',
              marginBottom: 10,
            }}
          >
            Day
          </div>
          <div
            style={{
              padding: 20,
              background: 'whitesmoke',
              cursor: 'pointer',
              marginBottom: 10,
            }}
          >
            Night
          </div>
          <div
            style={{
              padding: 20,
              background: 'whitesmoke',
              cursor: 'pointer',
              marginBottom: 10,
            }}
          >
            OFF
          </div>
        </div>
      </div>
    </div>
  );
}) as React.FC<Props>;
