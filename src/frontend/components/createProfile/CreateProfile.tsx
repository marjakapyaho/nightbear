import React, { useState } from 'react';
import styles from 'frontend/pages/config/Config.module.scss';
import { Profile } from 'shared/types/profiles';
import { PROFILE_BASE } from 'shared/utils/profiles';
import { EditableProfileRow } from 'frontend/components/createProfile/EditableProfileRow';

type Props = {
  activeProfile?: Profile;
  createProfile: (profile: Profile) => void;
  profiles: Profile[];
};

export const CreateProfile = ({ activeProfile, createProfile, profiles }: Props) => {
  const [localProfile, setLocalProfile] = useState<Profile>(activeProfile || PROFILE_BASE);

  const setAnalyserSetting = (val: number, settingKey: string) =>
    setLocalProfile({
      ...localProfile,
      analyserSettings: {
        ...localProfile.analyserSettings,
        [settingKey]: val,
      },
    });

  return (
    <div className={styles.createProfile}>
      <div className={styles.row}>
        <div className={styles.label}>Base profile</div>
        <div className={styles.field}>
          <select
            className={styles.profileSelector}
            name="profiles"
            id="baseProfileSelect"
            onChange={event => {
              const selectedBaseProfile = profiles.find(
                profile => profile.id === event.target.value,
              );
              selectedBaseProfile && setLocalProfile(selectedBaseProfile);
            }}
          >
            {profiles.map((profile: Profile) =>
              profile.id ? (
                <option key={profile.id} value={profile.id}>
                  {profile.profileName}
                </option>
              ) : null,
            )}
          </select>
        </div>
      </div>
      <EditableProfileRow
        label="Profile name"
        value={localProfile.profileName}
        setValue={val => setLocalProfile({ ...localProfile, profileName: val })}
      />
      <EditableProfileRow
        label="High level rel"
        value={localProfile.analyserSettings.highLevelRel}
        setValue={val => setAnalyserSetting(parseFloat(val), 'highLevelRel')}
      />
      <EditableProfileRow
        label="High level abs"
        value={localProfile.analyserSettings.highLevelAbs}
        setValue={val => setAnalyserSetting(parseFloat(val), 'highLevelAbs')}
      />
      <EditableProfileRow
        label="High level bad"
        value={localProfile.analyserSettings.highLevelBad}
        setValue={val => setAnalyserSetting(parseFloat(val), 'highLevelBad')}
      />
      <EditableProfileRow
        label="Low level rel"
        value={localProfile.analyserSettings.lowLevelRel}
        setValue={val => setAnalyserSetting(parseFloat(val), 'lowLevelRel')}
      />
      <EditableProfileRow
        label="Low level abs"
        value={localProfile.analyserSettings.lowLevelAbs}
        setValue={val => setAnalyserSetting(parseFloat(val), 'lowLevelAbs')}
      />
      <EditableProfileRow
        label="Time since bg min"
        value={localProfile.analyserSettings.timeSinceBgMinutes}
        setValue={val => setAnalyserSetting(parseFloat(val), 'timeSinceBgMinutes')}
      />
      <div>
        <button className={styles.createButton} onClick={() => createProfile(localProfile)}>
          Create
        </button>
      </div>
    </div>
  );
};
