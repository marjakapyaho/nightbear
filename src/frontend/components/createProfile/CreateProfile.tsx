import React, { useState } from 'react';
import styles from 'frontend/pages/config/Config.module.scss';
import { Profile } from 'shared/types/profiles';
import { PROFILE_BASE } from 'shared/utils/profiles';
import { EditableProfileRow } from 'frontend/components/createProfile/EditableProfileRow';

type Props = {
  activeProfile?: Profile;
  createProfile: (profile: Profile) => void;
};

export const CreateProfile = ({ activeProfile, createProfile }: Props) => {
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
        label="Time since bg minutes"
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
