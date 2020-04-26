import { SavedProfile } from 'core/models/model';
import { is, lastModel } from 'core/models/utils';
import { humanReadableShortTime, getActivationTimestamp } from 'core/utils/time';
import { css } from 'emotion';
import React, { useEffect } from 'react';
import { useReduxActions, useReduxState } from 'web/utils/react';
import { Checkbox } from 'pretty-checkbox-react';
import { fontColor } from 'web/utils/colors';
import { fontSize, pagePadding } from 'web/utils/config';

type Props = {};

const checkboxStyles = { display: 'block', marginBottom: 20, color: fontColor, fontSize: fontSize };

const styles = {
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

  useEffect(() => {
    actions.UI_NAVIGATED('ConfigScreen');
    // eslint-disable-next-line
  }, []);

  const profiles = dataState.globalModels.filter(is('SavedProfile')).filter(profile => profile.profileName !== 'OFF');
  const activeProfile = dataState.timelineModels.filter(is('ActiveProfile')).find(lastModel);

  return (
    <div
      style={{
        padding: pagePadding,
      }}
    >
      <Checkbox
        style={checkboxStyles}
        className="p-curve"
        state={configState.autoRefreshData}
        onChange={actions.AUTO_REFRESH_TOGGLED}
      >
        Auto-refresh timeline data
      </Checkbox>
      <Checkbox
        style={checkboxStyles}
        className="p-curve"
        state={configState.zoomedInTimeline}
        onChange={actions.ZOOMED_IN_TIMELINE_TOGGLED}
      >
        Zoomed in timeline
      </Checkbox>
      <div
        style={{
          paddingTop: 20,
        }}
      >
        <h1>Misc</h1>
        <div>
          <button onClick={() => actions.ACK_LATEST_ALARM_STARTED()}>Ack latest alarm</button>
        </div>
      </div>

      <div
        style={{
          paddingTop: 20,
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
    </div>
  );
}) as React.FC<Props>;

function getAutoActTime(profile: SavedProfile): string {
  if (!profile.activatedAtUtc) return '';
  return humanReadableShortTime(getActivationTimestamp(profile.activatedAtUtc));
}
