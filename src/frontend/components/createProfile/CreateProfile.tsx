import React, { useState } from 'react';
import styles from 'frontend/pages/config/Config.module.scss';
import { AnalyserSettings, Profile } from 'shared/types/profiles';
import { PROFILE_BASE } from 'shared/utils/profiles';
import { EditableProfileRow } from 'frontend/components/createProfile/EditableProfileRow';
import { InputText } from 'frontend/components/inputText/InputText';
import { InputNumber } from 'frontend/components/inputNumber/InputNumber';
import { HOUR_IN_MS } from 'shared/utils/calculations';

type Props = {
  activeProfile?: Profile;
  createProfile: (profile: Profile, validityInMs: number) => void;
  editProfile: (profile: Profile) => void;
  profiles: Profile[];
};

type EditableAnalyserSetting = {
  key: keyof AnalyserSettings;
  label: string;
  decimals: number;
};

export const CreateProfile = ({ activeProfile, createProfile, editProfile, profiles }: Props) => {
  const baseProfile = activeProfile ? activeProfile : PROFILE_BASE;
  const [localProfile, setLocalProfile] = useState<Profile>(baseProfile);
  const [validityInHours, setValidityInHours] = useState(1);
  const [mode, setMode] = useState('edit');

  const setAnalyserSetting = (val: number, settingKey: string) =>
    setLocalProfile({
      ...localProfile,
      analyserSettings: {
        ...localProfile.analyserSettings,
        [settingKey]: val,
      },
    });

  const editableAnalyserSettings: EditableAnalyserSetting[] = [
    { key: 'highLevelRel', label: 'High level rel', decimals: 1 },
    { key: 'highLevelAbs', label: 'High level abs', decimals: 1 },
    { key: 'highLevelBad', label: 'High level bad', decimals: 1 },
    { key: 'lowLevelRel', label: 'Low level rel', decimals: 1 },
    { key: 'lowLevelAbs', label: 'Low level abs', decimals: 1 },
    { key: 'timeSinceBgMinutes', label: 'Time since bg min', decimals: 0 },
  ];

  return (
    <div className={styles.createProfile}>
      <div className={styles.editOrCreateSelection}>
        <div
          className={`${styles.selection} ${mode === 'edit' ? styles.selected : ''}`}
          onClick={() => setMode('edit')}
        >
          Edit profile
        </div>
        <div
          className={`${styles.selection} ${mode === 'create' ? styles.selected : ''}`}
          onClick={() => setMode('create')}
        >
          Create profile
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>{mode === 'create' ? 'Base profile' : 'Profile'}</div>
        <div className={styles.field}>
          <select
            className={styles.profileSelector}
            name="profiles"
            id="baseProfileSelect"
            defaultValue={localProfile.id || ''}
            onChange={event => {
              const selectedBaseProfile = profiles.find(
                profile => profile.id === event.target.value,
              );
              selectedBaseProfile && setLocalProfile({ ...selectedBaseProfile, profileName: '' });
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
      <EditableProfileRow label="Profile name">
        <InputText
          value={localProfile.profileName || ''}
          setValue={val => setLocalProfile({ ...localProfile, profileName: val || undefined })}
        />
      </EditableProfileRow>
      {/*      <EditableProfileRow label="Repeat time">
        <InputText
          value={localProfile.profileName || ''}
          setValue={val => setLocalProfile({ ...localProfile, profileName: val || undefined })}
        />
      </EditableProfileRow>*/}
      {mode === 'create' && (
        <EditableProfileRow label="Valid (h)">
          <InputNumber value={validityInHours} setValue={setValidityInHours} decimals={0} />
        </EditableProfileRow>
      )}
      {editableAnalyserSettings.map(setting => (
        <EditableProfileRow key={setting.key} label={setting.label}>
          <InputNumber
            value={localProfile.analyserSettings[setting.key]}
            setValue={val => setAnalyserSetting(val, setting.key)}
            decimals={setting.decimals}
          />
        </EditableProfileRow>
      ))}
      <div>
        {mode === 'create' ? (
          <button
            className={styles.createButton}
            onClick={() => createProfile(localProfile, validityInHours * HOUR_IN_MS)}
          >
            Create
          </button>
        ) : (
          <button className={styles.createButton} onClick={() => editProfile(localProfile)}>
            Edit
          </button>
        )}
      </div>
    </div>
  );
};
